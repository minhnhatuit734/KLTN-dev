# TourismWorld Microservices & DevSecOps CI/CD Pipeline

## 1. Tổng quan dự án

`KLTN-dev` là repository chính của hệ thống ứng dụng du lịch được xây dựng theo kiến trúc Microservices. Hệ thống bao gồm frontend, API Gateway và các backend service độc lập phục vụ các chức năng như xác thực, người dùng, tour, đặt tour, đánh giá, blog và chat.

Repository này cũng là nơi đặt `Jenkinsfile` để triển khai quy trình CI/CD theo hướng DevSecOps và GitOps:

```text
Source Code
→ Jenkins Multibranch Pipeline
→ SonarQube Analysis
→ Trivy Security Scan
→ Docker Build
→ DockerHub
→ Update Kubernetes Manifests
→ ArgoCD Sync
→ AWS EKS Deployment
```

Mục tiêu chính của repository này là:

```text
1. Quản lý source code ứng dụng TourismWorld.
2. Build Docker image cho frontend và các microservices.
3. Kiểm tra chất lượng mã nguồn bằng SonarQube.
4. Kiểm tra lỗ hổng bảo mật bằng Trivy.
5. Đẩy image lên DockerHub.
6. Cập nhật image tag trong repository k8s-manifests.
7. Để ArgoCD tự động triển khai lên Kubernetes/EKS.
```

---

## 2. Kiến trúc hệ thống

### 2.1 Thành phần chính

```text
Frontend
→ API Gateway
→ Microservices
→ MongoDB Atlas
```

Các service chính:

| Thành phần         | Công nghệ            | Port local | Vai trò                                                |
| ------------------ | -------------------- | ---------: | ------------------------------------------------------ |
| `frontend`         | Next.js              |     `3000` | Giao diện người dùng                                   |
| `api-gateway`      | Express + TypeScript |     `4000` | Cổng giao tiếp chính giữa frontend và backend services |
| `auth-service`     | NestJS               |     `3002` | Đăng nhập, đăng ký, xác thực JWT                       |
| `users-service`    | NestJS               |     `3001` | Quản lý người dùng                                     |
| `tours-service`    | NestJS               |     `3003` | Quản lý tour du lịch                                   |
| `bookings-service` | NestJS               |     `3004` | Quản lý đặt tour                                       |
| `reviews-service`  | NestJS               |     `3005` | Quản lý đánh giá                                       |
| `blog-service`     | NestJS               |     `3006` | Quản lý bài viết và bình luận                          |
| `chat-service`     | NestJS               |     `3007` | Xử lý chức năng chat trong hệ thống                    |

---

## 3. Vai trò của API Gateway

`api-gateway` là điểm vào chính của frontend. Frontend không gọi trực tiếp từng microservice mà gọi qua gateway.

Gateway chịu trách nhiệm:

```text
1. Nhận request từ frontend.
2. Điều hướng request đến service tương ứng.
3. Rewrite route để tương thích với frontend cũ.
4. Mapping request payload giữa frontend và backend service.
5. Mapping response để frontend đọc được dữ liệu.
6. Cấu hình CORS.
```

Ví dụ route mapping:

| Frontend gọi    | Gateway chuyển đến |
| --------------- | ------------------ |
| `/auth/login`   | `auth-service`     |
| `/tours`        | `tours-service`    |
| `/booking`      | `bookings-service` |
| `/blog-post`    | `blog-service`     |
| `/blog-comment` | `blog-service`     |
| `/reviews`      | `reviews-service`  |

---

## 4. Trạng thái tích hợp Chatbot Rasa

Hiện tại repository này có `chat-service`, tuy nhiên việc tích hợp hoàn chỉnh với Chatbot Rasa/MLOps pipeline vẫn chưa hoàn tất.

### 4.1 Trạng thái hiện tại

```text
Đã có:
- chat-service trong hệ thống microservices.
- Biến TOGETHER_API_KEY phục vụ chức năng chat AI hiện tại.
- Repository Chatbot riêng phục vụ hướng MLOps/Rasa.

Chưa hoàn tất:
- Chưa link hoàn chỉnh chat-service với Rasa server.
- Chưa link hoàn chỉnh chat-service với Rasa Action Server.
- Chưa triển khai Rasa bot như một service trong Kubernetes của hệ thống chính.
- Chưa đưa Rasa bot vào cùng GitOps flow của KLTN-dev và k8s-manifests.
```

