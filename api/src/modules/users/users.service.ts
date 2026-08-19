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
import { User, Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Compte créé par Social Login : il n'y a aucun mot de passe à comparer,
    // donc aucun moyen de prouver ici que la demande vient bien du titulaire.
    if (!user.password) {
      throw new BadRequestException(
        "Ce compte se connecte via Google ou Facebook et n'a pas de mot de passe à modifier.",
      );
    }

    const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentValid) {
      throw new ForbiddenException('Mot de passe actuel incorrect');
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
