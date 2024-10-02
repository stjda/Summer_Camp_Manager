# South Texas Juvenile Diabetes Association Workflow Automation

 #### Link to the project board
 https://miro.com/app/board/uXjVKEp7qgo=/ 

## Overview
The South Texas Juvenile Diabetes Association (STSJ) Workflow Automation project aims to streamline and automate the workflow processes for the association. The application will be developed as a progressive web app (PWA) using Node.js and will utilize two SQL databases for data storage and replication. 

To start the project, cd into the STJDA_APP directory and NPM run dev to start the development servers

## Repo Engagment
#### Egnament process

1) Make changes
2) add and commit changes & open a new pull request
3) New code additions must be peer reviewed
4) New code additions mu be peer approved
5) Commit changes


## Key Features
- Automate and streamline workflow processes for STSJ
- Progressive Web App (PWA) for enhanced user experience and offline functionality
- Built using Node.js for server-side scripting
- Utilizes two SQL databases:
  - Master database for primary data storage
  - Slave database for data replication and backup
- Real-time data synchronization between master and slave databases
- Responsive and user-friendly interface
- Secure authentication and authorization mechanisms
- Integration with existing STSJ systems and tools
- My sql database: to run the schema use this: ```mysql -u username -p < /path/to/your/schema.sql```

## Technical Stack
- Front-end:
  - React.js by Meta, HTML5, CSS3, Vite
  - Progressive Web App (PWA) technologies
  - Responsive design frameworks (Google Material-UI)
- Back-end:
  - Node.js
  - Express.js (web application framework)
  - MySQL workbench for remote administration
  - SQL databases (MySQL)
  - Database replication and synchronization mechanisms
- Development Tools:
  - Version control system (Git)
  - Integrated Development Environment (IDE) (Visual Studio Code)
  - Package manager (npm)
  - Testing frameworks (Jest)
- Deployment:
  - Cloud hosting platforms (e.g., AWS, Google Cloud, Heroku)
  - Manual Deployment : See Manual Deployment Section (If the organization scales CI/CD would be recomended)

## Database Architecture
The application will utilize two SQL databases:
1. Master Database:
   - Primary database for storing all the application data
   - Handles read and write operations
   - Ensures data integrity and consistency
2. Slave Database:
   - Replicates data from the master database
   - Provides a backup and failover mechanism
   - Handles read-only operations to distribute the load
   - Keeps data in sync with the master database

## Development Roadmap
1. Requirements Gathering and Analysis
2. System Design and Architecture
3. Database Design and Setup
4. Back-end Development (Node.js, Express.js)
5. Front-end Development (PWA, HTML, CSS, React)
6. Integration of Master and Slave Databases
7. Testing and Quality Assurance
8. Deployment and Server Setup
9. User Acceptance Testing (UAT)
10. Launch and Maintenance

## Additional Considerations
- Security measures for protecting sensitive data
- Performance optimization techniques
- Scalability and load balancing strategies
- Backup and disaster recovery plans
- User training and documentation
- Ongoing maintenance and updates

By leveraging Node.js, progressive web app technologies, and a robust database architecture with master-slave replication, the STSJ Workflow Automation application aims to provide a reliable, efficient, and user-friendly solution for streamlining the association's workflow processes.

## Manual Deployment

To manually deploy the STSJ Workflow Automation application, follow these steps:

1. Prerequisites:
   - Ensure that Node.js and npm (Node Package Manager) are installed on the deployment server.
   - Set up the necessary SQL databases (master and slave) and ensure they are accessible from the deployment server.

2. Server Setup:
   - Provision a server or virtual machine with the required specifications (e.g., CPU, RAM, storage) to host the application.
   - Install and configure the necessary server software (e.g., web server, database server) on the deployment server.

3. Application Setup:
   - Clone the application source code from the version control repository (e.g., Git) to the deployment server.
   - Navigate to the project directory and install the required dependencies using npm:
     ```
     npm install
     ```

4. Database Configuration:
   - Update the database connection settings in the application configuration files to point to the master and slave databases.
   - Ensure that the application has the necessary permissions to access and modify the databases.

5. Build Process:
   - Run the build process to compile and optimize the front-end assets (HTML, CSS, JavaScript) using the appropriate build tools (e.g., Webpack, Babel).
   - The build process should generate production-ready files in a designated output directory.

6. Server Configuration:
   - Configure the web server (e.g., Apache, Nginx) to serve the application files from the build output directory.
   - Set up the necessary server-side configurations, such as port numbers, SSL certificates, and proxy settings.