### 4.2 Repository Chatbot liên quan

Repository Chatbot riêng:

```text
https://github.com/ThinhQuang08/Chatbot
```

Repository này sẽ được dùng cho phần MLOps/Rasa, bao gồm:

```text
1. Xử lý dữ liệu chatbot.
2. Huấn luyện Rasa model.
3. Theo dõi metrics bằng MLflow.
4. Kiểm tra drift hoặc chất lượng dữ liệu.
5. Triển khai Rasa server và Action Server.
```

### 4.3 Hướng tích hợp dự kiến

Luồng tích hợp dự kiến:

```text
Frontend
→ API Gateway
→ chat-service
→ Rasa Server
→ Rasa Action Server
→ External API / Database / Vector DB nếu cần
```

Các biến môi trường dự kiến cần bổ sung sau:

```env
RASA_SERVER_URL=http://rasa-server:5005
RASA_ACTION_SERVER_URL=http://rasa-action-server:5055
```

Khi tích hợp hoàn chỉnh, `chat-service` sẽ đóng vai trò trung gian giữa hệ thống TourismWorld và Rasa bot.

---

## 5. Công nghệ sử dụng

### 5.1 Application

```text
Frontend:
- Next.js
- TypeScript

Backend:
- Node.js
- Express
- NestJS
- TypeScript

Database:
- MongoDB Atlas

Containerization:
- Docker
- Docker Compose
```

### 5.2 CI/CD và DevSecOps

```text
CI/CD:
- Jenkins Multibranch Pipeline

Code Quality:
- SonarQube

Security Scan:
- Trivy FS Scan
- Trivy Image Scan

Container Registry:
- DockerHub

GitOps:
- ArgoCD

Deployment:
- Kubernetes
- AWS EKS
```

---

## 6. Branch strategy

Hệ thống sử dụng chiến lược branch theo môi trường:

| Branch      | Môi trường   | Image tag                       | Manifest được update               | Ghi chú                     |
| ----------- | ------------ | ------------------------------- | ---------------------------------- | --------------------------- |
| `develop`   | `dev`        | `dev-<BUILD_NUMBER>-<GIT_SHA>`  | `overlays/dev/kustomization.yaml`  | Tự động deploy dev          |
| `main`      | `prod`       | `prod-<BUILD_NUMBER>-<GIT_SHA>` | `overlays/prod/kustomization.yaml` | Có bước Production Approval |
| `feature/*` | Không deploy | `test-<BUILD_NUMBER>-<GIT_SHA>` | Không update manifest              | Dùng để kiểm tra code/build |

---

## 7. CI/CD workflow

### 7.1 Luồng CI/CD tổng quan

```text
Developer push code
→ Jenkins Multibranch Pipeline trigger
→ Checkout source code
→ Init build information
→ Verify tools
→ SonarQube Analysis
→ Trivy FS Scan
→ Build Docker images
→ Trivy Image Scan
→ Push Docker images to DockerHub
→ Production Approval nếu là main
→ Update k8s-manifests
→ ArgoCD sync to EKS
```

### 7.2 Jenkins stages

| Stage                  | Mục đích                                                        |
| ---------------------- | --------------------------------------------------------------- |
| `Checkout`             | Lấy source code từ GitHub                                       |
| `Init`                 | Xác định branch, môi trường, image tag                          |
| `Verify Tools`         | Kiểm tra Docker, Git, Trivy                                     |
| `Quality Scan`         | Chạy SonarQube và Trivy filesystem scan                         |
| `Build Images`         | Build Docker image cho frontend và services                     |
| `Trivy Image Scan`     | Scan image sau khi build                                        |
| `Push Images`          | Push image lên DockerHub                                        |
| `Production Approval`  | Chỉ chạy ở nhánh `main`, yêu cầu xác nhận trước khi deploy prod |
| `Update K8s Manifests` | Cập nhật image tag trong repo `k8s-manifests`                   |

### 7.3 Chính sách scan hiện tại

Hiện tại Trivy đang được cấu hình theo hướng:

```text
TRIVY_STRICT=false
```

Điều này có nghĩa:

