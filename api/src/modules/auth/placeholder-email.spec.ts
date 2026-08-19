// ===========================================
// Tests unitaires - Adresse de substitution
// ===========================================

import { buildPlaceholderEmail, isPlaceholderEmail } from './placeholder-email';

describe('placeholder-email', () => {
  it('derive l adresse du Facebook ID', () => {
    expect(buildPlaceholderEmail('123456')).toBe('fb_123456@facebook-noreply.invalid');
  });

  it('reconnait une adresse de substitution', () => {
    expect(isPlaceholderEmail(buildPlaceholderEmail('123456'))).toBe(true);
  });

  it('ne confond pas une vraie adresse avec une substitution', () => {
    expect(isPlaceholderEmail('jean.dupont@gmail.com')).toBe(false);
    // Un domaine qui contient le motif sans en etre un ne doit pas passer.
    expect(isPlaceholderEmail('jean@facebook-noreply.invalid.example.com')).toBe(false);
  });

  it('tolere la casse et l absence de valeur', () => {
    expect(isPlaceholderEmail('FB_1@FACEBOOK-NOREPLY.INVALID')).toBe(true);
    expect(isPlaceholderEmail(null)).toBe(false);
    expect(isPlaceholderEmail(undefined)).toBe(false);
  });
});
