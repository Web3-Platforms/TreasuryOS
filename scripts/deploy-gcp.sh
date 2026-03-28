#!/usr/bin/env bash
# deploy-gcp.sh - Deploy TreasuryOS to Google Cloud Run
# Usage: ./scripts/deploy-gcp.sh <PROJECT_ID> <REGION>

set -euo pipefail

PROJECT_ID="${1:?Usage: deploy-gcp.sh <PROJECT_ID> <REGION>}"
REGION="${2:-us-central1}"
REPO="treasuryos"
API_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/api-gateway:latest"
DASHBOARD_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/dashboard:latest"

echo "==> Configuring GCP project: ${PROJECT_ID}"
gcloud config set project "${PROJECT_ID}"

echo "==> Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com

echo "==> Creating Artifact Registry (if needed)..."
gcloud artifacts repositories describe "${REPO}" \
  --location="${REGION}" 2>/dev/null || \
gcloud artifacts repositories create "${REPO}" \
  --repository-format=docker \
  --location="${REGION}"

echo "==> Authenticating Docker..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "==> Building API Gateway image..."
docker build \
  --target api-gateway-runner \
  --build-arg APP_NAME=api-gateway \
  -t "${API_IMAGE}" .

echo "==> Building Dashboard image..."
docker build \
  --target dashboard-runner \
  --build-arg APP_NAME=dashboard \
  -t "${DASHBOARD_IMAGE}" .

echo "==> Pushing images..."
docker push "${API_IMAGE}"
docker push "${DASHBOARD_IMAGE}"

echo "==> Deploying API Gateway to Cloud Run..."
gcloud run deploy treasuryos-api \
  --image="${API_IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --port=3001 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=3

API_URL=$(gcloud run services describe treasuryos-api --region="${REGION}" --format='value(status.url)')
echo "==> API Gateway deployed at: ${API_URL}"

echo "==> Deploying Dashboard to Cloud Run..."
gcloud run deploy treasuryos-dashboard \
  --image="${DASHBOARD_IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --port=3000 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,API_BASE_URL=${API_URL}/api" \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=3

DASHBOARD_URL=$(gcloud run services describe treasuryos-dashboard --region="${REGION}" --format='value(status.url)')
echo "==> Dashboard deployed at: ${DASHBOARD_URL}"

echo ""
echo "============================================"
echo " Deployment Complete!"
echo " API:       ${API_URL}"
echo " Dashboard: ${DASHBOARD_URL}"
echo "============================================"
