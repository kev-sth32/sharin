#!/bin/bash
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PARENT="/home/admin/tripnaari_backups"
BACKUP_DIR="${BACKUP_PARENT}/backup_${TIMESTAMP}"
ARCHIVE_NAME="tripnaari_complete_backup_${TIMESTAMP}.tar.gz"

echo "=== [1/6] Creating backup directories at ${BACKUP_DIR} ==="
mkdir -p "${BACKUP_DIR}/database"
mkdir -p "${BACKUP_DIR}/app"
mkdir -p "${BACKUP_DIR}/uploads"
mkdir -p "${BACKUP_DIR}/config"
mkdir -p "${BACKUP_DIR}/docker"

echo "=== [2/6] Dumping PostgreSQL database 'tripnaari' ==="
docker exec tripnaari-postgres pg_dump -U tripnaari_user -d tripnaari | gzip > "${BACKUP_DIR}/database/tripnaari.sql.gz"
echo "Database dump complete. Size: $(du -h "${BACKUP_DIR}/database/tripnaari.sql.gz" | cut -f1)"

echo "=== [3/6] Archiving application code, .env, and .data persistence ==="
tar -czf "${BACKUP_DIR}/app/tripnaari_app.tar.gz" \
  --exclude="node_modules" \
  --exclude=".next" \
  --exclude="public/uploads" \
  --exclude=".data/temp-*.pdf" \
  -C /home/admin/tripnaari/app .
echo "App archive complete. Size: $(du -h "${BACKUP_DIR}/app/tripnaari_app.tar.gz" | cut -f1)"

echo "=== [4/6] Archiving uploaded PDFs & media ==="
tar -czf "${BACKUP_DIR}/uploads/tripnaari_uploads.tar.gz" -C /home/admin/tripnaari/app/public uploads
echo "Uploads archive complete. Size: $(du -h "${BACKUP_DIR}/uploads/tripnaari_uploads.tar.gz" | cut -f1)"

echo "=== [5/6] Archiving Nginx configurations & SSL Certificates ==="
tar -czf "${BACKUP_DIR}/config/nginx_conf.tar.gz" -C /home/admin/docker/nginx conf.d
sudo tar -czf "${BACKUP_DIR}/config/ssl_certs.tar.gz" -C /home/admin/docker/certbot conf
sudo chown admin:admin "${BACKUP_DIR}/config/ssl_certs.tar.gz"
echo "Configs archive complete."

cat << 'DC' > "${BACKUP_DIR}/docker/docker-compose.yml"
version: '3.8'

services:
  tripnaari-postgres:
    image: postgres:16-alpine
    container_name: tripnaari-postgres
    restart: always
    environment:
      POSTGRES_USER: tripnaari_user
      POSTGRES_PASSWORD: "TripNaari@2026pg"
      POSTGRES_DB: tripnaari
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - ./postgres_data:/var/lib/postgresql/data

  nginx:
    image: nginx:latest
    container_name: nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
      - ./uploads:/var/www/uploads
DC

cat << 'DOC' > "${BACKUP_DIR}/README_MIGRATION.md"
# TripNaari Migration Guide

## Package Contents
1. database/tripnaari.sql.gz - Full PostgreSQL dump
2. app/tripnaari_app.tar.gz - Next.js source code, .env file, and .data/ local json datastore
3. uploads/tripnaari_uploads.tar.gz - All brochure PDFs and media
4. config/nginx_conf.tar.gz - Production Nginx reverse proxy configs
5. config/ssl_certs.tar.gz - Let's Encrypt certificates
6. docker/docker-compose.yml - Docker compose specification for PostgreSQL & Nginx

## Step 1: Destination Server Prerequisites
- Docker & Docker Compose
- Node.js v20.x (recommended via NVM) & PM2
- Git, tar, gzip, curl

## Step 2: Restore Database & Nginx
1. Place docker-compose.yml in destination folder.
2. Unpack config/nginx_conf.tar.gz into ./nginx/conf.d
3. Unpack config/ssl_certs.tar.gz into ./certbot/conf
4. Start database container:
   docker compose up -d tripnaari-postgres
5. Restore database:
   gunzip -c database/tripnaari.sql.gz | docker exec -i tripnaari-postgres psql -U tripnaari_user -d tripnaari

## Step 3: Restore Next.js App
1. Extract app/tripnaari_app.tar.gz to destination directory (e.g. /home/admin/tripnaari/app)
2. Extract uploads/tripnaari_uploads.tar.gz into public/ folder
3. Verify .env file is in the root of the app
4. Install dependencies and build:
   npm install
   npm run build
5. Start app with PM2:
   pm2 start npm --name "tripnaari" -- start
   pm2 save

## Step 4: Start Nginx & Switch DNS
1. Start Nginx container:
   docker compose up -d nginx
2. Test local endpoint:
   curl -I http://localhost:3000
3. Update DNS A-records (tripnaari.com & www.tripnaari.com) to point to the new server IP.
DOC

echo "=== [6/6] Packaging into single unified archive ==="
cd "${BACKUP_PARENT}"
tar -czf "${ARCHIVE_NAME}" -C "${BACKUP_PARENT}" "backup_${TIMESTAMP}"
ln -sf "${ARCHIVE_NAME}" tripnaari_latest_backup.tar.gz

echo "=== BACKUP COMPLETED SUCCESSFULLY ==="
ls -lh "${BACKUP_PARENT}/${ARCHIVE_NAME}"
echo "Archive path: ${BACKUP_PARENT}/${ARCHIVE_NAME}"
