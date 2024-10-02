const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { config } = require('dotenv');

config({ path: './.env' });

const Redis = require('ioredis');
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// GET route to check the cache
// /api/redis/cache/:key
router.get('/cache/:key', async (req, res) => {
    try {
        // redis a key value store
      const { key } = req.params;
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        return res.json({ data: JSON.parse(cachedData) });
      } else {
        return res.json({ message: 'Cache key not found' });
      }
    } catch (error) {
      console.error('Error fetching from cache:', error);
      res.status(500).json({ message: 'Error fetching from cache' });
    }
  });
  
// PUT route to update or clear the cache
router.put('/cache/:key', async (req, res) => {

// Clearing the cache: 
// If the value in the request body is explicitly set to null, it will delete the key from Redis.
// Updating the cache: If a value is provided, it will set or update the key in Redis with the new value.
// Error handling: If value is undefined (not provided in the request), it will return a 400 error.
try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === null) {
      const deleteResult = await redisClient.del(key);

      if (deleteResult === 1) {
        return res.json({ message: 'Cache cleared successfully' });
      } else {
        return res.json({ message: 'Cache key not found' });
      }
    } else if (value === undefined) {
      return res.status(400).json({ message: 'Value is required' });
    }

    // Parse the value if it's a string, otherwise use it as is
    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;

    // Extract sessionExpiry from the parsed value
    const sessionExpiry = parsedValue.sessionExpiry;

    if (!sessionExpiry) {
      return res.status(400).json({ message: 'sessionExpiry is required in the value' });
    }

    // Calculate the expiration time in seconds from now
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expirationInSeconds = sessionExpiry - now;

    if (expirationInSeconds <= 0) {
      return res.status(400).json({ message: 'sessionExpiry must be in the future' });
    }

    // Set or update the cache
    const result = await redisClient.set(
      key,
      JSON.stringify(parsedValue),
      'EX',
      expirationInSeconds
    );
  
      if (result === 'OK') {
        res.json({ message: 'Cache updated successfully' });
      } else {
        res.status(500).json({ message: 'Failed to update cache' });
      }
    } catch (error) {
      console.error('Error updating cache:', error);
      res.status(500).json({ message: 'Error updating cache' });
    }
  });

  module.exports = router;