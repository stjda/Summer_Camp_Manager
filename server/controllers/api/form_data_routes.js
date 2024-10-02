/**
 * form_data_routes.js
 * 
 * This file contains route handlers for form data operations, interacting with a Minio object storage database via a proxy server.
 */
const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid').v4;
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { config } = require('dotenv');
const multer = require('multer');
config({ path: './.env' });

/**
 * Computes a SHA-256 checksum for the given data.
 * 
 * @param {Object|string} originalData - The data to compute the checksum for.
 * @returns {string} The computed checksum as a hexadecimal string.
 */
const computeChecksum = (originalData) => {

    // Convert the original data to JSON if it's not already a string
    const originalDataJson = typeof originalData === 'string' 
        ? originalData 
        : JSON.stringify(originalData);

    // Compute checksum
    const checksum = crypto
        .createHash('sha256')
        .update(originalDataJson)
        .digest('hex');

    return checksum;
}

/**
 * POST api/forms/DiabetesManagement/intake
 * 
 * Creates a new entry in the 'stjda-signup-forms' bucket, using a computed checksum as the key for intake form.
 */
router.post('/DiabetesManagement/intake', async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }
      // save back into the same bucket
      const bucket = 'stjda-signup-forms';
      const {originalKey, dataToSend, retry } = req.body;
      let userData = dataToSend;
      let data;

      console.log('Received retry: ', retry);
      console.log(userData)
      const restructuredData = [{
        selectedCamps: userData.selectedCamps || '',
        age: userData.age || '',
        email: userData.newAccountEmail || '',
        guardianName: userData.legalGuardian || '',
        consent: userData.consent || false,
        registrationFormData: {
          submissionDate: userData.submissionDate || new Date().toISOString(),
          firstName: (userData.name && userData.name.split(' ')[0]) || '',
          middleName: (userData.name && userData.name.split(' ').length > 2) ? userData.name.split(' ')[1] : '',
          lastName: (userData.name && userData.name.split(' ').pop()) || '',
          contactPhone: userData.contactPhone || '',
          sessions: Array.isArray(userData.sessions) ? userData.sessions : [],
          tShirtSize: userData.tShirtSize || '',
          birthDate: userData.dateOfBirth || '',
          gender: userData.gender || '',
          diagnosisDate: userData.diagnosisDate || '',
          allergies: userData.allergies || '',
          primaryCarePhysician: userData.primaryCarePhysician || '',
          officePhoneNumber: userData.officePhoneNumber || '',
          diabetesPhysician: userData.diabetesPhysician || '',
          insulinType: userData.insulinType || '',
          parent1FirstName: userData.parent1FirstName || '',
          parent1LastName: userData.parent1LastName || '',
          parent1Mobile: userData.parent1Mobile || '',
          parent1Email: userData.parent1Email || '',
          parent2FirstName: userData.parent2FirstName || '',
          parent2LastName: userData.parent2LastName || '',
          parent2Mobile: userData.parent2Mobile || '',
          specialInstructions: userData.specialInstructions || '',
          preferredRoommate: userData.preferredRoommate || '',
          preferredLanguage: userData.preferredLanguage || '',
          "medications.ibuprofen": userData["medications.ibuprofen"] ?? false,
          "medications.tylenol": userData["medications.tylenol"] ?? false,
          "medications.benadryl": userData["medications.benadryl"] ?? false,
          isMDI: userData.isMDI || false,
          pumpModelBrand: userData.pumpModelBrand || '',
          isCGM: userData.isCGM || false,
          cgmModelBrand: userData.cgmModelBrand || '',
          carbsBreakfast: userData.carbsBreakfast || '',
          carbsLunch: userData.carbsLunch || '',
          carbsDinner: userData.carbsDinner || '',
          mealtimeRestrictions: userData.mealtimeRestrictions || '',
          insulinToCarbRatio: userData.insulinToCarbRatio || '',
          correctionFactor: userData.correctionFactor || '',
          target: userData.target || '',
          mdiInsulinType: userData.mdiInsulinType || '',
          otherDiagnosis: userData.otherDiagnosis || '',
          otcMedications: userData.otcMedications || '',
          otherPrescriptions: userData.otherPrescriptions || '',
          insulinFor15gSnack: userData.insulinFor15gSnack || false,
          correctWith15gOrLess: userData.correctWith15gOrLess || false,
          hyperglycemiaSymptoms: userData.hyperglycemiaSymptoms || '',
          hyperglycemiaTreatment: userData.hyperglycemiaTreatment || '',
          hypoglycemiaSymptoms: userData.hypoglycemiaSymptoms || '',
          hypoglycemiaTreatment: userData.hypoglycemiaTreatment || '',
          diabetesManagementStruggles: userData.diabetesManagementStruggles || '',
          glucoseSensitiveFoods: userData.glucoseSensitiveFoods || '',
          rapidActingInsulinType: userData.rapidActingInsulinType || '',
          longActingInsulinType: userData.longActingInsulinType || '',
          isCompleted: true,
          role: userData.role || '',
          document: userData.document || null,
          signature: userData.signature || '',
        },
      }];

        console.log("computing a checksum on: ",userData)
        // Compute checksum using sha256
        const checksum = computeChecksum(restructuredData)
        
      // Check if the object already exists
      try {
        const response = await fetch(`http://34.135.9.49:3000/api/minioG/checkObjectKey/${bucket}/${checksum}`);
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        data = JSON.parse(responseText);
        console.log("Parsed response:", data);
        if (data.exists && retry === 0) {
          // Object exists and this is not a retry, return an error
          return res.json({ 
            error: 'Duplicate entry, data already exists', 
            message: 'Data already exists.',
            status:409
          });
        }
      } catch (error) {
        console.error('Error checking object existence:', error);
      }

      // Use checksum as the key, save the data in the bucket
      const updateResult = await fetch(`http://34.135.9.49:3000/api/minioP/${bucket}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${req.cookies.jwt}`
        },
        body: JSON.stringify({
          key: checksum,
          data: restructuredData,
        })
      });
  
      if (updateResult.status !== 200) {
        throw new Error(`HTTP error! status: ${updateResult.status}`);
      }

      const resultData = await updateResult.json();
      
      processedData = {
        bucket,
        checksum,
        minioResponse: resultData,
        status: data.exists && retry === 1 ? 201 : 200 // handle the case when a retry occurs, prevent deleting your data!!! code 200 triggers delete client-side
      };

      
      res.json(processedData)
      
  
    } catch (error) {
      console.error("Error in initial data processing:", error);
      res.status(500).json({ error: "Error in initial data processing" });
    }
  });

