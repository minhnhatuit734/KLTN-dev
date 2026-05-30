pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 120, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        booleanParam(
            name: 'sonar-scanner',
            defaultValue: true,
            description: 'Run SonarQube source code analysis'
        )

        booleanParam(
            name: 'WAIT_SONAR_QUALITY_GATE',
            defaultValue: false,
            description: 'Wait for SonarQube Quality Gate result'
        )

        booleanParam(
            name: 'TRIVY_STRICT',
            defaultValue: false,
            description: 'Fail pipeline if Trivy finds HIGH/CRITICAL vulnerabilities'
        )

        booleanParam(
            name: 'UPDATE_MANIFESTS',
            defaultValue: true,
            description: 'Update k8s-manifests dev overlay after image push'
        )
    }

    environment {
        DOCKERHUB_REPO = 'mnhat1'

        MANIFEST_REPO = 'github.com/minhnhatuit734/k8s-manifests.git'
        MANIFEST_BRANCH = 'main'

        TARGET_ENV = 'dev'
        DOCKER_BUILDKIT = '1'

        SONARQUBE_SERVER = 'sonarqube'
        SONAR_SCANNER_TOOL = 'sonar-scanner'

        NPM_CONFIG_FETCH_RETRIES = '5'
        NPM_CONFIG_FETCH_RETRY_FACTOR = '2'
        NPM_CONFIG_FETCH_RETRY_MINTIMEOUT = '20000'
        NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT = '120000'
        NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Init') {
            steps {
                script {
                    env.GIT_SHORT_SHA = sh(
                        script: 'git rev-parse --short=8 HEAD',
                        returnStdout: true
                    ).trim()

                    if (env.BRANCH_NAME == null || env.BRANCH_NAME.trim() == '') {
                        env.BRANCH_NAME = sh(
                            script: 'git rev-parse --abbrev-ref HEAD',
                            returnStdout: true
                        ).trim()
                    }

                    if (env.BRANCH_NAME != 'develop') {
                        error("Pipeline hiện tại chỉ cho branch develop. Current branch: ${env.BRANCH_NAME}")
                    }

                    env.IMAGE_TAG = "dev-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                    env.TRIVY_EXIT_CODE = params.TRIVY_STRICT ? '1' : '0'

                    currentBuild.displayName = "#${env.BUILD_NUMBER} ${env.BRANCH_NAME} ${env.GIT_SHORT_SHA}"
                }

                sh '''
                    set -eu

                    echo "Branch: ${BRANCH_NAME}"
                    echo "Target environment: ${TARGET_ENV}"
                    echo "Image tag: ${IMAGE_TAG}"
                    echo "Trivy exit code: ${TRIVY_EXIT_CODE}"

                    git --version
                    docker --version
                    trivy --version || true
                '''
            }
        }

        stage('Quality Scan') {
            parallel {
                stage('SonarQube') {
                    when {
                        expression { return params.RUN_SONAR }
                    }

                    steps {
                        script {
                            def scannerHome = tool "${SONAR_SCANNER_TOOL}"

                            withSonarQubeEnv("${SONARQUBE_SERVER}") {
                                sh """
                                    set -eu

                                    ${scannerHome}/bin/sonar-scanner \
                                      -Dsonar.projectKey=KLTN-dev \
                                      -Dsonar.projectName=KLTN-dev \
                                      -Dsonar.sources=. \
                                      -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/k8s-manifests/** \
                                      -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                                """
                            }
                        }
                    }
                }

                stage('Trivy FS') {
                    steps {
                        sh '''
                            set +e

                            trivy fs \
                              --scanners vuln,secret,misconfig \
                              --severity HIGH,CRITICAL \
                              --skip-dirs node_modules \
                              --skip-dirs frontend/node_modules \
                              --skip-dirs services/api-gateway/node_modules \
                              --skip-dirs services/auth-service/node_modules \
                              --skip-dirs services/users-service/node_modules \
                              --skip-dirs services/tours-service/node_modules \
                              --skip-dirs services/bookings-service/node_modules \
                              --skip-dirs services/reviews-service/node_modules \
                              --skip-dirs services/blog-service/node_modules \
                              --skip-dirs services/chat-service/node_modules \
                              --skip-dirs .git \
                              --skip-dirs .next \
                              --skip-dirs dist \
                              --ignore-unfixed \
                              --exit-code ${TRIVY_EXIT_CODE} \
                              .

                            exit $?
                        '''
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {
            when {
                allOf {
                    expression { return params.RUN_SONAR }
                    expression { return params.WAIT_SONAR_QUALITY_GATE }
                }
            }

            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Batch 1') {
                    steps {
                        sh '''
                            set -eu

                            for SERVICE in api-gateway auth-service users-service; do
                                echo "Building ${SERVICE}"

                                docker build \
                                  --network=host \
                                  --build-arg NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRIES="${NPM_CONFIG_FETCH_RETRIES}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_FACTOR="${NPM_CONFIG_FETCH_RETRY_FACTOR}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_MINTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}" \
                                  -t ${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG} \
                                  -f services/${SERVICE}/dockerfile \
                                  services/${SERVICE}
                            done
                        '''
                    }
                }

                stage('Build Batch 2') {
                    steps {
                        sh '''
                            set -eu

                            for SERVICE in tours-service bookings-service reviews-service; do
                                echo "Building ${SERVICE}"

                                docker build \
                                  --network=host \
                                  --build-arg NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRIES="${NPM_CONFIG_FETCH_RETRIES}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_FACTOR="${NPM_CONFIG_FETCH_RETRY_FACTOR}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_MINTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}" \
                                  -t ${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG} \
                                  -f services/${SERVICE}/dockerfile \
                                  services/${SERVICE}
                            done
                        '''
                    }
                }

                stage('Build Batch 3') {
                    steps {
                        sh '''
                            set -eu

                            for SERVICE in blog-service chat-service; do
                                echo "Building ${SERVICE}"

                                docker build \
                                  --network=host \
                                  --build-arg NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRIES="${NPM_CONFIG_FETCH_RETRIES}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_FACTOR="${NPM_CONFIG_FETCH_RETRY_FACTOR}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_MINTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}" \
                                  --build-arg NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}" \
                                  -t ${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG} \
                                  -f services/${SERVICE}/dockerfile \
                                  services/${SERVICE}
                            done

                            echo "Building frontend"

                            docker build \
                              --network=host \
                              --build-arg NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY}" \
                              --build-arg NPM_CONFIG_FETCH_RETRIES="${NPM_CONFIG_FETCH_RETRIES}" \
                              --build-arg NPM_CONFIG_FETCH_RETRY_FACTOR="${NPM_CONFIG_FETCH_RETRY_FACTOR}" \
                              --build-arg NPM_CONFIG_FETCH_RETRY_MINTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}" \
                              --build-arg NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}" \
                              -t ${DOCKERHUB_REPO}/frontend:${IMAGE_TAG} \
                              -f frontend/dockerfile \
                              frontend
                        '''
                    }
                }
            }
        }

        stage('Image Scan') {
            parallel {
                stage('Image Scan Batch 1') {
                    steps {
                        sh '''
                            set +e

                            for SERVICE in api-gateway auth-service users-service; do
                                IMAGE="${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG}"
                                echo "Scanning ${IMAGE}"

                                trivy image \
                                  --severity HIGH,CRITICAL \
                                  --ignore-unfixed \
                                  --exit-code ${TRIVY_EXIT_CODE} \
                                  "${IMAGE}" || exit $?
                            done
                        '''
                    }
                }

                stage('Image Scan Batch 2') {
                    steps {
                        sh '''
                            set +e

                            for SERVICE in tours-service bookings-service reviews-service; do
                                IMAGE="${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG}"
                                echo "Scanning ${IMAGE}"

                                trivy image \
                                  --severity HIGH,CRITICAL \
                                  --ignore-unfixed \
                                  --exit-code ${TRIVY_EXIT_CODE} \
                                  "${IMAGE}" || exit $?
                            done
                        '''
                    }
                }

                stage('Image Scan Batch 3') {
                    steps {
                        sh '''
                            set +e

                            for SERVICE in blog-service chat-service frontend; do
                                IMAGE="${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG}"
                                echo "Scanning ${IMAGE}"

                                trivy image \
                                  --severity HIGH,CRITICAL \
                                  --ignore-unfixed \
                                  --exit-code ${TRIVY_EXIT_CODE} \
                                  "${IMAGE}" || exit $?
                            done
                        '''
                    }
                }
            }
        }

        stage('Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'travelweb-dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        set -eu

                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin

                        SERVICES="api-gateway auth-service users-service tours-service bookings-service reviews-service blog-service chat-service frontend"

                        for SERVICE in $SERVICES; do
                            IMAGE="${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG}"
                            echo "Pushing ${IMAGE}"
                            docker push "${IMAGE}"
                        done
                    '''
                }
            }
        }

        stage('Update Manifest') {
            when {
                expression { return params.UPDATE_MANIFESTS }
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-pat',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu

                        chmod +x scripts/update-k8s-manifests.sh
                        ./scripts/update-k8s-manifests.sh dev "${IMAGE_TAG}"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Develop to dev pipeline completed successfully."
        }

        failure {
            echo "Pipeline failed. Check the failed stage above."
        }

        always {
            sh '''
                docker logout || true
            '''
        }
    }
}