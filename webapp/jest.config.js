// ===========================================
// Configuration Jest - Next.js WebApp
// ===========================================

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // Évite la collision haste avec la copie standalone générée par `next build`
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    // Les pages App Router et le middleware sont couverts par les tests E2E Cypress,
    // pas par les tests unitaires Jest.
    '!src/app/**',
    '!src/proxy.ts',
  ],
  // Le pipeline Jenkins impose 70 % de couverture globale. Le déclarer ici
  // fait échouer les tests avant même le pipeline : le retour va au
  // développeur plutôt qu'à la CI. Les valeurs sont posées légèrement sous la
  // couverture atteinte, pour garder une marge sans laisser filer.
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 65,
      functions: 68,
      lines: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
