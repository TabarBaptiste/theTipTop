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
    // Un client ne peut modifier que son propre profil
    const targetId = currentUser.role === 'CLIENT' ? currentUser.id : id;

    // L'adresse identifie le compte et sert à la connexion. La laisser changer
    // sans revérification permettrait, depuis une session ouverte, de basculer
    // le compte vers une autre adresse puis d'en reprendre l'accès par le
    // formulaire de connexion.
    //
    // Refus explicite plutôt que retrait silencieux du champ : ignorer l'envoi
    // renverrait un 200 laissant croire au changement.
    if (currentUser.role === 'CLIENT' && dto.email !== undefined) {
      throw new ForbiddenException(
        "L'adresse e-mail ne peut pas être modifiée depuis votre profil.",
      );
    }

    // Même raisonnement pour le mot de passe : l'accepter ici permettrait de le
    // changer sans connaître l'actuel, donc de verrouiller le compte hors de
    // son titulaire depuis une session ouverte. Le passage obligé est
    // PUT :id/password, qui exige le mot de passe en cours.
    if (currentUser.role === 'CLIENT' && dto.password !== undefined) {
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
  @ApiOperation({ summary: 'Supprimer un utilisateur (anonymisation RGPD)' })
  @ApiResponse({ status: 204, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async delete(@Param('id') id: string, @CurrentUser() currentUser: User) {
    // Un client ne peut supprimer que son propre compte
    const targetId = currentUser.role === 'CLIENT' ? currentUser.id : id;
    await this.usersService.delete(targetId);
  }

  // ===========================================
  // EXPORT DES DONNÉES (RGPD)
  // ===========================================
  @Get(':id/export')
  @ApiOperation({ summary: 'Exporter les données personnelles (RGPD)' })
  @ApiResponse({ status: 200, description: 'Données exportées' })
  async exportData(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const targetId = currentUser.role === 'CLIENT' ? currentUser.id : id;
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
