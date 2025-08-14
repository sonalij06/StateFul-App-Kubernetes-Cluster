# 🚀 Node.js + Redis Application with Kubernetes HPA

This project demonstrates deploying a **Node.js application** that uses **Redis** as a backend, containerizing it with **Docker**, and deploying it to **Kubernetes** with **Horizontal Pod Autoscaler (HPA)** to scale based on CPU usage.

---

## 📌 Features
- Node.js app with Redis integration
- Docker containerization
- Kubernetes manifests for:
  - Deployment
  - Service
  - ConfigMap
  - Horizontal Pod Autoscaler
- Metrics Server for autoscaling
- Load testing to trigger scaling
- Automatic scale-down when load decreases

---

## ⚙️ Prerequisites
- Docker
- Kubernetes cluster (Minikube, kind, or cloud-based)
- `kubectl` CLI
