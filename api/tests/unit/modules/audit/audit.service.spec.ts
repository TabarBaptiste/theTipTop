// ===========================================
// Tests unitaires - Audit Service (RGPD)
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '@/modules/audit/audit.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  it('should persist an audit log entry', async () => {
    await service.log({
      userId: 'u1',
      action: 'UPDATE',
      entity: 'User',
      entityId: 'u1',
      ipAddress: '127.0.0.1',
    });

    expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'u1', action: 'UPDATE', entity: 'User' }),
    });
  });

  it('should fetch the latest logs for a user (capped at 100)', async () => {
    mockPrismaService.auditLog.findMany.mockResolvedValue([]);

    await service.getLogsForUser('u1');

    expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  });

  it('should fetch logs for an entity', async () => {
    mockPrismaService.auditLog.findMany.mockResolvedValue([]);

    await service.getLogsForEntity('User', 'u1');

    expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
      where: { entity: 'User', entityId: 'u1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should delete logs older than one year and return the count', async () => {
    mockPrismaService.auditLog.deleteMany.mockResolvedValue({ count: 12 });

    const count = await service.cleanOldLogs();

    expect(count).toBe(12);
    const where = mockPrismaService.auditLog.deleteMany.mock.calls[0][0].where;
    expect(where.createdAt.lt).toBeInstanceOf(Date);
  });
});
