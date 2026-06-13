import os
import re

base_dir = r"c:\Project\k8s-manifests\base"
services = ["api-gateway", "frontend", "users-service", "tours-service", "bookings-service", "reviews-service", "blog-service", "chat-service", "auth-service"]

for service in services:
    deployment_file = os.path.join(base_dir, service, "deployment.yaml")
    
    if os.path.exists(deployment_file):
        with open(deployment_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Remove "  replicas: 1\n"
        new_content = re.sub(r'\s*replicas:\s*\d+\n', '\n', content)
        
        with open(deployment_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed replicas from {deployment_file}")
