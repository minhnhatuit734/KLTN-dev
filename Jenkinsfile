pipeline {
    agent any

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKERHUB_CREDENTIALS = credentials('travelweb-dockerhub')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
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
                echo "🚀 Building images..."
                export IMAGE_TAG=${IMAGE_TAG}
                docker-compose build --parallel
                '''
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonarqube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                echo "🔐 Login DockerHub"
                echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin

                echo "📤 Push images"
                docker push mnhat1/api-gateway:${IMAGE_TAG}
                docker push mnhat1/auth-service:${IMAGE_TAG}
                docker push mnhat1/users-service:${IMAGE_TAG}
                docker push mnhat1/tours-service:${IMAGE_TAG}
                docker push mnhat1/bookings-service:${IMAGE_TAG}
                docker push mnhat1/reviews-service:${IMAGE_TAG}
                docker push mnhat1/blog-service:${IMAGE_TAG}
                docker push mnhat1/chat-service:${IMAGE_TAG}
                docker push mnhat1/frontend:${IMAGE_TAG}
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                echo "🔍 Scan images"
                for img in $(docker images | grep "mnhat1" | grep "${IMAGE_TAG}" | awk '{print $1":"$2}')
                do
                    echo "Scanning $img"
                    trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        --timeout 5m \
                        --skip-db-update \
                        $img
                done
                '''
            }
        }

        stage('Update K8s Manifests') {
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

                    sed -i "s|mnhat1/api-gateway:.*|mnhat1/api-gateway:${IMAGE_TAG}|g" api-gateway/deployment.yaml
                    sed -i "s|mnhat1/auth-service:.*|mnhat1/auth-service:${IMAGE_TAG}|g" auth-service/deployment.yaml
                    sed -i "s|mnhat1/users-service:.*|mnhat1/users-service:${IMAGE_TAG}|g" users-service/deployment.yaml
                    sed -i "s|mnhat1/tours-service:.*|mnhat1/tours-service:${IMAGE_TAG}|g" tours-service/deployment.yaml
                    sed -i "s|mnhat1/bookings-service:.*|mnhat1/bookings-service:${IMAGE_TAG}|g" bookings-service/deployment.yaml
                    sed -i "s|mnhat1/reviews-service:.*|mnhat1/reviews-service:${IMAGE_TAG}|g" reviews-service/deployment.yaml
                    sed -i "s|mnhat1/blog-service:.*|mnhat1/blog-service:${IMAGE_TAG}|g" blog-service/deployment.yaml
                    sed -i "s|mnhat1/chat-service:.*|mnhat1/chat-service:${IMAGE_TAG}|g" chat-service/deployment.yaml
                    sed -i "s|mnhat1/frontend:.*|mnhat1/frontend:${IMAGE_TAG}|g" frontend/deployment.yaml

                    git config user.email "jenkins@example.com"
                    git config user.name "jenkins"

                    git add .
                    git commit -m "Update image tag ${IMAGE_TAG}" || echo "No changes"
                    git push
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ SUCCESS"
        }
        failure {
            echo "❌ FAILED"
        }
    }
}