```text
- Trivy vẫn scan và report đầy đủ lỗ hổng.
- Pipeline chưa bị fail vì HIGH/CRITICAL vulnerabilities.
- Phù hợp trong giai đoạn đang hoàn thiện CI/CD.
```

Khi hệ thống ổn định và dependency đã được xử lý, có thể bật:

```text
TRIVY_STRICT=true
```

Khi đó pipeline sẽ fail nếu phát hiện vulnerability mức HIGH hoặc CRITICAL.

---

## 8. Docker image

DockerHub namespace:

```text
mnhat1
```

Danh sách image:

```text
mnhat1/api-gateway
mnhat1/auth-service
mnhat1/users-service
mnhat1/tours-service
mnhat1/bookings-service
mnhat1/reviews-service
mnhat1/blog-service
mnhat1/chat-service
mnhat1/frontend
```

Quy ước image tag:

```text
develop:
dev-<BUILD_NUMBER>-<GIT_SHORT_SHA>

main:
prod-<BUILD_NUMBER>-<GIT_SHORT_SHA>

feature:
test-<BUILD_NUMBER>-<GIT_SHORT_SHA>
```

Ví dụ:

```text
mnhat1/api-gateway:dev-45-a1b2c3d4
mnhat1/frontend:prod-18-e5f6g7h8
```

---

## 9. GitOps deployment

Repository manifest:

```text
https://github.com/minhnhatuit734/k8s-manifests
```

Jenkins không deploy trực tiếp vào Kubernetes. Jenkins chỉ cập nhật image tag trong `k8s-manifests`.

Sau đó ArgoCD sẽ tự động sync manifest lên EKS.

Luồng GitOps:

```text
Jenkins
→ update overlays/dev hoặc overlays/prod
→ git commit
→ git push k8s-manifests
→ ArgoCD detect change
→ ArgoCD sync Kubernetes resources
```

---

## 10. Kubernetes environments

Hệ thống được tách thành hai môi trường Kubernetes:

```text
namespace dev
namespace prod
```

### 10.1 Dev environment

```text
Branch source: develop
Namespace: dev
Image tag: dev-...
Approval: Không yêu cầu
```

### 10.2 Prod environment

```text
Branch source: main
Namespace: prod
Image tag: prod-...
Approval: Có Production Approval trong Jenkins
```

Prod có thể cấu hình replica cao hơn dev, ví dụ:

```text
api-gateway: 2 replicas
frontend: 2 replicas
các service nội bộ: 1 replica
```

Nếu EKS thiếu tài nguyên, có thể tạm thời giảm tất cả service về `replicas: 1`.

---

## 11. Cấu hình môi trường

Tạo file `.env` dựa trên `.env.example`.

Các biến quan trọng:

```env
MONGO_ATLAS_URI=
JWT_SECRET=
TOGETHER_API_KEY=
NEXT_PUBLIC_API_URL=
```

Ví dụ:

```env
MONGO_ATLAS_URI=mongodb+srv://<username>:<password>@<cluster-url>
JWT_SECRET=your_jwt_secret
TOGETHER_API_KEY=your_together_api_key
NEXT_PUBLIC_API_URL=https://api-dev.uittravel.shop
```

Lưu ý:

```text
Không commit file .env thật lên GitHub.
Không hardcode secret trong source code.
Secret khi deploy Kubernetes nên được tạo bằng Kubernetes Secret.
```

---

## 12. Chạy hệ thống local bằng Docker Compose

### 12.1 Build và chạy toàn bộ hệ thống

```bash
docker-compose up -d --build --remove-orphans
```

### 12.2 Kiểm tra container

```bash
docker-compose ps
```

### 12.3 Xem logs toàn hệ thống

```bash
docker-compose logs -f
```

### 12.4 Xem logs riêng API Gateway

```bash
docker-compose logs -f api-gateway
```

### 12.5 Tắt hệ thống

```bash
docker-compose down
```

---

## 13. Seed dữ liệu

Project có script seed dữ liệu mẫu:

```bash
npm run seed:rich
```

Script này dùng để tạo dữ liệu mẫu cho:

```text
users
tours
bookings
reviews
blog posts
blog comments
```

Tài khoản mẫu sau khi seed:

```text
admin@example.com / 123456
user1@example.com / 123456
user2@example.com / 123456
user3@example.com / 123456
```

---

## 14. Kiểm tra nhanh API

### 14.1 Kiểm tra danh sách tour

