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
    runK6         : true,

    devDomain     : "${projectName}-dev.wk-archi-o24a-4-5-g1.fr",
    preprodDomain : "${projectName}-preprod.wk-archi-o24a-4-5-g1.fr",
    prodDomain    : "${projectName}.dsp5-archi-o24a-4-5-g1.fr",

    appPort       : 3000,

    // Chemin du Dockerfile (monorepo : l'app vit dans webapp/)
    dockerfile    : 'webapp/Dockerfile',

    // Backend API (NestJS), déployé aux côtés du frontend.
    // Câblé uniquement pour DEV pour l'instant.
    apiDockerfile  : 'api/Dockerfile',
    apiPort        : 3001,
    apiHealthPath  : '/api/v1/health',
    dbCredentialsId: 'thetiptop-db-credentials',
    apiEnv         : [
        FRONTEND_URL: "https://${projectName}-dev.wk-archi-o24a-4-5-g1.fr",
        CORS_ORIGINS: "https://${projectName}-dev.wk-archi-o24a-4-5-g1.fr",
        API_PREFIX  : 'api'
    ],
    apiSecretEnv   : [
        [envVar: 'JWT_SECRET', credentialId: 'thetiptop-jwt-secret'],
        [envVar: 'JWT_REFRESH_SECRET', credentialId: 'thetiptop-jwt-refresh-secret']
    ]
)
