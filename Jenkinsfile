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

        booleanParam(
            name: 'FORCE_BUILD_ALL',
            defaultValue: false,
            description: 'If true, build all services regardless of changed files.'
        )
    }

    environment {
        DOCKERHUB_REPO            = 'mnhat1'
        DOCKERHUB_CREDENTIALS_ID  = 'travelweb-dockerhub'

        GITHUB_CREDENTIALS_ID     = 'github'
        MANIFEST_REPO             = 'github.com/minhnhatuit734/k8s-manifests.git'
        MANIFEST_BRANCH           = 'main'

        DOCKER_BUILDKIT           = '1'

        SONAR_SCANNER_TOOL        = 'sonar-scanner'

        NPM_CONFIG_REGISTRY              = 'https://registry.npmjs.org/'
        NPM_CONFIG_FETCH_RETRIES         = '5'
        NPM_CONFIG_FETCH_RETRY_FACTOR    = '2'
        NPM_CONFIG_FETCH_RETRY_MINTIMEOUT  = '20000'
        NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT  = '120000'

        TRIVY_DISABLE_VEX_NOTICE  = 'true'
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Service map: <service-name> → <source folder(s) to watch>
    // If any file under those folders changes, the service will be rebuilt.
    // ─────────────────────────────────────────────────────────────────────────

    stages {
        // ── 1. Checkout ───────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        // ── 2. Init ───────────────────────────────────────────────────────────
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
                        env.TARGET_ENV        = 'dev'
                        env.IMAGE_TAG         = "dev-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                        env.SONAR_PROJECT_KEY  = 'KLTN-dev'
                        env.SONAR_PROJECT_NAME = 'KLTN-dev'
                    } else if (env.BRANCH_NAME == 'main') {
                        env.TARGET_ENV        = 'prod'
                        env.IMAGE_TAG         = "prod-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                        env.SONAR_PROJECT_KEY  = 'KLTN-prod'
                        env.SONAR_PROJECT_NAME = 'KLTN-prod'
                    } else {
                        env.TARGET_ENV        = 'none'
                        env.IMAGE_TAG         = "test-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                        env.SONAR_PROJECT_KEY  = "KLTN-${env.BRANCH_NAME.replaceAll('[^A-Za-z0-9_.-]', '-')}"
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

        // ── 3. Detect Changes ─────────────────────────────────────────────────
        // Determine which services have changed compared to the previous commit.
        // Result is stored in env.CHANGED_SERVICES (space-separated list).
        stage('Detect Changes') {
            steps {
                script {
                    // Map: service name → list of watched paths (relative to repo root)
                    def servicePathMap = [
                        'api-gateway'      : ['services/api-gateway'],
                        'auth-service'     : ['services/auth-service'],
                        'users-service'    : ['services/users-service'],
                        'tours-service'    : ['services/tours-service'],
                        'bookings-service' : ['services/bookings-service'],
                        'reviews-service'  : ['services/reviews-service'],
                        'blog-service'     : ['services/blog-service'],
                        'chat-service'     : ['services/chat-service'],
                        'frontend'         : ['frontend'],
                    ]

                    // Shared files that trigger ALL services when changed
                    def globalPaths = [
                        'package.json',
                        'package-lock.json',
                        'tsconfig.json',
                        'docker-compose.yml',
                        'Jenkinsfile',
                    ]

                    if (params.FORCE_BUILD_ALL) {
                        echo 'FORCE_BUILD_ALL=true → building all services.'
                        env.CHANGED_SERVICES = servicePathMap.keySet().join(' ')
                        return
                    }

                    // Get list of changed files vs previous commit
                    def changedFiles = sh(
                        script: 'git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only $(git rev-list --max-parents=0 HEAD) HEAD',
                        returnStdout: true
                    ).trim().split('\n') as List

                    echo "Changed files:\n${changedFiles.join('\n')}"

                    // Check if any global file changed → rebuild everything
                    boolean globalChanged = changedFiles.any { f ->
                        globalPaths.any { g -> f == g || f.startsWith(g + '/') }
                    }

                    def changed = []

                    if (globalChanged) {
                        echo 'Global files changed → rebuilding all services.'
                        changed = servicePathMap.keySet() as List
                    } else {
                        servicePathMap.each { svc, paths ->
                            boolean hit = changedFiles.any { f ->
                                paths.any { p -> f == p || f.startsWith(p + '/') }
                            }
                            if (hit) {
                                echo "  ✔ ${svc} has changes"
                                changed << svc
                            } else {
                                echo "  – ${svc} unchanged, skipping"
                            }
                        }
                    }

                    if (changed.isEmpty()) {
                        echo 'No service changes detected. Nothing to build.'
                    }

                    env.CHANGED_SERVICES = changed.join(' ')
                    echo "Services to build: ${env.CHANGED_SERVICES ?: '(none)'}"
                }
            }
        }

        // ── 4. Quality Scan ───────────────────────────────────────────────────
        stage('Quality Scan') {
            parallel {
                stage('SonarQube Analysis') {
                    when {
                        expression { return params.RUN_SONAR }
                    }

                    steps {
                        script {
                            if (params.SONAR_NON_BLOCKING) {
                                try {
                                    def scannerHome = tool "${SONAR_SCANNER_TOOL}"

                                    withSonarQubeEnv() {
                                        sh """
                                            set -eu

                                            ${scannerHome}/bin/sonar-scanner \\
                                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                                              -Dsonar.projectName=${SONAR_PROJECT_NAME} \\
                                              -Dsonar.sources=. \\
                                              -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/k8s-manifests/**,**/.git/** \\
                                              -Dsonar.sourceEncoding=UTF-8
                                        """
                                    }
                                } catch (Exception e) {
                                    echo "⚠ SonarQube analysis failed, but SONAR_NON_BLOCKING is true. Ignoring error: ${e.message}"
                                }
                            } else {
                                def scannerHome = tool "${SONAR_SCANNER_TOOL}"

                                withSonarQubeEnv() {
                                    sh """
                                        set -eu

                                        ${scannerHome}/bin/sonar-scanner \\
                                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                                          -Dsonar.projectName=${SONAR_PROJECT_NAME} \\
                                          -Dsonar.sources=. \\
                                          -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/k8s-manifests/**,**/.git/** \\
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

                            trivy fs \\
                              --scanners secret,misconfig \\
                              --severity HIGH,CRITICAL \\
                              --skip-dirs node_modules \\
                              --skip-dirs frontend/node_modules \\
                              --skip-dirs services/api-gateway/node_modules \\
                              --skip-dirs services/auth-service/node_modules \\
                              --skip-dirs services/users-service/node_modules \\
                              --skip-dirs services/tours-service/node_modules \\
                              --skip-dirs services/bookings-service/node_modules \\
                              --skip-dirs services/reviews-service/node_modules \\
                              --skip-dirs services/blog-service/node_modules \\
                              --skip-dirs services/chat-service/node_modules \\
                              --skip-dirs .git \\
                              --skip-dirs .next \\
                              --skip-dirs dist \\
                              --ignore-unfixed \\
                              --exit-code "${TRIVY_EXIT_CODE}" \\
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

        // ── 5. CI: Build → Scan → Push (per-service parallel) ───────────────────
        // Each service runs its full Build → Trivy Scan → Push pipeline
        // independently and concurrently. No service waits for another.
        // Only branch develop/main performs the Push step.
        stage('CI: Build → Scan → Push') {
            when {
                expression { return env.CHANGED_SERVICES?.trim() }
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKERHUB_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    script {
                        def serviceConfig = [
                            'api-gateway'      : ['services/api-gateway/dockerfile',    'services/api-gateway'],
                            'auth-service'     : ['services/auth-service/dockerfile',    'services/auth-service'],
                            'users-service'    : ['services/users-service/dockerfile',   'services/users-service'],
                            'tours-service'    : ['services/tours-service/dockerfile',   'services/tours-service'],
                            'bookings-service' : ['services/bookings-service/dockerfile','services/bookings-service'],
                            'reviews-service'  : ['services/reviews-service/dockerfile', 'services/reviews-service'],
                            'blog-service'     : ['services/blog-service/dockerfile',    'services/blog-service'],
                            'chat-service'     : ['services/chat-service/dockerfile',    'services/chat-service'],
                            'frontend'         : ['frontend/dockerfile',                 'frontend'],
                        ]

                        // Docker login once before spinning up parallel branches
                        def doPush = (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'main')

                        if (doPush) {
                            sh '''
                                set -eu
                                ATTEMPT=1; MAX_ATTEMPTS=3
                                while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
                                    echo "DockerHub login attempt ${ATTEMPT}/${MAX_ATTEMPTS}"
                                    if echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin; then
                                        echo "DockerHub login succeeded."
                                        break
                                    fi
                                    ATTEMPT=$((ATTEMPT + 1))
                                    [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ] && sleep $((ATTEMPT * 20)) || { echo "Login failed."; exit 1; }
                                done
                            '''
                        }

                        def changedList = env.CHANGED_SERVICES.trim().split(' ')
                        def parallelBranches = [:]

                        changedList.each { svc ->
                            def cfg = serviceConfig[svc]
                            if (!cfg) {
                                echo "WARNING: no config for '${svc}', skipping."
                                return
                            }

                            // Capture loop variables for closure
                            def _svc        = svc
                            def _dockerfile = cfg[0]
                            def _context    = cfg[1]
                            def _image      = "${env.DOCKERHUB_REPO}/${_svc}:${env.IMAGE_TAG}"
                            def _doPush     = doPush

                            parallelBranches["${_svc}"] = {
                                // ── Step 1: Build ─────────────────────────────
                                sh """
                                    set -eu
                                    echo "━━━ [${_svc}] BUILD ━━━"
                                    docker build \\
                                      --network=host \\
                                      --build-arg NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY}" \\
                                      --build-arg NPM_CONFIG_FETCH_RETRIES="${NPM_CONFIG_FETCH_RETRIES}" \\
                                      --build-arg NPM_CONFIG_FETCH_RETRY_FACTOR="${NPM_CONFIG_FETCH_RETRY_FACTOR}" \\
                                      --build-arg NPM_CONFIG_FETCH_RETRY_MINTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}" \\
                                      --build-arg NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT="${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}" \\
                                      -t "${_image}" \\
                                      -f "${_dockerfile}" \\
                                      "${_context}"
                                    echo "✔ [${_svc}] Build done"
                                """

                                // ── Step 2: Trivy Scan ────────────────────────
                                sh """
                                    set +e
                                    echo "━━━ [${_svc}] TRIVY SCAN ━━━"

                                    trivy image \\
                                      --severity HIGH,CRITICAL \\
                                      --ignore-unfixed \\
                                      --exit-code "${TRIVY_EXIT_CODE}" \\
                                      --timeout 10m \\
                                      "${_image}"

                                    RESULT=\$?

                                    if [ "${TRIVY_EXIT_CODE}" = "1" ] && [ "\$RESULT" -ne 0 ]; then
                                        echo "✘ [${_svc}] Trivy found HIGH/CRITICAL vulnerabilities"
                                        exit 1
                                    fi

                                    [ "\$RESULT" -ne 0 ] && echo "⚠ [${_svc}] Trivy non-zero (non-strict, continuing)"
                                    echo "✔ [${_svc}] Trivy scan done"
                                    exit 0
                                """

                                // ── Step 3: Push (develop/main only) ─────────
                                if (_doPush) {
                                    sh """
                                        set -eu
                                        echo "━━━ [${_svc}] PUSH ━━━"

                                        ATTEMPT=1; MAX_ATTEMPTS=3
                                        while [ "\$ATTEMPT" -le "\$MAX_ATTEMPTS" ]; do
                                            echo "Pushing ${_image}, attempt \$ATTEMPT/\$MAX_ATTEMPTS"
                                            if docker push "${_image}"; then
                                                echo "✔ [${_svc}] Pushed ${_image}"
                                                exit 0
                                            fi
                                            ATTEMPT=\$((\$ATTEMPT + 1))
                                            [ "\$ATTEMPT" -le "\$MAX_ATTEMPTS" ] && sleep \$((\$ATTEMPT * 20))
                                        done

                                        echo "✘ [${_svc}] Push failed after \$MAX_ATTEMPTS attempts."
                                        exit 1
                                    """
                                } else {
                                    echo "[${_svc}] Branch '${env.BRANCH_NAME}' → skipping push (develop/main only)"
                                }
                            }
                        }

                        parallel parallelBranches
                    }
                }
            }
        }

        // ── 8. Production Approval ────────────────────────────────────────────
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

        // ── 9. Update K8s Manifests (only for changed services) ───────────────
        stage('Update K8s Manifests') {
            when {
                allOf {
                    expression { return params.UPDATE_MANIFESTS }
                    expression { return env.CHANGED_SERVICES?.trim() }
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

                        # Pass only the services that were actually built/pushed
                        python3 - "${TARGET_ENV}" "${IMAGE_TAG}" "${CHANGED_SERVICES}" <<'PY'
import re
import sys
from pathlib import Path

target_env     = sys.argv[1]
image_tag      = sys.argv[2]
changed_svcs   = sys.argv[3].split() if len(sys.argv) > 3 else []

all_services = [
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

# Only update manifests for services that were rebuilt
services = [s for s in all_services if s in changed_svcs] if changed_svcs else all_services

print(f"Updating manifests for: {services}")

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
            indent = line[: len(line) - len(line.lstrip())]
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
                            git commit -m "ci(${TARGET_ENV}): update image tag ${IMAGE_TAG} [${CHANGED_SERVICES}]"
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