/**
 * GET api/forms/DiabetesManagement
 * 
 * Retrieves all entries from the 'stjda-signup-forms' bucket.
 */
router.get('/DiabetesManagement', async (req, res) => {
  try {
    const result = await fetch('http://34.135.9.49:3000/api/minioG/getAll/stjda-signup-forms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${req.cookies.jwt}`
      }
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json(); // Parse the response

    res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

/**
 * POST api/forms/DiabetesManagement/uploadDocument
 * 
 * Updates an entry in the specified bucket, using a computed checksum as the key handles pdf's, jpegs, .doc & .docx.
 */
router.post('/DiabetesManagement/uploadDocument', async (req, res) => {
  // File upload configuration
  const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
    storage: multer.memoryStorage() // Store files in memory
  }).single('file');

  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'An unknown error occurred when uploading.' });
    }

    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }

      const bucket = 'form-uploads';
      const userData = req.body;

      console.log("userData: ", JSON.stringify(userData, null, 2));

      // Extract base64Data from userData
      const { base64Data, ...restOfUserData } = userData;
      console.log("rest of user data ",restOfUserData)
    
      if (!base64Data) {
        return res.status(400).json({ error: 'base64Data is missing from the request body' });
      }

      // Compute checksum from base64Data
      const checksum = crypto
        .createHash('sha256')
        .update(base64Data)
        .digest('hex');

      const proxyUrl = `http://34.135.9.49:3000/api/minioP/upload/${bucket}`;

      // Use checksum as the key
      const updateResult = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: checksum,
          data: base64Data,
          metadata: {
            ...restOfUserData,
            fileType: restOfUserData.fileType || 'application/octet-stream' // Ensure fileType is sent
          }
        })
      });

      console.log("updateResult status:", updateResult.status);
      console.log("updateResult headers:", JSON.stringify(Object.fromEntries(updateResult.headers.entries()), null, 2));

      const responseBody = await updateResult.text();
      console.log("Response body:", responseBody);

      if (!updateResult.ok) {
        throw new Error(`HTTP error! status: ${updateResult.status}, body: ${responseBody}`);
      }

      const resultData = JSON.parse(responseBody);

      res.status(200).json({ 
        message: "Data successfully sent to MinIO",
        bucket: bucket,
        key: checksum,
        syncTime: new Date().toISOString(),
        minioResponse: resultData
      });

    } catch (error) {
      console.error("Error sending data to MinIO:", error);
      res.status(500).json({ 
        error: "Error sending data to MinIO", 
        details: error.message,
        stack: error.stack
      });
    }
  });
});

/**
 * GET api/forms/med-checkin-filtering
 * 
 * Retrieves all entries from a bucket which are filtered by a prefix/field.
 */
