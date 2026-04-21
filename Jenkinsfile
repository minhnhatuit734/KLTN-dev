pipeline {
    agent any

    tools {
        nodejs 'NODE20'
        sonarRunner 'sonar-scanner'
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
                    sh 'npm run build || true'
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
                    sh 'npm run build || true'
                }
            }
        }

        // ================= SONAR =================
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''
                    $SONAR_RUNNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectKey=kltn \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://localhost:9000 \
                    -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        // ================= DOCKER =================
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

        stage('Deploy') {
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
            echo '❌ Pipeline thất bại.'
        }
    }
}