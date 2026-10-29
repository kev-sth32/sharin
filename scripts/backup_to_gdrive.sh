#!/bin/bash
set -e

LOGFILE="/home/admin/tripnaari_backups/backup_cron.log"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "==========================================" >> "$LOGFILE"
echo "Starting TripNaari Backup: $TIMESTAMP" >> "$LOGFILE"

# 1. Run complete local backup script to generate fresh archive
/home/admin/tripnaari/create_complete_backup.sh >> "$LOGFILE" 2>&1

# 2. Upload to Google Drive
if which rclone >/dev/null 2>&1 && rclone listremotes | grep -q "^gdrive:"; then
    echo "Finding latest backup archive..." >> "$LOGFILE"
    LATEST_ARCHIVE=$(ls -t /home/admin/tripnaari_backups/tripnaari_complete_backup_*.tar.gz 2>/dev/null | head -n 1)
    
    if [ -n "$LATEST_ARCHIVE" ] && [ -f "$LATEST_ARCHIVE" ]; then
        echo "Uploading $LATEST_ARCHIVE to Google Drive (gdrive:TripNaari_Backups)..." >> "$LOGFILE"
        rclone copy "$LATEST_ARCHIVE" gdrive:TripNaari_Backups/ >> "$LOGFILE" 2>&1
        
        # Also maintain a latest pointer copy in Google Drive
        rclone copyto "$LATEST_ARCHIVE" gdrive:TripNaari_Backups/tripnaari_latest_backup.tar.gz >> "$LOGFILE" 2>&1
    else
        echo "[ERROR] No backup archive found to upload!" >> "$LOGFILE"
    fi

    # Clean Google Drive backups older than 30 days (excluding latest pointer)
    echo "Pruning Google Drive backups older than 30 days..." >> "$LOGFILE"
    rclone delete gdrive:TripNaari_Backups/ --min-age 30d --exclude="tripnaari_latest_backup.tar.gz" >> "$LOGFILE" 2>&1
    echo "Google Drive sync complete." >> "$LOGFILE"
else
    echo "[WARN] gdrive remote not configured in rclone, skipped cloud upload." >> "$LOGFILE"
fi

# 3. Clean local VPS archives older than 7 days to conserve disk space
echo "Pruning local server backups older than 7 days..." >> "$LOGFILE"
find /home/admin/tripnaari_backups/ -maxdepth 1 -name "tripnaari_complete_backup_*.tar.gz" -mtime +7 -delete 2>/dev/null || true
find /home/admin/tripnaari_backups/ -maxdepth 1 -type d -name "backup_*" -mtime +7 -exec rm -rf {} + 2>/dev/null || true

FINISHED=$(date +"%Y-%m-%d %H:%M:%S")
echo "Backup finished successfully at $FINISHED" >> "$LOGFILE"
