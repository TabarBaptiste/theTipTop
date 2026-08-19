/* groovylint-disable CompileStatic, NoDef, UnusedVariable, VariableName, VariableTypeRequired */
@Library('furious-ducks-shared-library') _

def projectName = 'thetiptop'

ciPipeline(
    projectName   : projectName,
    stack         : 'node',
    sonarProject  : projectName,

    deployDev     : true,
    deployPreprod : true,
    deployProd    : true,

    runE2E        : true,
    // Les specs vivent dans webapp/cypress/e2e (cf. webapp/cypress.config.ts)
    e2eFramework  : 'cypress',
    runK6         : true,
    runZap        : true,   // scan OWASP ZAP baseline contre PREPROD

    // Surveillance post-déploiement PREPROD avec rollback automatique
    preprodMonitorMinutes: 5,

    // Comité de pilotage (cf. cahier des charges)
    notifyRecipients: [
        preprod: 'alexandre.petit@thetiptop.fr,' +
                 'nathalie.dubois@thetiptop.fr,' +
                 'harenaandriamananjaramandimby@furiousducks.fr,' +
                 'baptistetabarlabonne@furiousducks.com',
        prod   : 'eric.bourdon@thetiptop.fr,' +
                 'nathalie.dubois@thetiptop.fr,' +
                 'alexandre.petit@thetiptop.fr,' +
                 'guido.brasletti@furiousducks.com,' +
                 'harenaandriamananjaramandimby@furiousducks.fr,' +
                 'baptistetabarlabonne@furiousducks.com'
    ],

    devDomain     : "${projectName}-dev.wk-archi-o24a-4-5-g1.fr",
    preprodDomain : "${projectName}-preprod.wk-archi-o24a-4-5-g1.fr",
    prodDomain    : "${projectName}.dsp5-archi-o24a-4-5-g1.fr",

    appPort       : 3000,

    // Chemin du Dockerfile (monorepo : l'app vit dans webapp/)
    dockerfile    : 'webapp/Dockerfile',

    // Backend API (NestJS), déployé aux côtés du frontend.
    // Câblé pour DEV et PREPROD.
    apiDockerfile  : 'api/Dockerfile',
    apiPort        : 3001,
    apiHealthPath  : '/api/v1/health',
    dbCredentialsId: 'thetiptop-db-credentials',

    devApiDomain    : "${projectName}-api-dev.wk-archi-o24a-4-5-g1.fr",
    preprodApiDomain: "${projectName}-api-preprod.wk-archi-o24a-4-5-g1.fr",

    // FRONTEND_URL et CORS_ORIGINS sont dérivés par la shared library
    // à partir du domaine front de l'environnement ciblé.
    apiEnv         : [
        API_PREFIX: 'api'
    ],
    apiSecretEnv   : [
        [envVar: 'JWT_SECRET', credentialId: 'thetiptop-jwt-secret'],
        [envVar: 'JWT_REFRESH_SECRET', credentialId: 'thetiptop-jwt-refresh-secret']
    ]
)
