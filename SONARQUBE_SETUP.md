# SonarQube Integration Guide

## Prerequisites

Ensure SonarQube is running and accessible. You can set it up locally:

```bash
# Run SonarQube with Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

## Jenkins Setup

### 1. Create Jenkins Credentials

Go to **Jenkins → Manage Credentials → System → Global credentials**

Add two credentials:

#### a) SonarQube URL
- Kind: **Secret text**
- Secret: `http://localhost:9000` (or your SonarQube server URL)
- ID: `sonarqube-url`

#### b) SonarQube Token
- Kind: **Secret text**
- Secret: Generate from SonarQube → My Account → Security → Generate Tokens
- ID: `sonarqube-token`

### 2. Install SonarQube Scanner (Optional)

If you want to use sonar-scanner directly on Jenkins agent:

```bash
# Linux
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip
unzip sonar-scanner-cli-4.8.0.2856-linux.zip
sudo mv sonar-scanner-4.8.0.2856-linux /opt/sonar-scanner

# Windows
# Download from: https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/
```

### 3. Create SonarQube Project

1. Go to SonarQube → Create Project
2. Project Key: `KLTN-microservices`
3. Project Name: `KLTN - Microservices Chatbot`
4. Generate authentication token (copy for Jenkins)

## Pipeline Behavior

The pipeline will:

1. **Checkout** code from GitHub
2. **Build** Docker images in parallel
3. **Code Quality Analysis** - Scan with SonarQube
   - If `sonar-scanner` is installed, use local binary
   - Otherwise, use Docker image `sonarsource/sonar-scanner-cli`
4. **Security Scan** - Trivy scan container images
5. **Push** images to DockerHub
6. **Deploy** with docker-compose

## Viewing Results

After pipeline runs, go to:

```
http://localhost:9000/dashboard?id=KLTN-microservices
```

## Troubleshooting

### SonarQube Server Not Reachable
```bash
# Check if SonarQube is running
docker ps | grep sonarqube
```

### sonar-scanner Not Found
Pipeline automatically falls back to Docker image. Make sure Docker daemon is running.

### No Analysis Data
- Check Jenkins logs: `docker logs pipeline-sonarqube-1`
- Verify credentials in Jenkins
- Ensure project key matches in SonarQube

## Configuration

Edit `sonar-project.properties` to customize:
- Source directories
- Exclusions
- Code coverage paths
- Language-specific rules

## Next Steps

1. Set up Quality Gates in SonarQube
2. Fail build if quality gate fails:
   ```groovy
   // Add to Jenkinsfile after SonarQube scan
   script {
       timeout(time: 5, unit: 'MINUTES') {
           waitForQualityGate abortPipeline: true
       }
   }
   ```
3. Integrate with pull request notifications
