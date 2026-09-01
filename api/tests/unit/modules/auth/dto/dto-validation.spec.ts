// ===========================================
// Tests de validation - DTOs (class-validator)
// ===========================================
// Vérifie que les règles de validation des DTOs correspondent bien
// au cahier des charges (codes à 10 caractères, mot de passe fort, etc.)

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RefreshTokenDto } from '@/modules/auth/dto/refresh-token.dto';
import { VerifyCodeDto } from '@/modules/tickets/dto/verify-code.dto';
import { CreateParticipationDto } from '@/modules/participations/dto/create-participation.dto';
import { DeliverPrizeDto } from '@/modules/gains/dto/deliver-prize.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { PrizePublicDto } from '@/modules/tickets/dto/prize-public.dto';

async function validateDto<T extends object>(cls: new () => T, payload: object) {
  const instance = plainToInstance(cls, payload);
  return validate(instance);
}

describe('RegisterDto', () => {
  const validPayload = {
    email: 'jean.dupont@email.fr',
    password: 'MonMotDePasse123!',
    firstName: 'Jean',
    lastName: 'Dupont',
    consentData: true,
  };

  it('should accept a valid payload', async () => {
    expect(await validateDto(RegisterDto, validPayload)).toHaveLength(0);
  });

  it('should reject an invalid email', async () => {
    const errors = await validateDto(RegisterDto, { ...validPayload, email: 'pas-un-email' });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should reject a weak password (no special char)', async () => {
    const errors = await validateDto(RegisterDto, { ...validPayload, password: 'Password123' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  // Le diese compte comme caractere special. Il figure dans les deux listes de
  // l'expression : celle des caracteres speciaux acceptes, et celle qui regit
  // le premier caractere du mot de passe.
  it.each([
    ['Motdepasse1#', 'comme unique caractère spécial'],
    ['#Motdepasse1', 'en première position'],
  ])('should accept a password using # (%s)', async (password) => {
    const errors = await validateDto(RegisterDto, { ...validPayload, password });
    expect(errors.some((e) => e.property === 'password')).toBe(false);
  });

  it('should reject an invalid French phone number', async () => {
    const errors = await validateDto(RegisterDto, { ...validPayload, phone: '12345' });
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should accept a valid French phone number', async () => {
    const errors = await validateDto(RegisterDto, { ...validPayload, phone: '0612345678' });
    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid gender value', async () => {
    const errors = await validateDto(RegisterDto, { ...validPayload, gender: 'male' });
    expect(errors.some((e) => e.property === 'gender')).toBe(true);
  });

  it('should accept a valid adult birth date', async () => {
    const errors = await validateDto(RegisterDto, { ...validPayload, birthDate: '1990-05-15' });
    expect(errors.some((e) => e.property === 'birthDate')).toBe(false);
  });

  it('should reject a birth date corresponding to a minor', async () => {
    const today = new Date();
    const minorBirthDate = `${today.getFullYear() - 17}-01-01`;
    const errors = await validateDto(RegisterDto, { ...validPayload, birthDate: minorBirthDate });
    expect(errors.some((e) => e.property === 'birthDate')).toBe(true);
  });

  it('should reject a birth date with a year that is not 4 digits', async () => {
    const errors = await validateDto(RegisterDto, { ...validPayload, birthDate: '90-05-15' });
    expect(errors.some((e) => e.property === 'birthDate')).toBe(true);
  });

  it('should reject an unrealistically old birth date', async () => {
    const errors = await validateDto(RegisterDto, { ...validPayload, birthDate: '1850-01-01' });
    expect(errors.some((e) => e.property === 'birthDate')).toBe(true);
  });

  it('should require the data consent flag (RGPD)', async () => {
    const { consentData: _omitted, ...withoutConsent } = validPayload;
    const errors = await validateDto(RegisterDto, withoutConsent);
    expect(errors.some((e) => e.property === 'consentData')).toBe(true);
  });
});

describe('LoginDto', () => {
  it('should accept valid credentials', async () => {
    expect(
      await validateDto(LoginDto, { email: 'jean@email.fr', password: 'secret' }),
    ).toHaveLength(0);
  });

  it('should reject an empty password', async () => {
    const errors = await validateDto(LoginDto, { email: 'jean@email.fr', password: '' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});

describe('RefreshTokenDto', () => {
  it('should reject an empty refresh token', async () => {
    const errors = await validateDto(RefreshTokenDto, { refreshToken: '' });
    expect(errors).not.toHaveLength(0);
  });
});

describe.each([
  ['VerifyCodeDto', VerifyCodeDto],
  ['CreateParticipationDto', CreateParticipationDto],
] as const)('%s', (_name, dto) => {
  it('should accept a 10-character alphanumeric code', async () => {
    expect(await validateDto(dto, { code: 'ABC123XYZ9' })).toHaveLength(0);
  });

  it('should reject a code that is too short', async () => {
    const errors = await validateDto(dto, { code: 'ABC' });
    expect(errors.some((e) => e.property === 'code')).toBe(true);
  });

  it('should reject a code with special characters', async () => {
    const errors = await validateDto(dto, { code: 'ABC123-YZ9' });
    expect(errors.some((e) => e.property === 'code')).toBe(true);
  });
});

describe('DeliverPrizeDto', () => {
  it('should accept a valid delivery method', async () => {
    expect(await validateDto(DeliverPrizeDto, { deliveryMethod: 'IN_STORE' })).toHaveLength(0);
  });

  it('should reject an unknown delivery method', async () => {
    const errors = await validateDto(DeliverPrizeDto, { deliveryMethod: 'PIGEON' });
    expect(errors).not.toHaveLength(0);
  });
});

describe('UpdateUserDto', () => {
  it('should accept a partial update', async () => {
    expect(await validateDto(UpdateUserDto, { firstName: 'Jean' })).toHaveLength(0);
  });

  it('should reject an invalid birth date', async () => {
    const errors = await validateDto(UpdateUserDto, { birthDate: 'pas-une-date' });
    expect(errors.some((e) => e.property === 'birthDate')).toBe(true);
  });

  it('should reject a birth date corresponding to a minor', async () => {
    const today = new Date();
    const minorBirthDate = `${today.getFullYear() - 17}-01-01`;
    const errors = await validateDto(UpdateUserDto, { birthDate: minorBirthDate });
    expect(errors.some((e) => e.property === 'birthDate')).toBe(true);
  });

  it('should reject a weak password', async () => {
    const errors = await validateDto(UpdateUserDto, { password: 'faible' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});

describe('PrizePublicDto', () => {
  it('should carry the public prize fields', () => {
    const dto = new PrizePublicDto();
    dto.code = 'INFUSER';
    dto.name = 'Infuseur à thé';
    dto.description = 'Un infuseur';
    dto.value = null;
    dto.percentage = 60;
    dto.displayOrder = 1;
    dto.imageUrl = null;

    expect(dto.code).toBe('INFUSER');
    expect(dto.percentage).toBe(60);
  });
});
