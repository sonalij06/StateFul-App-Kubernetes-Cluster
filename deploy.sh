#!/usr/bin/env bash
set -euo pipefail

NS=stateful-demo

echo "[*] Creating namespace..."
kubectl apply -f app/namespace.yml

echo "[*] Deploying Redis (StatefulSet with PVC)..."
kubectl apply -f app/redis/configMap.yml
kubectl apply -f app/redis/headless-svc.yml
kubectl apply -f app/redis/clusterIp-svc.yml
kubectl apply -f app/redis/statefulset-svc.yml

echo "[*] Deploying App..."
kubectl apply -f app/app/configMap.yml
kubectl apply -f app/app/deployment.yml
kubectl apply -f app/app/service.yml
kubectl apply -f app/app/servicemonitor.yml
kubectl apply -f app/app/hpa.yml

echo "App svc inside cluster: http://node-redis-app.stateful-demo.svc.cluster.local"
echo "Port-forward app: kubectl -n $NS port-forward svc/node-redis-app 8080:80"
echo "Test: curl -XPOST http://localhost:8080/hit ; curl http://localhost:8080/count"
