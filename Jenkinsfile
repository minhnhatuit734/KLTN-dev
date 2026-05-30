pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 90, unit: 'MINUTES')
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
            description: 'Update k8s-manifests dev overlay after image push'
        )
    }

    environment {
        DOCKERHUB_REPO = 'mnhat1'

        MANIFEST_REPO = 'github.com/minhnhatuit734/k8s-manifests.git'
        MANIFEST_BRANCH = 'main'

        TARGET_ENV = 'dev'
        DOCKER_BUILDKIT = '1'
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
                        error("This simplified pipeline only supports branch develop now. Current branch: ${env.BRANCH_NAME}")
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

        stage('Scan') {
            steps {
                sh '''
                    set +e

                    echo "Scanning source for secrets and misconfigurations..."

                    trivy fs \
                      --scanners secret,misconfig \
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
                      --exit-code 0 \
                      .

                    exit 0
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -eu

                    SERVICES="api-gateway auth-service users-service tours-service bookings-service reviews-service blog-service chat-service"

                    for SERVICE in $SERVICES; do
                        echo "Building ${SERVICE}..."

                        docker build \
                          --network=host \
                          -t ${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG} \
                          -f services/${SERVICE}/dockerfile \
                          services/${SERVICE}
                    done

                    echo "Building frontend..."

                    docker build \
                      --network=host \
                      -t ${DOCKERHUB_REPO}/frontend:${IMAGE_TAG} \
                      -f frontend/dockerfile \
                      frontend
                '''
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