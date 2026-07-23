module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'frontend',
        'docker',
        'jenkins',
        'traefik',
        'monitoring',
        'security',
        'infra',
        'backup',
        'db',
        'docs',
      ],
    ],
    'header-max-length': [2, 'always', 200],
  },
};
