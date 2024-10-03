# South Texas Juvenile Diabetes Registration Intake System

## Overview

This project implements a registration intake system for South Texas Juvenile Diabetes, utilizing Docker containers for an Express.js API server and MinIO object storage.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Usage](#usage)
4. [Cleanup](#cleanup)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker installed on your local machine and VM
- Access to a Google Cloud account
- Docker Hub account

## Setup

### Google Cloud Setup

1. Create a Google Cloud project
2. Enable the Compute Engine API
3. Enable the Compute Groups API
4. Set up a VM with persistent storage
5. Connect to the VM via SSH using the Google SSH Browser tool

### Docker Network Setup

Create a Docker network for apollo-net:

```bash
docker network create apollo-net
```

### Building and Pushing Docker Images

#### Express API Server

1. Navigate to the directory containing your Dockerfile
2. Build for multiple architectures:

```bash
docker buildx create --name mybuilder --use
docker buildx inspect --bootstrap
docker buildx build --platform linux/amd64,linux/arm64 -t yourdockerhub/api-servers:reverse-proxy-v1.0 --push .
```

## Usage

### Running the Express API Server first
#### Note: This server runs in automation and will send emails to you when it runs renewals and maintanence, but you need to setup the details of the maintanence

```bash
docker run -d --name my-reverse-proxy \
  -p 80:80 \
  -p 443:443 \
  -p 3002:3002 \
  --platform linux/amd64 \
  --network apollo-net \
  -e NODE_ENV=production \
  -e ENDPOINT=https://VM_IP:9000 \
  -e ACCESS_KEY_ID=stjdaadmin \
  -e SECRET_ACCESS_KEY=stjdaadmin \
  -e REGION=us-east-1 \
  -e EMAIL=your-email@example.com \
  -e DOMAIN=YOUR_VM_IP \
  -e ZEROSSL_API_KEY=YOUR_ZEROSSL_API_KEY \
  -e SMTP_PASS=YOUR_SMTP_PASS \
  -e CERTIFICATE_DIR=/usr/src/app/certificates \
  -e DB_CERT_DIR=/usr/src/app/certs \
  -v /path/to/pki-validation:/usr/src/app/.well-known/pki-validation \
  -v /path/to/certificates:/usr/src/app/certificates \
  -v /path/to/logs:/usr/src/app/logs \
  -v /path/to/certs:/usr/src/app/certs \
  -v /path/to/CAs:/usr/src/app/CAs \
  --user root \
  gbeals1/api-servers:reverse-proxy-v1.0
```


```

## Cleanup

### Stopping and Removing Containers

```bash
# Stop containers
docker stop my-reverse-proxy

# Remove containers
docker rm my-reverse-proxy
```

### Removing Images

```bash
docker images

# Remove image
docker rmi [IMAGE ID]

```

## Troubleshooting

### Viewing Logs

```bash
# View Express API logs
docker logs -f my-reverse-proxy
```

### Accessing Containers

```bash
# Access Express API container
docker exec -it my-reverse-proxy /bin/sh
```

### Certificate Cleanup Utility

To clean up certificates maually from comand line exec into the container and run:

```bash
node /usr/src/app/util/ManualCertificateHandler.js
```

# Typical command sequence example

#### Stop the running container
docker stop my-reverse-proxy

#### Remove the container
docker rm my-reverse-proxy

#### Remove the imagefrom the VM
docker images
docker rmi [IMAGE ID]
docker rmi [IMAGE ID]

#### Remove the image (optional, as it's an official image)
docker rmi my-reverse-proxy-app  <-- supposed to be 'app'
docker images  // remove image from both machines
docker rmi [IMAGE ID]

#### Rebuild and tag, then cross build and push to dockerhub:
docker build -t my-reverse-proxy-app .

# Tag and Push the server image to your dockerhub
- docker login
docker tag my-reverse-proxy-app gbeals1/api-servers:reverse-proxy-v1.0
docker push gbeals1/api-servers:reverse-proxy-v1.0

#### build the express-server for both arm64 and amd64 - this will replace existing images pushed to dockerhub
docker buildx build --platform linux/amd64,linux/arm64 -t gbeals1/api-servers:reverse-proxy-v1.0 --push .

- Now pull the images on the VM using docker run commands