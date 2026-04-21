pipeline {
    agent any

    tools {
        nodejs 'NODE20'
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('travelweb-dockerhub')
        DOCKER_IMAGE_FRONTEND = '<mnhat1>/frontend'
        DOCKER_IMAGE_BACKEND = '<mnhat1>/backend'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'fix/jenkins-pipeline',
                    credentialsId: 'github',
                    url: 'https://github.com/Lghthien/KLTN.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build || true'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''
                    sonar-scanner \
                    -Dsonar.projectKey=kltn \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://localhost:9000 \
                    -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE_FRONTEND}:latest ./frontend || true"
                    sh "docker build -t ${DOCKER_IMAGE_BACKEND}:latest ./backend || true"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    sh """
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    docker push ${DOCKER_IMAGE_FRONTEND}:latest || true
                    docker push ${DOCKER_IMAGE_BACKEND}:latest || true
                    """
                }
            }
        }

        stage('Deploy (Docker Compose)') {
            steps {
                sh '''
                docker-compose down || true
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
            echo '❌ Pipeline thất bại. Kiểm tra lại log.'
        }
    }
}