pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('travelweb-dockerhub')
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github',
                    url: 'https://github.com/minhnhatuit734/KLTN-dev.git'
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
                echo "🚀 Building Docker images with tag ${IMAGE_TAG}"
                docker-compose build --no-cache
                '''
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    try {
                        def scannerHome = tool 'sonar-scanner'
                        withSonarQubeEnv('SonarQube') {
                            sh """${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=KLTN-microservices \
                                -Dsonar.sources=.
                            """
                        }
                    } catch (Exception e) {
                        echo "⚠️ Sonar failed but continue"
                    }
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                echo "🔍 Trivy scan images..."

                for img in $(docker images | grep mnhat1 | awk '{print $1":"$2}'); do
                    echo "Scanning $img"
                    trivy image --severity HIGH,CRITICAL --exit-code 0 $img || true
                done
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

        stage('Update K8s Manifest') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_PASS'
                )]) {
                    sh '''
                    rm -rf k8s-manifests

                    git clone https://$GIT_USER:$GIT_PASS@github.com/minhnhatuit734/k8s-manifests.git

                    cd k8s-manifests

                    sed -i "s|mnhat1/api-gateway:.*|mnhat1/api-gateway:${BUILD_NUMBER}|g" api-gateway/deployment.yaml
                    sed -i "s|mnhat1/auth-service:.*|mnhat1/auth-service:${BUILD_NUMBER}|g" auth-service/deployment.yaml
                    sed -i "s|mnhat1/users-service:.*|mnhat1/users-service:${BUILD_NUMBER}|g" users-service/deployment.yaml
                    sed -i "s|mnhat1/tours-service:.*|mnhat1/tours-service:${BUILD_NUMBER}|g" tours-service/deployment.yaml
                    sed -i "s|mnhat1/bookings-service:.*|mnhat1/bookings-service:${BUILD_NUMBER}|g" bookings-service/deployment.yaml
                    sed -i "s|mnhat1/reviews-service:.*|mnhat1/reviews-service:${BUILD_NUMBER}|g" reviews-service/deployment.yaml
                    sed -i "s|mnhat1/blog-service:.*|mnhat1/blog-service:${BUILD_NUMBER}|g" blog-service/deployment.yaml
                    sed -i "s|mnhat1/chat-service:.*|mnhat1/chat-service:${BUILD_NUMBER}|g" chat-service/deployment.yaml
                    sed -i "s|mnhat1/frontend:.*|mnhat1/frontend:${BUILD_NUMBER}|g" frontend/deployment.yaml

                    git config user.email "jenkins@gmail.com"
                    git config user.name "jenkins"

                    git add .
                    git commit -m "update image ${BUILD_NUMBER}"
                    git push
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ SUCCESS: CI + GitOps hoàn chỉnh!'
        }
        failure {
            echo '❌ FAILED: kiểm tra log!'
        }
    }
}