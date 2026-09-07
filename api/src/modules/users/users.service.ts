// ===========================================
// Service Users
// ===========================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { User, Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  // Un code de ticket fait 10 caracteres tires de l'alphabet de generation
  // (prisma/seed.ts), qui ecarte I, O, 0 et 1 pour eviter les confusions de
  // lecture. On accepte les fragments a partir de 6 caracteres : plus court,
  // la saisie est presque toujours un debut de nom, et « jean » ou « paul »
  // declencheraient la jointure pour rien.
  private static readonly RESSEMBLE_A_UN_CODE = /^[A-HJ-NP-Za-hj-np-z2-9]{6,10}$/;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
  ) {}

  /**
   * Recherche un utilisateur par email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  /**
   * Recherche un utilisateur par ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Recherche un utilisateur par Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  /**
   * Recherche un utilisateur par Facebook ID
   */
  async findByFacebookId(facebookId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { facebookId },
    });
  }

  /**
   * Liste tous les utilisateurs (admin)
   */
  async findAll(options: { page?: number; limit?: number; role?: Role; search?: string }) {
    const { page = 1, limit = 20, role, search } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];

      // Recherche par code de ticket, en plus de l'identite. La jointure porte
      // sur 500 000 tickets : on ne l'ajoute que si la saisie peut etre un
      // code, sinon chaque frappe d'un debut de nom la declencherait pour rien.
      if (UsersService.RESSEMBLE_A_UN_CODE.test(search.trim())) {
        where.OR.push({
          participations: {
            some: { ticket: { code: { contains: search.trim().toUpperCase() } } },
          },
        });
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          gender: true,
          birthDate: true,
          createdAt: true,
          consentEmail: true,
          _count: {
            select: { participations: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Recherche d'un client par nom, prénom ou adresse, pour le comptoir.
   *
   * Distincte de `findAll`, qui sert l'administration : celle-ci ne rend que de
   * quoi identifier une personne venue retirer son lot, et rien de plus. Ni
   * date de naissance, ni genre, ni consentement, ni rôle - un employé n'en a
   * pas l'usage, et le RGPD demande de s'en tenir au nécessaire.
   *
   * Bornée aux comptes clients : un employé n'a pas à énumérer ceux du
   * personnel.
   */
  async searchClients(query: string, limit = 10) {
    const recherche = query.trim();

    // Une recherche vide ramènerait toute la base, ce qui n'est pas une
    // recherche mais un annuaire.
    if (recherche.length < 2) {
      return { data: [], total: 0 };
    }

    const where = {
      deletedAt: null,
      role: Role.CLIENT,
      OR: [
        { email: { contains: recherche, mode: 'insensitive' as const } },
        { firstName: { contains: recherche, mode: 'insensitive' as const } },
        { lastName: { contains: recherche, mode: 'insensitive' as const } },
      ],
    };

    const [clients, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take: limit,
        orderBy: { lastName: 'asc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          _count: { select: { participations: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // `total` accompagne une liste tronquée : sans lui, l'employé croirait
    // avoir tout vu alors que sa recherche est trop large.
    return { data: clients, total };
  }

  /**
   * Met à jour un utilisateur
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Si changement d'email, vérifier qu'il n'existe pas déjà
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Si changement de mot de passe, le hasher
    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email?.toLowerCase().trim(),
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        gender: dto.gender,
        phone: dto.phone,
        password: hashedPassword,
        consentEmail: dto.consentEmail,
      },
    });
  }

  /**
   * Soft delete d'un utilisateur (RGPD)
   */
  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Soft delete avec anonymisation des données personnelles
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        email: `deleted-${id}@anonymized.local`,
        firstName: 'Utilisateur',
        lastName: 'Supprimé',
        phone: null,
        googleId: null,
        facebookId: null,
      },
    });
  }

  /**
   * Gains d'un utilisateur : ses participations, le lot associé à chaque code
   * et l'état de la remise.
   *
   * Distinct de `exportData`, qui rend le dossier personnel complet au titre du
   * RGPD : ici on ne veut que l'historique de jeu, enrichi des métadonnées du
   * lot (nom, valeur) que la table tickets ne porte pas - elle n'en garde que
   * le type.
   */
  async getGains(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const [participations, prizesMap] = await Promise.all([
      this.prisma.participation.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          prizeDelivered: true,
          prizeDeliveredAt: true,
          deliveryMethod: true,
          ticket: { select: { code: true, prizeType: true } },
        },
      }),
      this.ticketsService.getPrizesMap(),
    ]);

    return {
      user,
      data: participations.map((p) => ({
        id: p.id,
        code: p.ticket.code,
        prizeType: p.ticket.prizeType,
        prize: prizesMap[p.ticket.prizeType],
        participatedAt: p.createdAt,
        prizeDelivered: p.prizeDelivered,
        prizeDeliveredAt: p.prizeDeliveredAt,
        deliveryMethod: p.deliveryMethod,
      })),
      meta: {
        total: participations.length,
        delivered: participations.filter((p) => p.prizeDelivered).length,
      },
    };
  }

  /**
   * Exporte les données d'un utilisateur (RGPD)
   */
  async exportData(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        participations: {
          include: {
            ticket: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const { password: _password, ...userData } = user;
    return userData;
  }

  /**
   * Change le mot de passe en exigeant l'actuel.
   *
   * Cette vérification est tout l'intérêt de la méthode : sans elle, une
   * session ouverte suffirait à verrouiller le compte hors de son titulaire.
   */
  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Compte créé par Google ou Facebook : il n'a pas encore de mot de passe,
    // et il en définit un ici pour la première fois. Exiger un « mot de passe
    // actuel » inexistant n'apporterait aucune sécurité et l'enfermerait dans
    // son fournisseur d'identité - un problème réel depuis que la connexion
    // Facebook ne peut plus être proposée au public.
    //
    // La session suffit à prouver l'identité : la route est derrière
    // JwtAuthGuard, et le contrôleur vérifie déjà que l'identifiant vise bien
    // le titulaire du jeton.
    if (user.password) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Le mot de passe actuel est requis');
      }

      const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isCurrentValid) {
        throw new ForbiddenException('Mot de passe actuel incorrect');
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(dto.newPassword, 12) },
    });
  }

  /**
   * Change le rôle d'un utilisateur (admin)
   */
  async changeRole(id: string, role: Role): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
