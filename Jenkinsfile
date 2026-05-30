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
            name: 'RUN_SONAR',
            defaultValue: true,
            description: 'Run SonarQube analysis'
        )

        booleanParam(
            name: 'WAIT_SONAR_QUALITY_GATE',
            defaultValue: false,
            description: 'Wait for SonarQube Quality Gate. Enable after SonarQube analysis works correctly.'
        )

        booleanParam(
            name: 'SONAR_NON_BLOCKING',
            defaultValue: true,
            description: 'If true, SonarQube failure marks build UNSTABLE but does not stop build/deploy.'
        )

        booleanParam(
            name: 'TRIVY_STRICT',
            defaultValue: false,
            description: 'If true, Trivy HIGH/CRITICAL vulnerabilities fail the pipeline.'
        )

        booleanParam(
            name: 'UPDATE_MANIFESTS',
            defaultValue: true,
            description: 'Update k8s-manifests after image push.'
        )
    }

    environment {
        DOCKERHUB_REPO = 'mnhat1'
        DOCKERHUB_CREDENTIALS_ID = 'travelweb-dockerhub'

        GITHUB_CREDENTIALS_ID = 'github'
        MANIFEST_REPO = 'github.com/minhnhatuit734/k8s-manifests.git'
        MANIFEST_BRANCH = 'main'

        DOCKER_BUILDKIT = '1'

        SONAR_SCANNER_TOOL = 'sonar-scanner'

        NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'
        NPM_CONFIG_FETCH_RETRIES = '5'
        NPM_CONFIG_FETCH_RETRY_FACTOR = '2'
        NPM_CONFIG_FETCH_RETRY_MINTIMEOUT = '20000'
        NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT = '120000'
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

                    if (env.BRANCH_NAME == 'develop') {
                        env.TARGET_ENV = 'dev'
                        env.IMAGE_TAG = "dev-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                        env.SONAR_PROJECT_KEY = 'KLTN-dev'
                        env.SONAR_PROJECT_NAME = 'KLTN-dev'
                    } else if (env.BRANCH_NAME == 'main') {
                        env.TARGET_ENV = 'prod'
                        env.IMAGE_TAG = "prod-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                        env.SONAR_PROJECT_KEY = 'KLTN-prod'
                        env.SONAR_PROJECT_NAME = 'KLTN-prod'
                    } else {
                        env.TARGET_ENV = 'none'
                        env.IMAGE_TAG = "test-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                        env.SONAR_PROJECT_KEY = "KLTN-${env.BRANCH_NAME.replaceAll('[^A-Za-z0-9_.-]', '-')}"
                        env.SONAR_PROJECT_NAME = env.SONAR_PROJECT_KEY
                    }

                    env.TRIVY_EXIT_CODE = params.TRIVY_STRICT ? '1' : '0'

                    currentBuild.displayName = "#${env.BUILD_NUMBER} ${env.BRANCH_NAME} ${env.GIT_SHORT_SHA}"
                }

                sh '''
                    set -eu

                    echo "Branch: ${BRANCH_NAME}"
                    echo "Target environment: ${TARGET_ENV}"
                    echo "Image tag: ${IMAGE_TAG}"
                    echo "Sonar project key: ${SONAR_PROJECT_KEY}"
                    echo "Trivy exit code: ${TRIVY_EXIT_CODE}"
                '''
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    set -eu

                    git --version
                    docker --version

                    if command -v docker-compose >/dev/null 2>&1; then
                        docker-compose --version
                    else
                        docker compose version || true
                    fi

                    trivy --version || true
                '''
            }
        }

        stage('Quality Scan') {
            parallel {
                stage('SonarQube Analysis') {
                    when {
                        expression { return params.RUN_SONAR }
                    }

                    steps {
                        script {
                            if (params.SONAR_NON_BLOCKING) {
                                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                    def scannerHome = tool "${SONAR_SCANNER_TOOL}"

                                    withSonarQubeEnv() {
                                        sh """
                                            set -eu

                                            ${scannerHome}/bin/sonar-scanner \
                                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                              -Dsonar.projectName=${SONAR_PROJECT_NAME} \
                                              -Dsonar.sources=. \
                                              -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/k8s-manifests/**,**/.git/** \
                                              -Dsonar.sourceEncoding=UTF-8
                                        """
                                    }
                                }
                            } else {
                                def scannerHome = tool "${SONAR_SCANNER_TOOL}"

                                withSonarQubeEnv() {
                                    sh """
                                        set -eu

                                        ${scannerHome}/bin/sonar-scanner \
                                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                          -Dsonar.projectName=${SONAR_PROJECT_NAME} \
                                          -Dsonar.sources=. \
                                          -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/k8s-manifests/**,**/.git/** \
                                          -Dsonar.sourceEncoding=UTF-8
                                    """
                                }
                            }
                        }
                    }
                }

                stage('Trivy FS Scan') {
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
                    expression { return currentBuild.currentResult == 'SUCCESS' }
                }
            }

            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Images') {
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

        stage('Trivy Image Scan') {
            parallel {
                stage('Scan Batch 1') {
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
                                  --timeout 10m \
                                  "${IMAGE}" || exit $?
                            done
                        '''
                    }
                }

                stage('Scan Batch 2') {
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
                                  --timeout 10m \
                                  "${IMAGE}" || exit $?
                            done
                        '''
                    }
                }

                stage('Scan Batch 3') {
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
                                  --timeout 10m \
                                  "${IMAGE}" || exit $?
                            done
                        '''
                    }
                }
            }
        }

        stage('Push Images') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKERHUB_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        set -eu

                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin

                        for SERVICE in api-gateway auth-service users-service tours-service bookings-service reviews-service blog-service chat-service frontend; do
                            IMAGE="${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG}"
                            echo "Pushing ${IMAGE}"
                            docker push "${IMAGE}"
                        done
                    '''
                }
            }
        }

        stage('Production Approval') {
            when {
                branch 'main'
            }

            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
            }
        }

        stage('Update K8s Manifests') {
            when {
                allOf {
                    expression { return params.UPDATE_MANIFESTS }
                    anyOf {
                        branch 'develop'
                        branch 'main'
                    }
                }
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${GITHUB_CREDENTIALS_ID}",
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {
                    sh '''
                        set -eu

                        rm -rf k8s-manifests

                        git clone -b "${MANIFEST_BRANCH}" "https://${GIT_USER}:${GIT_PASS}@${MANIFEST_REPO}" k8s-manifests

                        cd k8s-manifests

                        OVERLAY_FILE="overlays/${TARGET_ENV}/kustomization.yaml"

                        if [ -f "$OVERLAY_FILE" ]; then
                            echo "Detected Kustomize overlay structure. Updating ${OVERLAY_FILE}"

                            python3 - "$OVERLAY_FILE" "$IMAGE_TAG" <<'PY'
