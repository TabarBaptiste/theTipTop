// ===========================================
// Configuration Jest - API NestJS
// ===========================================

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/tests/unit'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // Couverture : on exclut le bootstrap (main.ts), le câblage DI (*.module.ts)
  // et les barrels (index.ts) qui ne contiennent aucune logique testable.
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  // Seuils d'echec. Le cahier des charges fait de 70 % une porte dure du
  // pipeline, mais aucun seuil n'etait declare : la couverture pouvait donc
  // chuter sans que rien ne le signale.
  //
  // Les valeurs sont posees juste sous la couverture atteinte. Elles servent de
  // cliquet : elles empechent la regression sans imposer d'ecrire des tests
  // sans objet pour gagner quelques dixiemes.
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 75,
      functions: 90,
      lines: 90,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
