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

    appPort       : 3000
)
