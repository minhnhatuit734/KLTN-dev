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
                    echo "Sonar scanner tool: ${SONAR_SCANNER_TOOL}"
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

                stage('Trivy Source Scan') {
                    steps {
                        sh '''
                            set +e

                            echo "Running Trivy filesystem scan..."

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
                              --skip-dirs .git \
                              --skip-dirs .next \
                              --skip-dirs dist \
                              --ignore-unfixed \
                              --exit-code "${TRIVY_EXIT_CODE}" \
                              .

                            RESULT=$?

                            if [ "${TRIVY_EXIT_CODE}" = "1" ] && [ "$RESULT" -ne 0 ]; then
                                echo "Trivy filesystem scan failed in strict mode."
                                exit 1
                            fi

                            if [ "$RESULT" -ne 0 ]; then
                                echo "Trivy filesystem scan returned non-zero, but TRIVY_STRICT=false. Continuing."
                            fi

                            exit 0
                        '''
                    }
                }
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    set -eu

                    build_image() {
                        SERVICE="$1"
                        DOCKERFILE="$2"
                        CONTEXT="$3"

                        echo "Building ${SERVICE}"

                        docker build \
                          --network=host \
                          --build-arg NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY}" \
                          --build-arg NPM_CONFIG_FETCH_RETRIES="${NPM_CONFIG_FETCH_RETRIES}" \
                          --build-arg NPM_CONFIG_FETCH_RETRY_FACTOR="${NPM_CONFIG_FETCH_RETRY_FACTOR}" \
                          --build-arg NPM_CONFIG_FETCH_RETRY_MINTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}" \
                          --build-arg NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}" \
                          -t "${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG}" \
                          -f "${DOCKERFILE}" \
                          "${CONTEXT}"
                    }

                    (
                        set -eu
                        build_image api-gateway services/api-gateway/dockerfile services/api-gateway
                        build_image auth-service services/auth-service/dockerfile services/auth-service
                        build_image users-service services/users-service/dockerfile services/users-service
                    ) &
                    PID_1=$!

                    (
                        set -eu
                        build_image tours-service services/tours-service/dockerfile services/tours-service
                        build_image bookings-service services/bookings-service/dockerfile services/bookings-service
                        build_image reviews-service services/reviews-service/dockerfile services/reviews-service
                    ) &
                    PID_2=$!

                    (
                        set -eu
                        build_image blog-service services/blog-service/dockerfile services/blog-service
                        build_image chat-service services/chat-service/dockerfile services/chat-service
                        build_image frontend frontend/dockerfile frontend
                    ) &
                    PID_3=$!

                    FAILED=0

                    wait "$PID_1" || FAILED=1
                    wait "$PID_2" || FAILED=1
                    wait "$PID_3" || FAILED=1

                    if [ "$FAILED" -ne 0 ]; then
                        echo "One or more image builds failed."
                        exit 1
                    fi

                    echo "All images built successfully."
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                script {
                    if (params.TRIVY_STRICT) {
                        echo "TRIVY_STRICT=true. HIGH/CRITICAL vulnerabilities will fail the pipeline."
                    } else {
                        echo "TRIVY_STRICT=false. Trivy will report vulnerabilities but will not block deployment."
                    }
                }

                sh '''
                    set +e

                    scan_image() {
                        SERVICE="$1"
                        IMAGE="${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG}"

                        echo "Scanning ${IMAGE}"

                        trivy image \
                          --severity HIGH,CRITICAL \
                          --ignore-unfixed \
                          --exit-code "${TRIVY_EXIT_CODE}" \
                          --timeout 10m \
                          "${IMAGE}"

                        RESULT=$?

                        if [ "${TRIVY_EXIT_CODE}" = "1" ] && [ "$RESULT" -ne 0 ]; then
                            echo "Trivy found HIGH/CRITICAL vulnerabilities in ${IMAGE}"
                            return 1
                        fi

                        if [ "$RESULT" -ne 0 ]; then
                            echo "Trivy scan returned non-zero for ${IMAGE}, but TRIVY_STRICT=false. Continuing."
                        fi

                        return 0
                    }

                    (
                        scan_image api-gateway
                        scan_image auth-service
                        scan_image users-service
                    ) &
                    PID_1=$!

                    (
                        scan_image tours-service
                        scan_image bookings-service
                        scan_image reviews-service
                    ) &
                    PID_2=$!

                    (
                        scan_image blog-service
                        scan_image chat-service
                        scan_image frontend
                    ) &
                    PID_3=$!

                    FAILED=0

                    wait "$PID_1" || FAILED=1
                    wait "$PID_2" || FAILED=1
                    wait "$PID_3" || FAILED=1

                    if [ "${TRIVY_EXIT_CODE}" = "1" ] && [ "$FAILED" -ne 0 ]; then
                        echo "One or more Trivy image scans failed in strict mode."
                        exit 1
                    fi

                    echo "Trivy image scan completed."
                    exit 0
                '''
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

                        docker_login() {
                            ATTEMPT=1
                            MAX_ATTEMPTS=3

                            while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
                                echo "DockerHub login attempt ${ATTEMPT}/${MAX_ATTEMPTS}"

                                if echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin; then
                                    echo "DockerHub login succeeded."
                                    return 0
                                fi

                                echo "DockerHub login failed."

                                if [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; then
                                    SLEEP_TIME=$((ATTEMPT * 20))
                                    echo "Retrying DockerHub login in ${SLEEP_TIME} seconds..."
                                    sleep "$SLEEP_TIME"
                                fi

                                ATTEMPT=$((ATTEMPT + 1))
                            done

                            echo "DockerHub login failed after ${MAX_ATTEMPTS} attempts."
                            return 1
                        }

                        push_image() {
                            SERVICE="$1"
                            IMAGE="${DOCKERHUB_REPO}/${SERVICE}:${IMAGE_TAG}"

                            ATTEMPT=1
                            MAX_ATTEMPTS=3

                            while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
                                echo "Pushing ${IMAGE}, attempt ${ATTEMPT}/${MAX_ATTEMPTS}"

                                if docker push "${IMAGE}"; then
                                    echo "Pushed ${IMAGE}"
                                    return 0
                                fi

                                echo "Push failed for ${IMAGE}"

                                if [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; then
                                    SLEEP_TIME=$((ATTEMPT * 20))
                                    echo "Retrying ${IMAGE} in ${SLEEP_TIME} seconds..."
                                    sleep "$SLEEP_TIME"
                                fi

                                ATTEMPT=$((ATTEMPT + 1))
                            done

                            echo "Failed to push ${IMAGE} after ${MAX_ATTEMPTS} attempts."
                            return 1
                        }

                        docker_login

                        for SERVICE in api-gateway auth-service users-service tours-service bookings-service reviews-service blog-service chat-service frontend; do
                            push_image "$SERVICE"
                        done

                        echo "All images pushed successfully."
                    '''
                }
            }
        }

        stage('Production Approval') {
            when {
                branch 'main'
            }

            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input message: 'Deploy to production?', ok: 'Deploy'
                }
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

                        python3 - "${TARGET_ENV}" "${IMAGE_TAG}" <<'PY'
import re
import sys
from pathlib import Path

target_env = sys.argv[1]
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

overlay_file = Path(f"overlays/{target_env}/kustomization.yaml")

if overlay_file.exists():
    print(f"Detected Kustomize overlay structure. Updating {overlay_file}")

    lines = overlay_file.read_text().splitlines()
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

    overlay_file.write_text("\\n".join(output) + "\\n")

else:
    print("Detected old manifest structure. Updating deployment.yaml files directly.")

    for service in services:
        deployment_file = Path(service) / "deployment.yaml"

        if not deployment_file.exists():
            raise FileNotFoundError(f"Missing file: {deployment_file}")

        text = deployment_file.read_text()
        text = re.sub(
            rf"mnhat1/{service}:[^\\s\\\"']+",
            f"mnhat1/{service}:{image_tag}",
            text,
        )
        deployment_file.write_text(text)
PY

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