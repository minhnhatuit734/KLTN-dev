pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('travelweb-dockerhub')
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
                sh 'docker-compose build'
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
                docker-compose down -v --remove-orphans 2>/dev/null || true
                sleep 3
                docker-compose up -d --force-recreate
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