7. Environment Variables:
   - Set up the required environment variables on the deployment server, such as database connection strings, API keys, and other sensitive information.
   - Ensure that these variables are securely stored and accessible to the application.

8. Database Migration and Seeding:
   - Run any necessary database migrations or seeding scripts to set up the initial database structure and populate it with sample data.

9. Application Startup:
   - Start the Node.js application using the appropriate command (e.g., `node app.js` or `npm start`).
   - Ensure that the application starts without any errors and is accessible via the configured server port.

10. Testing and Verification:
    - Perform thorough testing of the deployed application to ensure all functionalities are working as expected.
    - Verify that the application can connect to the databases and perform read and write operations correctly.
    - Test the application's responsiveness, performance, and error handling.

11. Monitoring and Logging:
    - Set up monitoring and logging mechanisms to track the application's health, performance, and any potential issues.
    - Configure alerts and notifications to promptly address any critical errors or downtime.

12. Backup and Disaster Recovery:
    - Implement regular backup processes for the application files, databases, and any other critical data.
    - Establish a disaster recovery plan to ensure quick recovery and minimal downtime in case of any unforeseen events.

## Setting up the services
- Youll need to setup the microservices for this app, including redis, mysql (master and slave) using Docker containers to run the services, 
# Run the master database and mount a volume to persist data @ /var/lib/mysql inside the docker container
* For MySql: 
docker run --name mysql-master \
  -e MYSQL_ROOT_PASSWORD=Colorado1! \
  -e MYSQL_DATABASE=STJDA \
  -e MYSQL_USER=guymorganb \
  -e MYSQL_PASSWORD=Colorado1! \
  -p 3306:3306 \
  -v mysql-master-data:/var/lib/mysql \
  -d mysql:latest

# Run the slave database
docker run --name mysql-slave \
  -e MYSQL_ROOT_PASSWORD=my-secret-pw \
  -e MYSQL_DATABASE=mydatabase \
  -e MYSQL_USER=myuser \
  -e MYSQL_PASSWORD=mypassword \
  -p 3307:3306 \
  -v mysql-slave-data:/var/lib/mysql \
  -d mysql:latest

# Import any existing SQL data
Copy the dump file to the container:
docker cp stjda_backup.sql 78f2edee8b42:/stjda_backup.sql
docker exec -it [container_id] sh -C 'mysql -u root -p[password] [database_name] < /stjda_backup.sql'

# log into mysql shell inside the docker container
docker exec -it [container_id] mysql -u root -p[password] [database_name]

* for Redis: docker pull redis && docker pull redislabs/redisinsight && docker run --name my-redis -p 6379:6379 -d redis && docker run --name redis-stack -p 8001:8001 -d redislabs/redisinsight

* For GraphQL: 
 - From the apolloServer Directory, build the docker image:  docker build -t apollo-server .
 - start the apollo-server container on the proper port: docker run --name my-apollo-server -p 4000:4000 -d apollo-server
 - create a docker network so apollo can contact the mysql database: 
      * docker network create apollo-net
   - If your MySQL container is named mysql-master, you can connect it to the network:
      * docker network connect apollo-net mysql-master
   - Run Apollo Server Container on the Same Network
      * docker run --name my-apollo-server -p 4000:4000 --network apollo-net -d apollo-server
   - Update Database Connection Configuration:
         In your Apollo Server configuration, change the MySQL connection settings to use the name of the MySQL container as the host instead of 127.0.0.1. For example, if your MySQL container is named mysql-master, the Sequelize configuration should look something like this:
         ``` javascript
         const sequelize = new Sequelize('database', 'username', 'password', {
            host: 'mysql-master',
            dialect: 'mysql',
            ...
         });
# Stop cleanup and restart Docker for apollo server container
   - To start over: Make sure you cd into the server directory:

   #### Stop the running container
   docker stop my-apollo-server

   #### Remove the container (on the host VM/machine)
   docker rm my-apollo-server

   #### Remove the image
   docker rmi my-apollo-server // run this on your local machine with the server code
   docker images               // remove image from both machines
   docker rmi [image id]

   #### Rebuild the image
   docker build -t my-apollo-server .

# Tag and Push the server image to your dockerhub
   - docker login
   docker tag my-apollo-server gbeals1/api-servers:ApolloServer-SQL_API-v1.0
   docker push gbeals1/api-servers:ApolloServer-SQL_API-v1.0

#### build the express-server for both arm64 and amd64 - this will replace existing images pushed to dockerhub
   docker buildx build --platform linux/amd64,linux/arm64 -t gbeals1/api-servers:ApolloServer-SQL_API-v1.0 --push .
   
#### Run the container again with the same settings as before
docker run --name my-apollo-server \
  -p 4000:4000 \
  --network apollo-net \
  -e MASTERPORT=3306 \
  -e SLAVEPORT=3307 \
  -e DB_NAME=STJDA \
  -e DB_USER=root \
  -e DB_PW=Colorado1! \
  -e NODE_ENV=development \
  gbeals1/api-servers:ApolloServer-SQL_API-v1.0

# If you're running on Linux, 'host.docker.internal' might not work out of the box. In this case, you have two options:
* 'host.docker.internal' is a special DNS name that resolves to the host machine's localhost on Docker for Windows and macOS.

   a. Use the host's network IP address (usually starts with 172.17.0.1) instead of 'host.docker.internal'.
   b. Add '--add-host=host.docker.internal:host-gateway' to your Docker run command.

docker run --name my-apollo-server \
   -p 4000:4000 \
   --network apollo-net \
   --add-host=host.docker.internal:host-gateway \
   -e MASTERPORT=3306 \
   -e SLAVEPORT=3307 \
   -e DB_NAME=STJDA \
   -e DB_USER=root \
   -e DB_PW=Colorado1! \
   -e NODE_ENV=development \
   gbeals1/api-servers:ApolloServer-SQL_API-v1.0

* Ensure your Express server on the host machine is listening on all interfaces, not just localhost:

app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});

* Use docker network inspect apollo-net to ensure your Apollo server container is

#### View the logs
   * docker logs -f my-apollo-server 
#### Exec into the container
   * docker exec -it my-apollo-server /bin/sh 


#### Command to run the schema for the database in Docker: 
- docker exec -i mysql-master mysql -u root -pColorado1! STJDA < schema.sql

# MinIO object Storage in Docker
```bash
#turn off auto correct, dont change anything with autocorrect
unsetopt correct_all

