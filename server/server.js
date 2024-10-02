const express = require('express')
const cookieParser = require('cookie-parser');
const sequelize = require('./config/connection.js');    
const path = require('path')
const cors = require('cors')
const { config } = require('dotenv');
const controllers = require('./controllers/index.js')
const models = require('./models/index.js')

const Redis = require('ioredis');
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});
// import { readFileSync } from "fs";
// import connectDB from './config/connection.js'
// import seedDatabase from './config/seeds.js'; 


config({ path: '.env' });

const PORT = process.env.PORT || 3000; // Default to 3001 if process.env.PORT is not set
const SPECIAL_PORT = process.env.SPECIAL_PORT;

const app = express()
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Allow cookies and other credentials to be sent with requests
}));

// Body parser configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(cookieParser());

app.use("/api", controllers);


async function syncAllModels() {
  try {
      // Authenticate with the database
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');

      // Dynamically sync all models with 'alter: true'
      for (const modelName in models) {
          if (models.hasOwnProperty(modelName)) {
              await models[modelName].sync({ alter: true });
              console.log(`Synced ${modelName} successfully.`);
          }
      }
      console.log('All models were synchronized successfully.');
  } catch (error) {
      console.error('Unable to sync the database:', error);
  }
}

async function connectToRedis() {
  try {

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    console.log(`Connected to Redis @ port 🔑 ${process.env.REDISPORT}!
      📭  query @ http://localhost:${process.env.REDISPORT}! \n`);

  } catch (err) {
    console.error('Failed to connect to Redis', err);
    throw err;
  }
}
 

(async () => {

    try {
      connectToRedis();
      console.log('Connection has been established successfully.');
  //  await syncAllModels()    

    console.log("env" + process.env.NODE_ENV +"\n")

    // Health Check Endpoint
    app.get('/health', (req, res) => {
        // Custom health checks, e.g., database connections
        res.status(200).send('Healthy');
    });

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/dist')));
        
        app.get('*', (req, res) => {
          res.sendFile(path.join(__dirname, '../client/dist/index.html'));
        });
    }

    // Start the server
    app.listen(PORT, SPECIAL_PORT, () => {
        console.log(`Express server running on port 🔑 ${PORT}!
        📭  query @ http://localhost:${PORT}/ & http://localhost:${SPECIAL_PORT}/`);
      });     
    }

    catch (error) {
      console.error('Error during server startup:', error);
    }

})();
module.exports = redisClient;