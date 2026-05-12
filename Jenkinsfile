@Library('furious-ducks-shared-library') _

ciPipeline(
    projectName   : 'thetiptop',
    stack         : 'node',
    sonarProject  : 'thetiptop',

    deployDev     : true,
    deployPreprod : true,
    deployProd    : true,

    runE2E        : true,
    runK6         : true,

    devDomain     : 'thetiptop-dev.wk-archi-o24a-4-5-g1.fr',
    preprodDomain : 'thetiptop-preprod.wk-archi-o24a-4-5-g1.fr',
    prodDomain    : 'thetiptop.dsp5-archi-o24a-4-5-g1.fr',

    appPort       : 3000
)