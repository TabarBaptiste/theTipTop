import { isPlaceholderEmail } from '@/lib/placeholder-email';

describe('isPlaceholderEmail', () => {
  // Ce test fige la valeur partagée avec l'API : s'il tombe, c'est que le
  // domaine a changé d'un côté seulement, et des comptes injoignables
  // passeraient alors pour joignables.
  it('should recognise the domain used by the API', () => {
    expect(isPlaceholderEmail('fb_122239395716315848@facebook-noreply.invalid')).toBe(true);
  });

  it('should ignore the case', () => {
    expect(isPlaceholderEmail('FB_123@Facebook-NoReply.Invalid')).toBe(true);
  });

  it('should treat real addresses as reachable', () => {
    expect(isPlaceholderEmail('jean.dupont@email.fr')).toBe(false);
  });

  // Le domaine doit être en fin d'adresse : le voir ailleurs ne prouve rien.
  it('should not match the domain placed elsewhere in the address', () => {
    expect(isPlaceholderEmail('facebook-noreply.invalid@email.fr')).toBe(false);
  });

  it('should handle a missing address', () => {
    expect(isPlaceholderEmail(undefined)).toBe(false);
    expect(isPlaceholderEmail(null)).toBe(false);
  });
});
