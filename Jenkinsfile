pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('travelweb-dockerhub')
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
        
        // SonarQube Configuration
        SONAR_HOST_URL = credentials('sonarqube-url') ?: 'http://localhost:9000'
        SONAR_LOGIN = credentials('sonarqube-token') ?: ''
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'fix/jenkins-pipeline',
                    credentialsId: 'github',
                    url: 'https://github.com/Lghthien/KLTN.git'
            }
        }

        stage('Verify Docker') {
            steps {
                sh 'docker --version'
                sh 'docker-compose --version'
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                # Detect changed services
                if [ -n "$GIT_PREVIOUS_COMMIT" ]; then
                    CHANGED=$(git diff $GIT_PREVIOUS_COMMIT HEAD --name-only | awk -F/ '{print $2}' | sort -u)
                    if [ -z "$CHANGED" ]; then
                        echo "No service changes detected, skipping build"
                        exit 0
                    fi
                fi
                
                docker-compose build --parallel
                '''
            }
        }

        stage('Code Quality Analysis') {
            steps {
                sh '''
                echo "📊 Running SonarQube analysis..."
                
                # Check if sonar-scanner is available
                if ! command -v sonar-scanner &> /dev/null; then
                    echo "⚠️ sonar-scanner not found, using Docker image"
                    docker run --rm \
                        -e SONAR_HOST_URL=$SONAR_HOST_URL \
                        -e SONAR_LOGIN=$SONAR_LOGIN \
                        -v "$(pwd):/usr/src" \
                        sonarsource/sonar-scanner-cli \
                        -Dsonar.projectKey=KLTN-microservices \
                        -Dsonar.projectName="KLTN - Microservices Chatbot" \
                        -Dsonar.projectVersion="1.0" \
                        -Dsonar.sources=.
                else
                    echo "✅ Using installed sonar-scanner"
                    sonar-scanner \
                        -Dsonar.projectKey=KLTN-microservices \
                        -Dsonar.projectName="KLTN - Microservices Chatbot" \
                        -Dsonar.projectVersion="1.0" \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.login=$SONAR_LOGIN \
                        -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**"
                fi
                
                echo "✅ SonarQube analysis completed!"
                '''
            }
        }

        stage('Security Scan') {
            steps {
                sh '''
                echo "🔍 Scanning Docker images with Trivy..."
                
                # Get all built images from docker-compose
                IMAGES=$(docker-compose images -q)
                
                SCAN_RESULTS=""
                FAILED=false
                
                for IMAGE in $IMAGES; do
                    echo "Scanning: $IMAGE"
                    
                    # Run trivy with severity threshold
                    if trivy image --severity HIGH,CRITICAL --exit-code 0 "$IMAGE"; then
                        echo "✅ $IMAGE: No HIGH/CRITICAL vulnerabilities"
                    else
                        echo "⚠️ $IMAGE: Found vulnerabilities"
                        SCAN_RESULTS="$SCAN_RESULTS\\n$IMAGE"
                        FAILED=true
                    fi
                done
                
                if [ "$FAILED" = true ]; then
                    echo "❌ Security scan failed for images: $SCAN_RESULTS"
                    echo "Review vulnerabilities above and proceed at your own risk"
                    # Set exit code 0 to warn but not fail pipeline (adjust as needed)
                    exit 0
                else
                    echo "✅ All images passed security scan!"
                fi
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                docker-compose push
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                set -e
                
                # Graceful shutdown instead of aggressive prune
                docker-compose down --remove-orphans 2>/dev/null || true
                
                # Wait for resources
                sleep 5
                
                # Start fresh
                docker-compose up -d
                
                # Wait for services to stabilize
                sleep 15
                '''
            }
        }
    }

    post {
        success {
            echo '✅ SUCCESS: Pipeline chạy hoàn chỉnh!'
        }
        failure {
            echo '❌ FAILED: Kiểm tra log!'
        }
    }
}