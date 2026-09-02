// ===========================================
// Tests unitaires - Participations Controller
// ===========================================

import { NotFoundException } from '@nestjs/common';
import { ParticipationsController } from '@/modules/participations/participations.controller';
import { ParticipationsService } from '@/modules/participations/participations.service';
import { LeadsService } from '@/modules/participations/leads.service';
import { User } from '@prisma/client';

describe('ParticipationsController', () => {
  let controller: ParticipationsController;

  const mockParticipationsService = {
    participate: jest.fn(),
    findByUser: jest.fn(),
    findByCode: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  const mockLeadsService = {
    initiate: jest.fn(),
    verify: jest.fn(),
    resend: jest.fn(),
  };

  const client = { id: 'u1', role: 'CLIENT' } as User;
  const employee = { id: 'e1', role: 'EMPLOYEE' } as User;

  beforeEach(() => {
    controller = new ParticipationsController(
      mockParticipationsService as unknown as ParticipationsService,
      mockLeadsService as unknown as LeadsService,
    );
    jest.clearAllMocks();
  });

  it('initiate should forward the caller IP for rate limiting', async () => {
    mockLeadsService.initiate.mockResolvedValue({ leadId: 'l1' });
    const dto = { code: 'ABCDEFGH23', email: 'a@b.fr' } as never;

    await controller.initiate(dto, '10.0.0.1');

    expect(mockLeadsService.initiate).toHaveBeenCalledWith(dto, '10.0.0.1');
  });

  it('participate should delegate with the user id and code', async () => {
    mockParticipationsService.participate.mockResolvedValue({ id: 'p1' });

    await controller.participate(client, { code: 'ABCDEFGH23' });

    expect(mockParticipationsService.participate).toHaveBeenCalledWith(client, {
      code: 'ABCDEFGH23',
    });
  });

  it('getMyParticipations should scope to the current user', async () => {
    mockParticipationsService.findByUser.mockResolvedValue([]);

    await controller.getMyParticipations(client);

    expect(mockParticipationsService.findByUser).toHaveBeenCalledWith('u1');
  });

  it('findByCode should delegate to the service', async () => {
    mockParticipationsService.findByCode.mockResolvedValue({ ticket: {} });

    await controller.findByCode('ABCDEFGH23');

    expect(mockParticipationsService.findByCode).toHaveBeenCalledWith('ABCDEFGH23');
  });

  it('findAll should delegate the filters', async () => {
    mockParticipationsService.findAll.mockResolvedValue({ data: [], meta: {} });

    await controller.findAll(1, 20, true);

    expect(mockParticipationsService.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      prizeDelivered: true,
    });
  });

  describe('findOne (anti-IDOR)', () => {
    const participation = { id: 'p1', user: { id: 'u1' } };

    it('should return the participation to its owner', async () => {
      mockParticipationsService.findById.mockResolvedValue(participation);

      expect(await controller.findOne('p1', client)).toBe(participation);
    });

    it("should hide another client's participation behind a 404", async () => {
      mockParticipationsService.findById.mockResolvedValue({ id: 'p1', user: { id: 'autre' } });

      await expect(controller.findOne('p1', client)).rejects.toThrow(NotFoundException);
    });

    it('should let an employee access any participation', async () => {
      const other = { id: 'p1', user: { id: 'autre' } };
      mockParticipationsService.findById.mockResolvedValue(other);

      expect(await controller.findOne('p1', employee)).toBe(other);
    });
  });
});
