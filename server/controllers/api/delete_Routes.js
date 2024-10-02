const express = require('express');
const router = express.Router();
const { config } = require('dotenv');

config({ path: './.env' });

// Middleware for initial data processing and storage
// will create a new entry in a bucket and set a checksum as the key
router.delete('/DiabetesManagement/delete/:bucket', async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }
      const { bucket } = req.params;
      // const bucket = 'stjda-signup-forms';
      const {originalKeyKey} = req.body;
      console.log("originalKeyKey: ",originalKeyKey)
  
      // Store the results in the request object for use in the next middleware
    //   res.status(200).json(processedData)  api/minioG/delete/:bucket/:key
    const result = await fetch(`http://34.135.9.49:3000/api/minioD/delete/${bucket}/${originalKeyKey}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${req.cookies.jwt}`
        }
      });
  
      if (!result.ok) {
        res.status(409).json({ error: "Error cleaning up the old data" });
        throw new Error(`HTTP error! status: ${result.status}`);
      }
  
      const data = await result.json(); // Parse the response
  
      res.json({
        data: data,
        status: 200
      });
    } catch (error) {
      console.error("Error in initial data processing:", error);
      res.status(500).json({ error: "Error in initial data processing" });
    }
  });

module.exports = router;