import '@testing-library/jest-dom'

// jsdom n'implemente pas matchMedia. Tout composant qui interroge une media
// query - « prefers-reduced-motion » pour le defilement des lots, par exemple -
// plante donc au rendu, alors qu'aucun navigateur ne la lui refuse depuis IE10.
// Le bouchon repond « non » a toutes : les tests s'executent dans les memes
// conditions qu'un visiteur qui n'a rien regle.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
