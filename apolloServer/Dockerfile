# Use the official Node.js 20 image as a parent image
FROM node:20-alpine

# Install nano
RUN apk update && apk add nano

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

RUN npm install --production  # Ensure only production dependencies are installed

# Bundle app source
COPY . .

EXPOSE 4000
CMD ["node", "server.js"]
