pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 90, unit: 'MINUTES')
        parallelsAlwaysFailFast()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        booleanParam(
            name: 'TRIVY_STRICT',
            defaultValue: false,
            description: 'Fail pipeline if HIGH/CRITICAL vulnerabilities are found'
        )

        booleanParam(
            name: 'UPDATE_MANIFESTS',
            defaultValue: true,
            description: 'Update k8s-manifests after successful image push'
        )
    }

    environment {
        DOCKERHUB_REPO = 'mnhat1'
        MANIFEST_REPO = 'github.com/minhnhatuit734/k8s-manifests.git'
        MANIFEST_BRANCH = 'main'
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Build Info') {
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

                    if (env.BRANCH_NAME == 'main') {
                        env.TARGET_ENV = 'prod'
                        env.IMAGE_TAG = "prod-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                    } else if (env.BRANCH_NAME == 'develop') {
                        env.TARGET_ENV = 'dev'
                        env.IMAGE_TAG = "dev-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                    } else {
                        env.TARGET_ENV = 'none'
                        env.IMAGE_TAG = "test-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                    }

                    env.TRIVY_EXIT_CODE = params.TRIVY_STRICT ? '1' : '0'

                    currentBuild.displayName = "#${env.BUILD_NUMBER} ${env.BRANCH_NAME} ${env.GIT_SHORT_SHA}"
                }

                sh '''
                    set -eu
                    echo "Branch: ${BRANCH_NAME}"
                    echo "Target environment: ${TARGET_ENV}"
                    echo "Image tag: ${IMAGE_TAG}"
                    echo "Trivy exit code: ${TRIVY_EXIT_CODE}"
                    docker --version
                    git --version
                    trivy --version || true
                '''
            }
        }

        stage('Fast Validation') {
            failFast true

            parallel {
                stage('Validate Dockerfiles') {
                    steps {
                        sh '''
                            set -eu

                            test -f services/api-gateway/dockerfile
                            test -f services/auth-service/dockerfile
                            test -f services/users-service/dockerfile
                            test -f services/tours-service/dockerfile
                            test -f services/bookings-service/dockerfile
                            test -f services/reviews-service/dockerfile
                            test -f services/blog-service/dockerfile
                            test -f services/chat-service/dockerfile
                            test -f frontend/dockerfile

                            echo "All Dockerfiles exist."
                        '''
                    }
                }

                stage('Validate CI Scripts') {
                    steps {
                        sh '''
                            set -eu

                            test -f scripts/update-k8s-manifests.sh
                            chmod +x scripts/update-k8s-manifests.sh

                            echo "CI scripts are valid."
                        '''
                    }
                }

                stage('Trivy Source Scan') {
                    steps {
                        sh '''
                            set +e

                            trivy fs \
                              --scanners secret,misconfig \
                              --severity HIGH,CRITICAL \
                              --exit-code 0 \
                              .

                            exit 0
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images') {
            failFast true

            parallel {
                stage('Build api-gateway') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/api-gateway:${IMAGE_TAG} \
                              -f services/api-gateway/dockerfile \
                              services/api-gateway
                        '''
                    }
                }

                stage('Build auth-service') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/auth-service:${IMAGE_TAG} \
                              -f services/auth-service/dockerfile \
                              services/auth-service
                        '''
                    }
                }

                stage('Build users-service') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/users-service:${IMAGE_TAG} \
                              -f services/users-service/dockerfile \
                              services/users-service
                        '''
                    }
                }

                stage('Build tours-service') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/tours-service:${IMAGE_TAG} \
                              -f services/tours-service/dockerfile \
                              services/tours-service
                        '''
                    }
                }

                stage('Build bookings-service') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/bookings-service:${IMAGE_TAG} \
                              -f services/bookings-service/dockerfile \
                              services/bookings-service
                        '''
                    }
                }

                stage('Build reviews-service') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/reviews-service:${IMAGE_TAG} \
                              -f services/reviews-service/dockerfile \
                              services/reviews-service
                        '''
                    }
                }

                stage('Build blog-service') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/blog-service:${IMAGE_TAG} \
                              -f services/blog-service/dockerfile \
                              services/blog-service
                        '''
                    }
                }

                stage('Build chat-service') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/chat-service:${IMAGE_TAG} \
                              -f services/chat-service/dockerfile \
                              services/chat-service
                        '''
                    }
                }

                stage('Build frontend') {
                    steps {
                        sh '''
                            set -eu
                            docker build \
                              -t ${DOCKERHUB_REPO}/frontend:${IMAGE_TAG} \
                              -f frontend/dockerfile \
                              frontend
                        '''
                    }
                }
            }
        }

        stage('Scan Docker Images') {
            failFast true

            parallel {
                stage('Scan api-gateway') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/api-gateway:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }

                stage('Scan auth-service') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/auth-service:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }

                stage('Scan users-service') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/users-service:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }

                stage('Scan tours-service') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/tours-service:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }

                stage('Scan bookings-service') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/bookings-service:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }

                stage('Scan reviews-service') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/reviews-service:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }

                stage('Scan blog-service') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/blog-service:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }

                stage('Scan chat-service') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/chat-service:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }

                stage('Scan frontend') {
                    steps {
                        sh '''
                            set +e
                            trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code ${TRIVY_EXIT_CODE} ${DOCKERHUB_REPO}/frontend:${IMAGE_TAG}
                            exit $?
                        '''
                    }
                }
            }
        }

        stage('Push Docker Images') {
            when {
                anyOf {
                    expression { return env.BRANCH_NAME == 'develop' }
                    expression { return env.BRANCH_NAME == 'main' }
                }
            }

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

        stage('Update Dev Manifest') {
            when {
                allOf {
                    expression { return params.UPDATE_MANIFESTS }
                    expression { return env.BRANCH_NAME == 'develop' }
                    expression { return env.TARGET_ENV == 'dev' }
                }
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
                        ./scripts/update-k8s-manifests.sh dev "${IMAGE_TAG}"
                    '''
                }
            }
        }

        stage('Update Prod Manifest') {
            when {
                allOf {
                    expression { return params.UPDATE_MANIFESTS }
                    expression { return env.BRANCH_NAME == 'main' }
                    expression { return env.TARGET_ENV == 'prod' }
                }
            }

            steps {
                input message: 'Deploy to production?', ok: 'Deploy'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-pat',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu
                        ./scripts/update-k8s-manifests.sh prod "${IMAGE_TAG}"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully."
        }

        failure {
            echo "Pipeline failed."
        }

        always {
            sh '''
                docker logout || true
            '''
        }
    }
}