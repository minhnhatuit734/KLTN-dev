import os

argocd_dir = r"c:\Project\k8s-manifests\argocd"
apps = ["kltn-dev-app.yaml", "kltn-prod-app.yaml"]

ignore_diff_block = """
  ignoreDifferences:
  - group: apps
    kind: Deployment
    jsonPointers:
    - /spec/replicas
"""

for app in apps:
    app_path = os.path.join(argocd_dir, app)
    if os.path.exists(app_path):
        with open(app_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "ignoreDifferences:" not in content:
            content += ignore_diff_block
            
            with open(app_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Patched {app}")
