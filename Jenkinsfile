pipeline {
    agent any
    tools {
        nodejs 'NODE20'
    }
    environment {
        DOCKER_BUILDKIT = 1
        DOCKER_HUB_USERNAME = 'legiahoangthien'
        DOCKERHUB_CREDENTIALS = credentials('travelweb-dockerhub')
        SCANNER_HOME = tool 'sonar-scanner'
        DEPENDENCY_CHECK_TOOL = tool 'DP-Check'
        GIT_USERNAME = ''
        GIT_TOKEN = ''
        appSourceBranch = 'main'  // Chỉnh sửa theo nhánh bạn muốn
        appSourceRepo = 'https://github.com/Lghthien/CI-dacn.git'  // URL của repo Git
    }
    stages {
        stage('Clone Source') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_TOKEN')]) {
                    // Clone app source repo
                    script {
                        try {
                            echo "Cloning repository ${appSourceRepo} branch ${appSourceBranch}..."
                            git branch: appSourceBranch, url: appSourceRepo, credentialsId: 'github'
                        } catch (Exception e) {
                            error "Không thể clone repository: ${e.message}"
                        }
                    }
                    // Clean up Docker images
                    // script {
                    //     try {
                    //         def dangling_images = sh(script: 'docker images -f "dangling=true" -q', returnStdout: true).trim()
                    //         if (dangling_images) {
                    //             echo "Đang xóa các Docker images bị treo..."
                    //             sh "echo \"$dangling_images\" | xargs docker rmi"
                    //         } else {
                    //             echo "Không có image Docker bị treo để xóa."
                    //         }
                    //     } catch (Exception e) {
                    //         error "Lỗi khi xóa Docker images: ${e.message}"
                    //     }
                    // }
                }
            }
        }

        // stage('OWASP FS SCAN') {
        //     steps {
        //         // Chạy Dependency-Check scan
        //         dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                
        //         // Publish Dependency-Check results
        //         dependencyCheckPublisher pattern: '**/target/dependency-check-report.xml'  // Đảm bảo đường dẫn đúng
        //     }
        // }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=lethien \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://3.226.107.61:9000 \
                        -Dsonar.login=sqp_9321a2951f48f576af311fde4fb4902d17fcf456
                                    '''
                     }
                }
            }

        stage('Build and Push Services') {
            parallel {
                stage('Frontend Pipeline') {
                    when {
                        changeset "**/frontend/**"
                    }
                    stages {
                        stage('Test Frontend') {
                            steps {
                                dir('frontend') {
                                    sh 'npm install'
                                    sh 'npm run test -- --passWithNoTests'
                                }
                            }
                        }
                        stage('Trivy Scan Frontend') {
                            steps {
                                dir('frontend') {
                                    sh 'trivy repo . --exit-code 1 --severity HIGH,CRITICAL --format json -o trivy-frontend.json'
                                    sh 'cat trivy-frontend.json'
                                }
                            }
                        }
                        
                        stage('Build Frontend Docker Image') {
                            steps {
                                sh 'docker build -t $DOCKER_HUB_USERNAME/webtravel-frontend:latest ./frontend'
                            }
                        }
                        stage('Trivy Scan Frontend Image') {
                            steps {
                                sh 'trivy image $DOCKER_HUB_USERNAME/webtravel-frontend:latest > trivy-frontend.txt'
                                sh 'cat trivy-frontend.txt'
                            }
                        }
                        stage('Push Frontend Image') {
                            steps {
                                script {
                                    try {
                                        sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_USERNAME --password-stdin'
                                        sh 'docker push $DOCKER_HUB_USERNAME/webtravel-frontend:latest'
                                    } catch (Exception e) {
                                        error "Không thể đẩy image frontend: ${e.message}"
                                    }
                                }
                            }
                        }
                    }
                }

                stage('Backend Pipeline') {
                    when {
                        changeset "**/backend/**"
                    }
                    stages {
                        stage('Test Backend') {
                            steps {
                                dir('backend') {
                                    sh 'npm install'
                                    sh 'chmod +x ./node_modules/.bin/jest'
                                    sh 'npm run test -- --verbose'
                                }
                            }
                        }
                        stage('Trivy Scan Backend') {
                            steps {
                                dir('backend') {
                                    sh 'trivy repo . --exit-code 1 --severity HIGH,CRITICAL --format json -o trivy-backend.json'
                                    sh 'cat trivy-backend.json'
                                }
                            }
                        }
                        stage('Build Backend Docker Image') {
                            steps {
                                sh 'docker build -t $DOCKER_HUB_USERNAME/webtravel-backend:latest ./backend'
                            }
                        }
                        stage('Trivy Scan Backend Image') {
                            steps {
                                sh 'trivy image $DOCKER_HUB_USERNAME/webtravel-backend:latest > trivy-backend.txt'
                                sh 'cat trivy-backend.txt'
                            }
                        }
                        stage('Push Backend Image') {
                            steps {
                                script {
                                    try {
                                        sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_USERNAME --password-stdin'
                                        sh 'docker push $DOCKER_HUB_USERNAME/webtravel-backend:latest'
                                    } catch (Exception e) {
                                        error "Không thể đẩy image backend: ${e.message}"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    post {
        success {
            echo '🎉 Triển khai thành công!'
        }
        failure {
            echo '❌ Triển khai thất bại. Vui lòng kiểm tra log để biết thêm chi tiết.'
        }
    }
}