import sys
from pathlib import Path

file_path = Path(sys.argv[1])
image_tag = sys.argv[2]

services = [
    "api-gateway",
    "auth-service",
    "users-service",
    "tours-service",
    "bookings-service",
    "reviews-service",
    "blog-service",
    "chat-service",
    "frontend",
]

lines = file_path.read_text().splitlines()
output = []
current_service = None

for line in lines:
    stripped = line.strip()

    if stripped.startswith("- name: mnhat1/"):
        current_service = stripped.split("mnhat1/", 1)[1].strip()
        output.append(line)
        continue

    if stripped.startswith("newTag:") and current_service in services:
        indent = line[:len(line) - len(line.lstrip())]
        output.append(f"{indent}newTag: {image_tag}")
        current_service = None
        continue

    output.append(line)

file_path.write_text("\\n".join(output) + "\\n")
PY

                            grep -A1 "name: mnhat1/" "$OVERLAY_FILE"

                        else
                            echo "Detected old manifest structure. Updating deployment.yaml files directly."

                            for SERVICE in api-gateway auth-service users-service tours-service bookings-service reviews-service blog-service chat-service frontend; do
                                FILE="${SERVICE}/deployment.yaml"

                                if [ ! -f "$FILE" ]; then
                                    echo "Missing file: $FILE"
                                    exit 1
                                fi

                                sed -i -E "s|mnhat1/${SERVICE}:[^[:space:]\\"']+|mnhat1/${SERVICE}:${IMAGE_TAG}|g" "$FILE"

                                echo "Updated $FILE"
                                grep -n "image:" "$FILE"
                            done
                        fi

                        git config user.email "jenkins@example.com"
                        git config user.name "jenkins"

                        git add .

                        if git diff --cached --quiet; then
                            echo "No manifest changes to commit."
                        else
                            git commit -m "ci(${TARGET_ENV}): update image tag ${IMAGE_TAG}"
                            git push origin "${MANIFEST_BRANCH}"
                        fi
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "SUCCESS"
            echo "Pipeline completed successfully."
        }

        unstable {
            echo "UNSTABLE"
            echo "Pipeline completed but some quality checks need attention."
        }

        failure {
            echo "FAILED"
            echo "Pipeline failed. Check the failed stage above."
        }

        always {
            sh '''
                docker logout || true
            '''
        }
    }
}