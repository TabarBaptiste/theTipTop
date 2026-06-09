// ===========================================
// Google Analytics - Événements personnalisés
// Utilise sendGAEvent de @next/third-parties/google
// ===========================================

import { sendGAEvent } from '@next/third-parties/google';

// -----------------------------------------------
// Auth - Connexion
// -----------------------------------------------

export function trackLoginSuccess(method: 'email' | 'google' | 'facebook') {
  sendGAEvent('event', 'login', { method });
}

export function trackLoginFailure(method: 'email' | 'google' | 'facebook', reason: string) {
  sendGAEvent('event', 'login_failure', { method, reason });
}

// -----------------------------------------------
// Auth - Inscription
// -----------------------------------------------

export function trackRegisterSuccess(method: 'email' | 'google' | 'facebook') {
  sendGAEvent('event', 'sign_up', { method });
}

export function trackRegisterFailure(method: 'email' | 'google' | 'facebook', reason: string) {
  sendGAEvent('event', 'sign_up_failure', { method, reason });
}

// -----------------------------------------------
// Jeu - Participation
// -----------------------------------------------

export function trackParticipateSubmit() {
  sendGAEvent('event', 'participate_submit');
}

export function trackParticipateSuccess(prizeType: string, prizeValue: string) {
  sendGAEvent('event', 'participate_success', {
    prize_type: prizeType,
    prize_value: prizeValue,
  });
}

export function trackParticipateFailure(reason: string) {
  sendGAEvent('event', 'participate_failure', { reason });
}

// -----------------------------------------------
// CTA - Clics sur les boutons d'action
// -----------------------------------------------

export function trackCTAClick(label: string, location: string) {
  sendGAEvent('event', 'cta_click', { label, location });
}
