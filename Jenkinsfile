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
    // Le domaine de production suit le nommage des deux autres, sans suffixe
    // d'environnement. Il reste sur la zone wk : la zone dsp5 n'accueille que
    // le front et n'a pas de wildcard, alors que wk en a un.
    apiDockerfile  : 'api/Dockerfile',
    apiPort        : 3001,
    apiHealthPath  : '/api/v1/health',
    dbCredentialsId: 'thetiptop-db-credentials',

    devApiDomain    : "${projectName}-api-dev.wk-archi-o24a-4-5-g1.fr",
    preprodApiDomain: "${projectName}-api-preprod.wk-archi-o24a-4-5-g1.fr",
    prodApiDomain   : "${projectName}-api.wk-archi-o24a-4-5-g1.fr",

    // FRONTEND_URL et CORS_ORIGINS sont dérivés par la shared library
    // à partir du domaine front de l'environnement ciblé.
    apiEnv         : [
        API_PREFIX: 'api'
    ],
    // Les URL de retour OAuth ne figurent pas ici : les stratégies retombent
    // sur un chemin relatif, que Passport résout contre la requête entrante.
    // Cette configuration étant commune aux trois environnements, elle ne
    // pourrait pas porter trois adresses absolues distinctes.
    apiSecretEnv   : [
        [envVar: 'JWT_SECRET', credentialId: 'thetiptop-jwt-secret'],
        [envVar: 'JWT_REFRESH_SECRET', credentialId: 'thetiptop-jwt-refresh-secret'],
        [envVar: 'GOOGLE_CLIENT_ID', credentialId: 'thetiptop-google-client-id'],
        [envVar: 'GOOGLE_CLIENT_SECRET', credentialId: 'thetiptop-google-client-secret'],
        [envVar: 'FACEBOOK_APP_ID', credentialId: 'thetiptop-facebook-app-id'],
        [envVar: 'FACEBOOK_APP_SECRET', credentialId: 'thetiptop-facebook-app-secret']
    ],

    // PROD always uses its own dedicated DB + JWT secrets, never the shared
    // DEV/PREPROD set above: a compromised DEV/PREPROD credential must never
    // grant access to the PROD database or let anyone sign valid PROD JWTs.
    // Google/Facebook OAuth apps stay shared across environments (single app
    // registration, see apiSecretEnv above).
    dbCredentialsByEnv: [
        prod: 'thetiptop-db-credentials-prod'
    ],
    apiSecretEnvByEnv : [
        prod: [
            [envVar: 'JWT_SECRET', credentialId: 'thetiptop-jwt-secret-prod'],
            [envVar: 'JWT_REFRESH_SECRET', credentialId: 'thetiptop-jwt-refresh-secret-prod'],
            [envVar: 'GOOGLE_CLIENT_ID', credentialId: 'thetiptop-google-client-id'],
            [envVar: 'GOOGLE_CLIENT_SECRET', credentialId: 'thetiptop-google-client-secret'],
            [envVar: 'FACEBOOK_APP_ID', credentialId: 'thetiptop-facebook-app-id'],
            [envVar: 'FACEBOOK_APP_SECRET', credentialId: 'thetiptop-facebook-app-secret']
        ]
    ]
)