router.get('/med-checkin-filtering/:prefix?', async (req, res) => {
  try {
    const { prefix } = req.params;
    const { bucket } = req.query;

    if (!bucket) {
      return res.status(400).json({ error: 'Bucket name is required' });
    }

    // Grab all objects from the specified bucket
    const url = new URL(`http://34.135.9.49:3000/api/minioG/getAll/${bucket}`);
    if (prefix) {
      url.searchParams.append('prefix', prefix);
    }

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json();

    const allObjects = data.objects.map(item => {
      try {
        return JSON.parse(item.content);
      } catch (error) {
        console.error('Error parsing content:', error);
        return null;
      }
    }).filter(item => item !== null);

    // Log all objects for debugging (optional)
    // console.log('All objects:', JSON.stringify(allObjects, null, 2));

    // Return all objects
    const response = {
      objects: allObjects,
      totalObjects: allObjects.length
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});
/**
 * First, let's identify the entry in the 'entriesToKeep' array:
Name: Guy Beals
First Name: Guy
Last Name: Beals
Age: 23
Contact Phone: 3034958899

Now, let's compare this with the entries in the 'entriesToFilter' array:
First entry:
First Name: Guy
Last Name: Beals
Age: 23
Contact Phone: 3034958899

This entry matches all the specified fields (firstName, lastName, contactPhone, and age) with the entry in 'entriesToKeep'. Therefore, this entry should be removed.
Second entry:
First Name: Morgan
Last Name: MetaWorldPeace
Age: 23
Contact Phone: 3034958899
This entry does not match all the specified fields. While the age and contact phone are the same, the first name and last name are different. Therefore, this entry should be kept.
 * 
 * 
 */
router.get('/med-checkin-filter', async (req, res) => {
  try {
    // console.log('Received request for med-checkin-filter');
    const { bucket, objectsToFilterAginst } = req.query;

    if (!bucket) {
      console.error('Bucket name is missing');
      return res.status(400).json({ error: 'Bucket name is required' });
    }

    let entriesToKeep = [];
    if (objectsToFilterAginst) {
      try {
        entriesToKeep = JSON.parse(objectsToFilterAginst);
      } catch (parseError) {
        console.error('Error parsing objectsToFilterAginst:', parseError);
        return res.status(400).json({ error: 'Invalid objectsToFilterAginst format' });
      }
    }
    // console.log('Entries to keep:', entriesToKeep)

    const url = new URL(`http://34.135.9.49:3000/api/minioG/getAll/${bucket}`);
    // console.log('Fetching data from URL:', url.toString());

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!result.ok) {
      console.error(`HTTP error! status: ${result.status}`);
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json();
    // console.log('Intake forms to filter: ', JSON.stringify(data, null, 2));
    let entriesToFilter = []
    const filteredObjects = data.objects.flatMap(item => {
      try {
        let parsedContent = JSON.parse(item.content);

        if(parsedContent[0].registrationFormData?.isCompleted){
          entriesToFilter.push(parsedContent[0])
        }

        // Ensure parsedContent is always an array
        if (!Array.isArray(parsedContent)) {
          parsedContent = [parsedContent];
        }

      } catch (error) {
        console.error('Error processing item:', error);
        return [];
      }
    });
    function filterEntries(entriesToFilter, entriesToKeep) {
      return entriesToFilter.filter(entry => {
        // Check if this entry matches any entry in entriesToKeep
        return !entriesToKeep.some(keepEntry => 
          entry.registrationFormData.firstName === keepEntry.firstName &&
          entry.registrationFormData.lastName === keepEntry.lastName &&
          entry.age === keepEntry.age &&
          entry.registrationFormData.contactPhone === keepEntry.contactPhone
        );
      });
    }
    const filteredEntries = filterEntries(entriesToFilter, entriesToKeep);
 
    const response = {
      filteredEntries: filteredEntries,
      entriesToKeep: entriesToKeep,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

///api/forms/MedicalCheckIn/submit
router.post('/MedicalCheckIn/submit', async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is missing' });
    }
    // save back into the same bucket
    const bucket = 'med-checkin-forms';
    const {documentKey, retry, restOfData  } = req.body;
    let userData = restOfData;
    userData.isCompleted = true
    
    console.log('Received retry: ', retry);
    // console.log(userData)
    console.log("computing a checksum on: ",userData)

    // Compute checksum BEFORE setting the key using sha256
    const checksum = computeChecksum(userData)
    userData.documentKey = checksum
    // Check if the object already exists
    let data;
    try {
      const response = await fetch(`http://34.135.9.49:3000/api/minioG/checkObjectKey/${bucket}/${checksum}`);
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      data = JSON.parse(responseText);
      console.log("Parsed response:", data);
      if (data.exists && retry === 0) {
        // Object exists and this is not a retry, return an error
        return res.json({ 
          error: 'Duplicate entry, data already exists', 
          message: 'Data already exists.',
          status:409
        });
      }
    } catch (error) {
      console.error('Error checking object existence:', error);
    }

    // Use checksum as the key, save the data in the bucket
    const updateResult = await fetch(`http://34.135.9.49:3000/api/minioP/${bucket}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${req.cookies.jwt}`
      },
      body: JSON.stringify({
        key: checksum,
        data: userData,
      })
    });

    if (updateResult.status !== 200) {
      throw new Error(`HTTP error! status: ${updateResult.status}`);
    }

    const resultData = await updateResult.json();
    
    processedData = {
      bucket,
      checksum,
      minioResponse: resultData,
      status: data.exists && retry === 1 ? 201 : 200 // handle the case when a retry occurs, prevent deleting your data!!! code 200 triggers delete client-side
    };

    res.json(processedData)
  
  } catch (error) {
    console.error("Error in initial data processing:", error);
    res.status(500).json({ error: "Error in initial data processing" });
  }
})

module.exports = router;