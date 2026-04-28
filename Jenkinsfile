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

        stage('Push Images') {
            steps {
                sh '''
                
                echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin

                # Push từng image một thay vì dùng docker-compose push (song song)
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

                for img in $(docker images | grep mnhat1 | awk '{print $1":"$2}')
                do
                    echo "Scanning $img"
                    trivy image --severity HIGH,CRITICAL --exit-code 0 $img
                done
                '''
            }
        }

        stage('Update K8s Manifests') {
            steps {
                sh '''
                git clone https://github.com/minhnhatuit734/k8s-manifests.git
                cd k8s-manifests

                sed -i "s|mnhat1/api-gateway:.*|mnhat1/api-gateway:${IMAGE_TAG}|g" api-gateway.yaml

                git config user.email "jenkins@example.com"
                git config user.name "jenkins"

                git commit -am "Update image tag ${IMAGE_TAG}"
                git push
                '''
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