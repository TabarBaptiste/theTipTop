// ===========================================
// Tests unitaires - Users Controller
// ===========================================

import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    changePassword: jest.fn(),
    delete: jest.fn(),
    exportData: jest.fn(),
    changeRole: jest.fn(),
  };

  const client = { id: 'u1', role: 'CLIENT' } as User;
  const admin = { id: 'a1', role: 'ADMIN' } as User;
  const storedUser = {
    id: 'u1',
    email: 'jean@email.fr',
    password: 'hashed',
    firstName: 'Jean',
  };

  beforeEach(() => {
    controller = new UsersController(mockUsersService as unknown as UsersService);
    jest.clearAllMocks();
  });

  it('findAll should delegate with the filters', async () => {
    mockUsersService.findAll.mockResolvedValue({ data: [], meta: {} });

    await controller.findAll(2, 10, 'CLIENT', 'jean');

    expect(mockUsersService.findAll).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      role: 'CLIENT',
      search: 'jean',
    });
  });

  describe('findOne', () => {
    it('should force a client to only access their own profile', async () => {
      mockUsersService.findById.mockResolvedValue(storedUser);

      await controller.findOne('autre-id', client);

      expect(mockUsersService.findById).toHaveBeenCalledWith('u1');
    });

    it('should let an admin access any profile', async () => {
      mockUsersService.findById.mockResolvedValue(storedUser);

      await controller.findOne('u1', admin);

      expect(mockUsersService.findById).toHaveBeenCalledWith('u1');
    });

    it('should never expose the password hash', async () => {
      mockUsersService.findById.mockResolvedValue(storedUser);

      const result = await controller.findOne('u1', admin);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('jean@email.fr');
    });

    it('should throw 404 for an unknown user', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(controller.findOne('inconnu', admin)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should force a client to only update their own profile and strip the password', async () => {
      mockUsersService.update.mockResolvedValue(storedUser);

      const result = await controller.update('autre-id', { firstName: 'Jean' }, client);

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', { firstName: 'Jean' });
      expect(result).not.toHaveProperty('password');
    });

    // L'adresse identifie le compte : la changer depuis une session ouverte
    // permettrait d'en reprendre l'acces par le formulaire de connexion.
    it('should refuse an email change requested by a client', async () => {
      await expect(
        controller.update('u1', { email: 'pirate@example.com' }, client),
      ).rejects.toThrow(ForbiddenException);

      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    // Le seul chemin autorise est PUT :id/password, qui exige l actuel.
    it('should refuse a password change requested through the profile update', async () => {
      await expect(controller.update('u1', { password: 'Nouveau123!' }, client)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should let an admin change an email', async () => {
      mockUsersService.update.mockResolvedValue(storedUser);

      await controller.update('u1', { email: 'nouvelle@thetiptop.fr' }, admin);

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', {
        email: 'nouvelle@thetiptop.fr',
      });
    });
  });

  describe('changePassword', () => {
    it('should act on the token holder, never on the id in the URL', async () => {
      await controller.changePassword(
        { currentPassword: 'Actuel123!', newPassword: 'Nouveau123!' },
        client,
      );

      expect(mockUsersService.changePassword).toHaveBeenCalledWith('u1', {
        currentPassword: 'Actuel123!',
        newPassword: 'Nouveau123!',
      });
    });

    // Un compte sans mot de passe peut en definir un sans fournir l'ancien.
    // Si un administrateur pouvait viser autrui, il s'octroierait l'acces a
    // tout compte cree par Google ou Facebook.
    it('should not let an admin target another account', async () => {
      await controller.changePassword({ newPassword: 'Nouveau123!' }, admin);

      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        admin.id,
        expect.objectContaining({ newPassword: 'Nouveau123!' }),
      );
    });
  });

  describe('delete', () => {
    it('should force a client to only delete their own account (RGPD)', async () => {
      await controller.delete('autre-id', client);

      expect(mockUsersService.delete).toHaveBeenCalledWith('u1');
    });

    it('should let an admin delete any account', async () => {
      await controller.delete('u1', admin);

      expect(mockUsersService.delete).toHaveBeenCalledWith('u1');
    });

    // Le droit a l'effacement porte sur un compte de participant, pas sur une
    // habilitation d'exploitation : un employe emporterait la trace des lots
    // qu'il a remis, et le dernier administrateur fermerait le back-office
    // derriere lui.
    it.each([['ADMIN'], ['EMPLOYEE']] as const)(
      'should refuse a %s deleting their own account',
      async (role) => {
        const personnel = { id: 'p1', role } as User;

        await expect(controller.delete('p1', personnel)).rejects.toThrow(ForbiddenException);
        expect(mockUsersService.delete).not.toHaveBeenCalled();
      },
    );

    // Le refus vise le compte, pas le chemin emprunte pour l'atteindre.
    it('should refuse a client id in the URL when it is the staff account itself', async () => {
      const employe = { id: 'e1', role: 'EMPLOYEE' } as User;

      await expect(controller.delete('e1', employe)).rejects.toThrow(ForbiddenException);
    });

    it('should still let a client delete their own account', async () => {
      await controller.delete('u1', client);

      expect(mockUsersService.delete).toHaveBeenCalledWith('u1');
    });
  });

  it('exportData should scope a client to their own data', async () => {
    mockUsersService.exportData.mockResolvedValue({});

    await controller.exportData('autre-id', client);

    expect(mockUsersService.exportData).toHaveBeenCalledWith('u1');
  });

  it('changeRole should strip the password from the response', async () => {
    mockUsersService.changeRole.mockResolvedValue({ ...storedUser, role: 'EMPLOYEE' });

    const result = await controller.changeRole('u1', 'EMPLOYEE');

    expect(result).not.toHaveProperty('password');
    expect(result.role).toBe('EMPLOYEE');
  });
});
