// ===========================================
// Tests unitaires - Users Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const existingUser = {
    id: 'u1',
    email: 'jean@email.fr',
    password: 'hashed',
    firstName: 'Jean',
    lastName: 'Dupont',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should lowercase and trim the email before querying', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await service.findByEmail('  Jean@Email.FR ');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jean@email.fr' },
      });
    });
  });

  describe('findAll', () => {
    it('should paginate and exclude soft-deleted users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(45);

      const result = await service.findAll({ page: 3, limit: 10 });

      expect(result.meta).toEqual({ total: 45, page: 3, limit: 10, totalPages: 5 });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should apply role and search filters', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findAll({ role: 'ADMIN', search: 'jean' });

      const where = mockPrismaService.user.findMany.mock.calls[0][0].where;
      expect(where.role).toBe('ADMIN');
      expect(where.OR).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException for an unknown user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('u1', { firstName: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when the new email is already taken', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(existingUser) // findById
        .mockResolvedValueOnce({ id: 'u2' }); // findByEmail

      await expect(service.update('u1', { email: 'autre@email.fr' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash the password when it is updated', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(existingUser);

      await service.update('u1', { password: 'NouveauPass123!' });

      const data = mockPrismaService.user.update.mock.calls[0][0].data;
      expect(data.password).toBeDefined();
      expect(data.password).not.toBe('NouveauPass123!');
      expect(bcrypt.compareSync('NouveauPass123!', data.password)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException for an unknown user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.delete('u1')).rejects.toThrow(NotFoundException);
    });

    it('should soft delete and anonymize personal data (RGPD)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({});

      await service.delete('u1');

      const data = mockPrismaService.user.update.mock.calls[0][0].data;
      expect(data.deletedAt).toBeInstanceOf(Date);
      expect(data.email).toBe('deleted-u1@anonymized.local');
      expect(data.phone).toBeNull();
      expect(data.googleId).toBeNull();
      expect(data.facebookId).toBeNull();
    });
  });

  describe('exportData', () => {
    it('should throw NotFoundException for an unknown user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.exportData('u1')).rejects.toThrow(NotFoundException);
    });

    it('should export user data without the password hash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...existingUser,
        participations: [],
      });

      const result = await service.exportData('u1');

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('jean@email.fr');
    });
  });

  describe('changeRole', () => {
    it('should throw NotFoundException for an unknown user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.changeRole('u1', 'EMPLOYEE')).rejects.toThrow(NotFoundException);
    });

    it('should update the role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({ ...existingUser, role: 'EMPLOYEE' });

      const result = await service.changeRole('u1', 'EMPLOYEE');

      expect(result.role).toBe('EMPLOYEE');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: 'EMPLOYEE' },
      });
    });
  });
});
