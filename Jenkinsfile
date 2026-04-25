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
                git branch: 'feature/argocd-cicd-final',
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
                echo "🚀 Building Docker images with tag ${IMAGE_TAG}"
                docker-compose build --parallel
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
                sh '''
                rm -rf k8s-manifests || true
                git clone https://github.com/minhnhatuit734/k8s-manifests.git
                
                cd k8s-manifests

                # Update ALL services
                sed -i "s|mnhat1/api-gateway:.*|mnhat1/api-gateway:${IMAGE_TAG}|g" api-gateway/deployment.yaml
                sed -i "s|mnhat1/auth-service:.*|mnhat1/auth-service:${IMAGE_TAG}|g" auth-service/deployment.yaml
                sed -i "s|mnhat1/users-service:.*|mnhat1/users-service:${IMAGE_TAG}|g" users-service/deployment.yaml
                sed -i "s|mnhat1/tours-service:.*|mnhat1/tours-service:${IMAGE_TAG}|g" tours-service/deployment.yaml
                sed -i "s|mnhat1/bookings-service:.*|mnhat1/bookings-service:${IMAGE_TAG}|g" bookings-service/deployment.yaml
                sed -i "s|mnhat1/reviews-service:.*|mnhat1/reviews-service:${IMAGE_TAG}|g" reviews-service/deployment.yaml
                sed -i "s|mnhat1/blog-service:.*|mnhat1/blog-service:${IMAGE_TAG}|g" blog-service/deployment.yaml
                sed -i "s|mnhat1/chat-service:.*|mnhat1/chat-service:${IMAGE_TAG}|g" chat-service/deployment.yaml
                sed -i "s|mnhat1/frontend:.*|mnhat1/frontend:${IMAGE_TAG}|g" frontend/deployment.yaml

                git config user.email "jenkins@gmail.com"
                git config user.name "jenkins"

                git add .
                git commit -m "update image ${IMAGE_TAG}" || echo "No changes"
                git push
                '''
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