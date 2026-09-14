// ===========================================
// Contrôleur Users
// ===========================================

import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ===========================================
  // LISTE DES UTILISATEURS (Admin)
  // ===========================================
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Liste des utilisateurs (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: Role,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ page, limit, role, search });
  }

  // ===========================================
  // RECHERCHE D'UN CLIENT (comptoir)
  // ===========================================
  // Declaree avant @Get(':id'), qui l'absorberait sinon : « search » serait
  // pris pour un identifiant.
  @Get('search')
  @Roles('EMPLOYEE', 'ADMIN')
  @ApiOperation({
    summary: 'Rechercher un client par nom, prénom ou adresse',
    description:
      'Destinee au comptoir : ne rend que de quoi identifier une personne venue retirer ' +
      'son lot. Bornee aux comptes clients, et limitee aux dix premieres correspondances - ' +
      '`total` indique combien la recherche en compte au total.',
  })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Deux caractères minimum' })
  @ApiResponse({
    status: 200,
    description: 'Clients correspondants',
    schema: {
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Réservé au personnel' })
  async searchClients(@Query('q') q?: string) {
    return this.usersService.searchClients(q ?? '');
  }

  // ===========================================
  // DÉTAIL D'UN UTILISATEUR
  // ===========================================
  @Get(':id')
  @ApiOperation({ summary: "Détail d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    // Un client ne peut voir que son propre profil
    const targetId = currentUser.role === 'CLIENT' ? currentUser.id : id;
    const user = await this.usersService.findById(targetId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    // Ne jamais exposer le hash du mot de passe
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ===========================================
  // MISE À JOUR D'UN UTILISATEUR
  // ===========================================
  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un utilisateur',
    description:
      'Un client ne peut modifier que son propre profil, et ne peut pas y changer son adresse ' +
      'e-mail. Seuls les rôles EMPLOYEE et ADMIN peuvent modifier une adresse.',
  })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiResponse({
    status: 403,
    description: 'Un client a tenté de modifier son adresse e-mail',
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 409, description: 'Adresse e-mail déjà utilisée' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    // Seul un administrateur agit sur le compte d'autrui. Le motif precedent
    // - « client ? soi : id » - rangeait l'employe avec l'administrateur, ce
    // qui lui laissait modifier n'importe quel profil, y compris celui d'un
    // administrateur, dont l'adresse de connexion.
    const targetId = currentUser.role === 'ADMIN' ? id : currentUser.id;

    // L'adresse identifie le compte et sert à la connexion. La laisser changer
    // sans revérification permettrait, depuis une session ouverte, de basculer
    // le compte vers une autre adresse puis d'en reprendre l'accès par le
    // formulaire de connexion.
    //
    // Refus explicite plutôt que retrait silencieux du champ : ignorer l'envoi
    // renverrait un 200 laissant croire au changement.
    if (currentUser.role !== 'ADMIN' && dto.email !== undefined) {
      throw new ForbiddenException(
        "L'adresse e-mail ne peut pas être modifiée depuis votre profil.",
      );
    }

    // Même raisonnement pour le mot de passe : l'accepter ici permettrait de le
    // changer sans connaître l'actuel, donc de verrouiller le compte hors de
    // son titulaire depuis une session ouverte. Le passage obligé est
    // PUT :id/password, qui exige le mot de passe en cours.
    if (currentUser.role !== 'ADMIN' && dto.password !== undefined) {
      throw new ForbiddenException(
        'Utilisez le changement de mot de passe dédié, qui exige le mot de passe actuel.',
      );
    }

    const { password: _password, ...user } = await this.usersService.update(targetId, dto);
    return user;
  }

  // ===========================================
  // CHANGEMENT DE MOT DE PASSE
  // ===========================================
  @Put(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Changer ou définir son mot de passe',
    description:
      "Exige le mot de passe actuel, sauf lorsque le compte n'en a pas encore : créé par " +
      "Google ou Facebook, il en définit un pour la première fois. C'est le seul chemin " +
      'permettant de changer son mot de passe, la mise à jour de profil le refuse. ' +
      "L'identifiant de l'URL est ignoré : la route agit toujours sur le titulaire du jeton.",
  })
  @ApiResponse({ status: 204, description: 'Mot de passe changé ou défini' })
  @ApiResponse({ status: 400, description: 'Mot de passe actuel manquant' })
  @ApiResponse({ status: 403, description: 'Mot de passe actuel incorrect' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() currentUser: User) {
    // La route agit sur le titulaire du jeton, quel que soit son rôle.
    //
    // Auparavant, seul un client était ramené à son propre compte : un employé
    // ou un administrateur pouvait viser l'identifiant d'autrui. C'était sans
    // effet tant que l'ancien mot de passe était exigé. Depuis qu'un compte
    // sans mot de passe peut en définir un sans le fournir, la même latitude
    // permettrait de s'octroyer l'accès à n'importe quel compte créé par
    // Google ou Facebook, puis de s'y connecter.
    //
    // Aucun usage légitime n'en dépend : l'interface n'appelle cette route
    // qu'avec l'identifiant du titulaire.
    await this.usersService.changePassword(currentUser.id, dto);
  }

  // ===========================================
  // SUPPRESSION D'UN UTILISATEUR (RGPD)
  // ===========================================
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un utilisateur (anonymisation RGPD)',
    description:
      'Un membre du personnel ne peut pas supprimer son propre compte : la demande doit ' +
      'passer par un autre administrateur.',
  })
  @ApiResponse({ status: 204, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 403, description: 'Un membre du personnel vise son propre compte' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async delete(@Param('id') id: string, @CurrentUser() currentUser: User) {
    // Seul un administrateur supprime le compte d'autrui.
    const targetId = currentUser.role === 'ADMIN' ? id : currentUser.id;

    // Un employé ou un administrateur ne se supprime pas lui-même.
    //
    // Le droit à l'effacement s'exerce sur un compte de participant, pas sur
    // une habilitation d'exploitation : un employé emporterait avec lui la
    // trace des lots qu'il a remis, et le dernier administrateur fermerait la
    // porte du back-office derrière lui. La demande passe par un autre
    // administrateur, qui reste libre de l'accorder.
    if (currentUser.role !== 'CLIENT' && targetId === currentUser.id) {
      throw new ForbiddenException(
        'Un compte du personnel ne peut pas être supprimé par son titulaire. ' +
          'Adressez la demande à un autre administrateur.',
      );
    }

    await this.usersService.delete(targetId);
  }

  // ===========================================
  // GAINS D'UN UTILISATEUR
  // ===========================================
  @Get(':id/gains')
  @ApiOperation({
    summary: "Historique des participations et lots d'un utilisateur",
    description:
      "Rend les participations, le lot associé à chaque code et l'état de la remise. " +
      'Un client ne peut consulter que les siens.',
  })
  @ApiResponse({ status: 200, description: "Gains de l'utilisateur" })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getGains(@Param('id') id: string, @CurrentUser() currentUser: User) {
    // Meme regle que l'export : seul un administrateur consulte le dossier
    // d'autrui. Un employe voit les lots a remettre par /gains/pending, il n'a
    // pas a parcourir l'historique de jeu d'un client.
    const targetId = currentUser.role === 'ADMIN' ? id : currentUser.id;
    return this.usersService.getGains(targetId);
  }

  // ===========================================
  // EXPORT DES DONNÉES (RGPD)
  // ===========================================
  @Get(':id/export')
  @ApiOperation({ summary: 'Exporter les données personnelles (RGPD)' })
  @ApiResponse({ status: 200, description: 'Données exportées' })
  async exportData(@Param('id') id: string, @CurrentUser() currentUser: User) {
    // L'export livre le dossier personnel complet - identite, telephone, date
    // de naissance, genre, consentements, participations et tickets. Seul un
    // administrateur peut l'obtenir pour autrui.
    const targetId = currentUser.role === 'ADMIN' ? id : currentUser.id;
    return this.usersService.exportData(targetId);
  }

  // ===========================================
  // CHANGEMENT DE RÔLE (Admin)
  // ===========================================
  @Put(':id/role')
  @Roles('ADMIN')
  @ApiOperation({ summary: "Changer le rôle d'un utilisateur (Admin)" })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour' })
  async changeRole(@Param('id') id: string, @Body('role') role: Role) {
    const { password: _password, ...user } = await this.usersService.changeRole(id, role);
    return user;
  }
}
