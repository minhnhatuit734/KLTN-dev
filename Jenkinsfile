pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('travelweb-dockerhub')
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
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