docker run -p 9000:9000 -p 9001:9001 \
  --name minio1 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v ~/minio-data:/data \
  -d minio/minio server /data --console-address ":9001"
```
### Here’s what each part of the command does:
```bash
   -p 9000:9000 and -p 9001:9001: Maps ports 9000 and 9001 from the container to the same ports on your host, which MinIO uses for API calls and the management console, respectively.
   --name minio1: Names the container minio1.
   -e "MINIO_ROOT_USER=minioadmin": Sets the MinIO root user to minioadmin.
   -e "MINIO_ROOT_PASSWORD=minioadmin": Sets the MinIO root password to minioadmin.
   -v /mnt/data:/data: Mounts the /mnt/data directory on your host to /data inside the container. You should replace /mnt/data with a path on your host where you want to store MinIO data.
   -d minio/minio: Uses the minio/minio image from Docker Hub and runs it in detached mode.
   server /data: Tells MinIO to serve from the /data directory inside the container.
   --console-address ":9001": Specifies the address for the MinIO console.
   After running this command, you can access the MinIO web interface at http://localhost:9001 using the credentials provided (minioadmin for both user and password).
```

# Step 2: Integrating MinIO with a Node.js Project
```bash
npm install aws-sdk
```
```javascript
const AWS = require('aws-sdk'); // this goes on the server

// Configure the AWS SDK to use MinIO
const s3 = new AWS.S3({
    accessKeyId: 'minioadmin', // Replace with your actual access key
    secretAccessKey: 'minioadmin', // Replace with your actual secret key
    endpoint: 'http://localhost:9000', // Use the IP of your Docker host if not running locally
    s3ForcePathStyle: true, // Needed with MinIO
    signatureVersion: 'v4'
});

module.exports = s3;

// xample usage:
const s3 = require('./minioClient');

function uploadFile(buffer, bucketName, key) {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer
    };

    // List buckets
s3.listBuckets((err, data) => {
  if (err) console.log(err, err.stack);
  else console.log('Buckets:', data.Buckets);
});

// Create a bucket
s3.createBucket({ Bucket: 'my-bucket' }, (err, data) => {
  if (err) console.log(err, err.stack);
  else console.log('Bucket created successfully', data);
});

// Upload an object to a bucket
s3.putObject({
  Bucket: 'my-bucket',
  Key: 'my-object',
  Body: 'Hello World!'
}, (err, data) => {
  if (err) console.log(err, err.stack);
  else console.log('Object uploaded successfully', data);
});


s3.upload(params, function(err, data) {
   if (err) {
      console.log("Error", err);
   } if (data) {
      console.log("Upload Success", data.Location);
   }
});
}

// Example usage:
// uploadFile(Buffer.from('Hello MinIO!'), 'my-bucket', 'hello.txt');
```

