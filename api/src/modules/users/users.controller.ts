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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
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
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    // Un client ne peut voir que son propre profil
    if (currentUser.role === 'CLIENT' && currentUser.id !== id) {
      return this.usersService.findById(currentUser.id);
    }
    return this.usersService.findById(id);
  }

  // ===========================================
  // MISE À JOUR D'UN UTILISATEUR
  // ===========================================
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    // Un client ne peut modifier que son propre profil
    const targetId = currentUser.role === 'CLIENT' ? currentUser.id : id;
    const { password: _password, ...user } = await this.usersService.update(targetId, dto);
    void _password;
    return user;
  }

  // ===========================================
  // SUPPRESSION D'UN UTILISATEUR (RGPD)
  // ===========================================
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un utilisateur (anonymisation RGPD)' })
  @ApiResponse({ status: 204, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async delete(@Param('id') id: string, @CurrentUser() currentUser: any) {
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
  async exportData(@Param('id') id: string, @CurrentUser() currentUser: any) {
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
    void _password;
    return user;
  }
}
