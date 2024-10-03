#!/bin/sh

# Create necessary directories with proper permissions
mkdir -p /usr/src/app/.pm2 /usr/src/app/logs
mkdir -p /usr/src/app/certificates /usr/src/app/certs /usr/src/app/CAs
chown -R nodejs:nodejs /usr/src/app/.pm2 /usr/src/app/logs /usr/src/app/certificates /usr/src/app/certs /usr/src/app/CAs

# Check if the mounted volume is empty
if [ -z "$(ls -A /usr/src/app/.well-known/pki-validation)" ]; then
    echo "Mounted volume is empty, proceeding with setup."
else
    echo "WARNING: Mounted volume is not empty. Clearing contents for fresh start."
    rm -rf /usr/src/app/.well-known/pki-validation/*
fi

# check for the updatedb script
if npm run updatedb &>/dev/null; then
  echo "Geoip-lite database updated successfully"
else
  echo "Warning: Failed to update geoip-lite database. Continuing with startup."
fi

# Set permissions for the mounted volume
chown -R nodejs:nodejs /usr/src/app/.well-known/pki-validation
chmod -R 755 /usr/src/app/.well-known/pki-validation

chown -R nodejs:nodejs /usr/src/app/certificates /usr/src/app/certs /usr/src/app/CAs
chmod -R 755 /usr/src/app/certificates /usr/src/app/certs /usr/src/app/CAs

# Update geoip-lite database
echo "Updating geoip-lite database..."
su-exec nodejs npm run updatedb

# Before starting PM2
echo "Current working directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo "Contents of /usr/src/app:"
ls -la /usr/src/app

echo "Checking if ecosystem.config.js exists:"
if [ -f "/usr/src/app/ecosystem.config.js" ]; then
    echo "ecosystem.config.js found"
else
    echo "ecosystem.config.js not found"
fi

echo "Starting PM2 with ecosystem file..."

# Ensure Node.js still has the capability to bind to privileged ports
setcap 'cap_net_bind_service=+ep' $(which node)

# Switch to the nodejs user and start PM2 with the correct command
exec su-exec nodejs node ./node_modules/pm2/bin/pm2-runtime start ecosystem.config.js