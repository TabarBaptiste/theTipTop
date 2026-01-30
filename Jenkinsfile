// ===========================================
// Jenkinsfile - Pipeline CI/CD Thé Tip Top
// ===========================================
// Compatible avec le workflow Furious Ducks

pipeline {
    agent any

    environment {
        // Registre Docker
        DOCKER_REGISTRY = 'registry.dsp5-archi-o23-15m-g5.fr'
        IMAGE_API = "${DOCKER_REGISTRY}/thetiptop-api"
        IMAGE_WEBAPP = "${DOCKER_REGISTRY}/thetiptop-webapp"
        
        // SonarQube
        SONAR_HOST = credentials('sonarqube-host')
        SONAR_TOKEN = credentials('sonarqube-token')
        
        // Environnement cible
        DEPLOY_HOST = credentials('deploy-host')
        DEPLOY_USER = credentials('deploy-user')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        // ============================================
        // STAGE: Checkout
        // ============================================
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.GIT_BRANCH_NAME = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    env.BUILD_TAG = "${env.GIT_BRANCH_NAME}-${env.GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
                }
            }
        }

        // ============================================
        // STAGE: Install Dependencies
        // ============================================
        stage('Install Dependencies') {
            parallel {
                stage('API Dependencies') {
                    steps {
                        dir('api') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Webapp Dependencies') {
                    steps {
                        dir('webapp') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // ============================================
        // STAGE: Lint & Format Check
        // ============================================
        stage('Lint') {
            parallel {
                stage('API Lint') {
                    steps {
                        dir('api') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Webapp Lint') {
                    steps {
                        dir('webapp') {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }

        // ============================================
        // STAGE: Unit Tests
        // ============================================
        stage('Unit Tests') {
            parallel {
                stage('API Tests') {
                    steps {
                        dir('api') {
                            sh 'npm run test:cov'
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'api/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'API Coverage Report'
                            ])
                        }
                    }
                }
                stage('Webapp Tests') {
                    steps {
                        dir('webapp') {
                            sh 'npm run test:ci'
                        }
                    }
                }
            }
        }

        // ============================================
        // STAGE: Build Applications
        // ============================================
        stage('Build') {
            parallel {
                stage('Build API') {
                    steps {
                        dir('api') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Webapp') {
                    steps {
                        dir('webapp') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        // ============================================
        // STAGE: SonarQube Analysis
        // ============================================
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                            -Dsonar.projectKey=thetiptop \
                            -Dsonar.projectName="Thé Tip Top" \
                            -Dsonar.sources=api/src,webapp/src \
                            -Dsonar.tests=api/src,webapp/src \
                            -Dsonar.test.inclusions=**/*.spec.ts,**/*.test.ts,**/*.test.tsx \
                            -Dsonar.javascript.lcov.reportPaths=api/coverage/lcov.info,webapp/coverage/lcov.info \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.login=${SONAR_TOKEN}
                    '''
                }
            }
        }

        // ============================================
        // STAGE: Quality Gate
        // ============================================
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ============================================
        // STAGE: Build Docker Images
        // ============================================
        stage('Build Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'staging'
                }
            }
            parallel {
                stage('Build API Image') {
                    steps {
                        dir('api') {
                            sh """
                                docker build \
                                    --target production \
                                    -t ${IMAGE_API}:${BUILD_TAG} \
                                    -t ${IMAGE_API}:latest \
                                    .
                            """
                        }
                    }
                }
                stage('Build Webapp Image') {
                    steps {
                        dir('webapp') {
                            sh """
                                docker build \
                                    --target production \
                                    --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
                                    -t ${IMAGE_WEBAPP}:${BUILD_TAG} \
                                    -t ${IMAGE_WEBAPP}:latest \
                                    .
                            """
                        }
                    }
                }
            }
        }

        // ============================================
        // STAGE: Security Scan (Trivy)
        // ============================================
        stage('Security Scan') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'staging'
                }
            }
            parallel {
                stage('Scan API Image') {
                    steps {
                        sh """
                            trivy image \
                                --severity HIGH,CRITICAL \
                                --exit-code 0 \
                                --format table \
                                ${IMAGE_API}:${BUILD_TAG}
                        """
                    }
                }
                stage('Scan Webapp Image') {
                    steps {
                        sh """
                            trivy image \
                                --severity HIGH,CRITICAL \
                                --exit-code 0 \
                                --format table \
                                ${IMAGE_WEBAPP}:${BUILD_TAG}
                        """
                    }
                }
            }
        }

        // ============================================
        // STAGE: Push Docker Images
        // ============================================
        stage('Push Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo ${DOCKER_PASS} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USER} --password-stdin
                        docker push ${IMAGE_API}:${BUILD_TAG}
                        docker push ${IMAGE_API}:latest
                        docker push ${IMAGE_WEBAPP}:${BUILD_TAG}
                        docker push ${IMAGE_WEBAPP}:latest
                    '''
                }
            }
        }

        // ============================================
        // STAGE: Deploy to Staging
        // ============================================
        stage('Deploy to Staging') {
            when {
                branch 'staging'
            }
            steps {
                script {
                    deployToEnvironment('staging')
                }
            }
        }

        // ============================================
        // STAGE: E2E Tests (Staging)
        // ============================================
        stage('E2E Tests') {
            when {
                branch 'staging'
            }
            steps {
                dir('webapp') {
                    sh 'npm run test:e2e:staging'
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'webapp/cypress/reports',
                        reportFiles: 'index.html',
                        reportName: 'E2E Test Report'
                    ])
                }
            }
        }

        // ============================================
        // STAGE: Deploy to Production
        // ============================================
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                // Validation manuelle avant déploiement production
                input message: 'Déployer en production ?', ok: 'Déployer'
                script {
                    deployToEnvironment('production')
                }
            }
        }
    }

    post {
        always {
            // Nettoyage des images Docker locales
            sh '''
                docker image prune -f
            '''
            cleanWs()
        }
        success {
            echo '✅ Pipeline terminé avec succès!'
            // Notification Slack/Discord si configuré
        }
        failure {
            echo '❌ Pipeline échoué!'
            // Notification d'échec
        }
    }
}

// ============================================
// Fonction de déploiement
// ============================================
def deployToEnvironment(String environment) {
    sshagent(['deploy-ssh-key']) {
        sh """
            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << 'EOF'
                cd /opt/thetiptop/${environment}
                
                # Pull des nouvelles images
                docker pull ${IMAGE_API}:${BUILD_TAG}
                docker pull ${IMAGE_WEBAPP}:${BUILD_TAG}
                
                # Tag pour le déploiement
                docker tag ${IMAGE_API}:${BUILD_TAG} ${IMAGE_API}:${environment}
                docker tag ${IMAGE_WEBAPP}:${BUILD_TAG} ${IMAGE_WEBAPP}:${environment}
                
                # Redémarrage des services
                docker-compose -f docker-compose.prod.yml pull
                docker-compose -f docker-compose.prod.yml up -d
                
                # Migration Prisma si nécessaire
                docker-compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
                
                # Health check
                sleep 10
                curl -f http://localhost:3001/api/v1/health || exit 1
                
                echo "✅ Déploiement ${environment} terminé!"
EOF
        """
    }
}