```bash
curl https://api-dev.uittravel.shop/tours
```

### 14.2 Kiểm tra blog

```bash
curl https://api-dev.uittravel.shop/blog-post
```

### 14.3 Kiểm tra đăng nhập

```bash
curl -X POST https://api-dev.uittravel.shop/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'
```

---

## 15. Kiểm tra trên Kubernetes

### 15.1 Kiểm tra ArgoCD applications

```bash
kubectl -n argocd get applications
```

Kỳ vọng:

```text
kltn-dev    Synced    Healthy
kltn-prod   Synced    Healthy
```

### 15.2 Kiểm tra pod dev

```bash
kubectl -n dev get pods
```

### 15.3 Kiểm tra pod prod

```bash
kubectl -n prod get pods
```

### 15.4 Kiểm tra image đang chạy

```bash
kubectl -n dev get deploy api-gateway -o jsonpath="{.spec.template.spec.containers[0].image}{'\n'}"
kubectl -n prod get deploy api-gateway -o jsonpath="{.spec.template.spec.containers[0].image}{'\n'}"
```

Kỳ vọng:

```text
dev:
mnhat1/api-gateway:dev-<BUILD_NUMBER>-<SHA>

prod:
mnhat1/api-gateway:prod-<BUILD_NUMBER>-<SHA>
```

---

## 16. Rollback

Vì hệ thống dùng GitOps, rollback nên thực hiện bằng cách revert commit trong repository `k8s-manifests`.

Ví dụ:

```bash
git revert <commit_id>
git push origin main
```

Sau đó ArgoCD sẽ sync lại trạng thái trước đó.

Không nên rollback bằng cách sửa trực tiếp resource trong Kubernetes, vì ArgoCD sẽ đưa cluster về lại trạng thái trong Git.

---

## 17. Troubleshooting

### 17.1 Pod bị ImagePullBackOff

Kiểm tra image trong deployment:

```bash
kubectl -n dev get deploy api-gateway -o jsonpath="{.spec.template.spec.containers[0].image}{'\n'}"
kubectl -n prod get deploy api-gateway -o jsonpath="{.spec.template.spec.containers[0].image}{'\n'}"
```

Nguyên nhân thường gặp:

```text
- Image tag không tồn tại trên DockerHub.
- Jenkins chưa push image thành công.
- k8s-manifests vẫn còn tag placeholder.
- DockerHub bị timeout.
```

### 17.2 ArgoCD báo Unknown hoặc ComparisonError

Refresh application:

```bash
kubectl -n argocd annotate application kltn-dev argocd.argoproj.io/refresh=hard --overwrite
kubectl -n argocd annotate application kltn-prod argocd.argoproj.io/refresh=hard --overwrite
```

Restart repo server:

```bash
kubectl -n argocd rollout restart deployment/argocd-repo-server
kubectl -n argocd rollout status deployment/argocd-repo-server
```

Xem log:

```bash
kubectl -n argocd logs deployment/argocd-repo-server --tail=100
```

### 17.3 Pod bị Pending

Kiểm tra lý do:

```bash
kubectl -n prod describe pod <pod-name>
```

Nếu thấy:

```text
Insufficient cpu
Insufficient memory
```

thì cần giảm replicas hoặc tăng node group EKS.

### 17.4 Jenkins bị DockerHub timeout

Pipeline đã có retry cho `docker login` và `docker push`. Nếu vẫn fail, chạy lại build sau vài phút.

Không khuyến nghị push quá nhiều image song song vì dễ gây lỗi network hoặc DockerHub timeout.

---

## 18. Cấu trúc thư mục chính

```text
frontend/
services/
  api-gateway/
  auth-service/
  users-service/
  tours-service/
  bookings-service/
  reviews-service/
  blog-service/
  chat-service/
packages/
  common/
scripts/
  seed-rich.js
Jenkinsfile
docker-compose.yml
sonar-project.properties
.env.example
README.md
```

---

## 19. Repository liên quan

```text
Application source:
https://github.com/minhnhatuit734/KLTN-dev

Infrastructure as Code:
https://github.com/minhnhatuit734/kltn-terraform

Kubernetes manifests:
https://github.com/minhnhatuit734/k8s-manifests

Rasa/MLOps Chatbot:
https://github.com/ThinhQuang08/Chatbot
```

---
