// ===========================================
// Tests unitaires - Reveal
// ===========================================
// Ce composant masque son contenu en attendant qu'il entre dans l'ecran. Une
// erreur ici ne casse pas l'animation : elle laisse une section entiere
// invisible. C'est ce risque que ces tests couvrent.

import { render, screen, act, waitFor } from '@testing-library/react';

import { Reveal } from './reveal';

/** Retient les rappels passes a l'observateur pour les declencher a la main. */
function installerObservateur() {
  const rappels: IntersectionObserverCallback[] = [];
  const disconnect = jest.fn();

  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = jest
    .fn()
    .mockImplementation((rappel: IntersectionObserverCallback) => {
      rappels.push(rappel);
      return { observe: jest.fn(), disconnect, unobserve: jest.fn() };
    });

  return { rappels, disconnect };
}

describe('Reveal', () => {
  const original = globalThis.IntersectionObserver;

  afterEach(() => {
    globalThis.IntersectionObserver = original;
    jest.clearAllMocks();
  });

  it('rend toujours son contenu dans le DOM', () => {
    installerObservateur();
    render(
      <Reveal>
        <p>Contenu</p>
      </Reveal>
    );

    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });

  // Masque avant l'entree dans l'ecran, mais uniquement sous motion-safe :
  // sans ce prefixe, le contenu resterait invisible pour qui a desactive les
  // animations.
  it('masque son contenu tant qu il n est pas entre dans l ecran', () => {
    installerObservateur();
    const { container } = render(
      <Reveal>
        <p>Contenu</p>
      </Reveal>
    );

    expect(container.firstChild).toHaveClass('motion-safe:opacity-0');
  });

  it('affiche son contenu une fois entre dans l ecran', () => {
    const { rappels } = installerObservateur();
    const { container } = render(
      <Reveal>
        <p>Contenu</p>
      </Reveal>
    );

    act(() => {
      rappels[0]([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(container.firstChild).toHaveClass('opacity-100');
    expect(container.firstChild).not.toHaveClass('motion-safe:opacity-0');
  });

  it('ne s anime pas tant que la section n affleure que le bord', () => {
    const { rappels } = installerObservateur();
    const { container } = render(
      <Reveal>
        <p>Contenu</p>
      </Reveal>
    );

    act(() => {
      rappels[0](
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(container.firstChild).toHaveClass('motion-safe:opacity-0');
  });

  // Reanimer a chaque passage donnerait le mal de mer sur un aller-retour de
  // defilement : l'observateur se coupe des la premiere apparition.
  it('cesse d observer apres la premiere apparition', () => {
    const { rappels, disconnect } = installerObservateur();
    render(
      <Reveal>
        <p>Contenu</p>
      </Reveal>
    );

    act(() => {
      rappels[0]([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(disconnect).toHaveBeenCalled();
  });

  // Un navigateur sans IntersectionObserver ne doit pas se retrouver avec une
  // page vide : c'est le seul cas ou l'absence de repli se verrait vraiment.
  it('affiche son contenu sans IntersectionObserver', async () => {
    // @ts-expect-error - on simule un environnement qui ne le fournit pas
    delete globalThis.IntersectionObserver;

    const { container } = render(
      <Reveal>
        <p>Contenu</p>
      </Reveal>
    );

    await waitFor(() => expect(container.firstChild).toHaveClass('opacity-100'));
  });

  it('applique le decalage demande', () => {
    installerObservateur();
    const { container } = render(
      <Reveal delay={200}>
        <p>Contenu</p>
      </Reveal>
    );

    expect(container.firstChild).toHaveStyle({ transitionDelay: '200ms' });
  });
});
