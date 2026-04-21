pipeline {
    agent any

    tools {
        nodejs 'NODE20'
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('travelweb-dockerhub')
        DOCKER_IMAGE_FRONTEND = 'mnhat1/frontend'
        DOCKER_IMAGE_BACKEND = 'mnhat1/backend'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'fix/jenkins-pipeline',
                    credentialsId: 'github',
                    url: 'https://github.com/Lghthien/KLTN.git'
            }
        }

        // ================= FRONTEND =================
        stage('Frontend Install') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        // ================= BACKEND =================
        stage('Backend Install') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'npm run build'
                }
            }
        }

        // ================= SONAR =================
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonar-server') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=kltn \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000
                        """
                    }
                }
            }
        }

        // ================= DOCKER =================
        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE_FRONTEND}:latest ./frontend"
                sh "docker build -t ${DOCKER_IMAGE_BACKEND}:latest ./backend"
            }
        }

        stage('Push Docker Images') {
            steps {
                sh """
                echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                docker push ${DOCKER_IMAGE_FRONTEND}:latest
                docker push ${DOCKER_IMAGE_BACKEND}:latest
                """
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker-compose down
                docker-compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline chạy thành công!'
        }
        failure {
            echo '❌ Pipeline thất bại.'
        }
    }
}