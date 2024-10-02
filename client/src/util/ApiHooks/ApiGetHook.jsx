import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";

/**
 * Custom hook for fetching and parsing data from an API, specifically for the intake process for STJDA intake form, 
 * It shapes the data incoming from another microservice, and fits it for the specific use case of the intake form.
 * @param {string} url - The URL to fetch data from
 * @returns {Object} An object containing the fetched data, loading state, error state, and a loading component
 */
export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Asynchronously fetches data from the provided URL
     */
    const fetchData = async () => {
      const startTime = Date.now();
      try {
        const response = await axios.get(url);
        console.log("response.data.data.objects", response.data.data);
        const parsedData = parseAndShapeData(response.data.data);
        console.log("response.data.data.objects", response.data);
        // const parsedData = parseAndShapeData(response.data);
        setData(parsedData);
      } catch (error) {
        setError(error);
      } finally {
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        const remainingTime = Math.max(1750 - elapsed, 0);
        
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      }
    };

    setLoading(true);
    fetchData();
  }, [url]);

  /**
   * Parses the metadata key to extract camp and personal information
   * @param {string} key - The metadata key to parse
   * @returns {Object} An object containing parsed information
   */
  const parseMetadataKey = (key) => {
    const parts = key.split(',').map(item => item.trim());
    const camps = [];
    let firstName = '', lastName = '', age = '', primaryCarePhysician = '', shirtSize = '', gender = '';
  
    // Collect camps
    while (parts.length > 0 && parts[0].includes('Camp')) {
      camps.push(parts.shift());
    }
  
    // Assign remaining parts
    if (parts.length >= 6) {
      [firstName, lastName, age, primaryCarePhysician, shirtSize, gender] = parts;
    }
  
    return { camps, firstName, lastName, age, primaryCarePhysician, shirtSize, gender };
  };

    /**
   * Parses and shapes the API response data
   * @param {Object} apiResponse - The raw API response
   * @returns {Array} An array of parsed and shaped data objects
   * @throws {Error} If the input data is invalid or parsing fails
   */
  const parseAndShapeData = (apiResponse) => {
    
    if (!apiResponse || !apiResponse.objects || !Array.isArray(apiResponse.objects)) {
      throw new Error("Invalid input data");
    }
    // loop through each object in the array and parse the content JSON safely
    return apiResponse.objects.map(obj => {
      const { metadata, content } = obj;

      if (!metadata || !content) {
        throw new Error("Missing metadata or content in data object");
      }
  
      // Parse the content JSON safely
      let parsedContent;
      try {
        parsedContent = JSON.parse(content)[0];
        
      } catch (e) {
        console.error("Failed to parse content JSON:", e);
        parsedContent = {};
      }
    
      // Extract camps and other metadata from the Key
      // Parse metadata Key
      const { camps, firstName, lastName, age, primaryCarePhysician, shirtSize, gender } = parseMetadataKey(metadata.Key);

         /**
       * Destructures registrationFormData with default values
       * @type {Object}
       */
      const {
        allergies ='',
        birthDate ='',
        diabetesPhysician ='',
        diagnosisDate ='',
        firstName: contentFirstName = '',
        middleName = '',
        lastName: contentLastName = '',
        gender: contentGender = '',
        insulinType = '',
        parent1Email='',
        parent1FirstName='',
        parent1LastName='',
        parent1Mobile = '',
        submissionDate = '',
        sessions = [],
        medications = {},
        primaryCarePhysician: contentPCP = '',
        officePhoneNumber = '',
        preferredRoommate = '',
        preferredLanguage = '',
        tShirtSize = '',
        parent2FirstName = '',
        parent2LastName = '',
        parent2Mobile = '',
        specialInstructions = '',
        mdiInsulinType = '',
        "medications.ibuprofen": ibuprofenMedication = '',
        "medications.tylenol": tylenolMedication = '',
        "medications.benadryl": benadrylMedication = '',
        contactPhone = '',
        isMDI = '',
        pumpModelBrand = '',
        isCGM = '',
        cgmModelBrand = '',
        carbsBreakfast = '',
        carbsLunch = '',
        carbsDinner = '',
        mealtimeRestrictions = '',
        insulinToCarbRatio = '',
        correctionFactor = '',
        target = '',
        otherDiagnosis = '',
        otcMedications = '',
        otherPrescriptions = '',
        insulinFor15gSnack = '',
        correctWith15gOrLess = '',
        hyperglycemiaSymptoms = '',
        hyperglycemiaTreatment = '',
        hypoglycemiaSymptoms = '',
        hypoglycemiaTreatment = '',
        diabetesManagementStruggles = '',
        glucoseSensitiveFoods = '',
        rapidActingInsulinType = '',
        longActingInsulinType = '',
        isCompleted = '',
        role = '',
        document = '',
        signature = '',
      } = parsedContent.registrationFormData || {};
  
      /**
       * Safely gets the age value
       * @returns {string} The age value
       */
      const getAge = () => {
        if (parsedContent.age != null) {
          return parsedContent.age.toString();
        }
        if (age !== 'Unknown' && age !== '') {
          return age;
        }
        return '0';
      };

        /**
       * Handles specific medications
       * @type {Object}
       */
      const updatedMedications = {
        ...medications,
        ...(ibuprofenMedication && { ibuprofen: ibuprofenMedication }),
        ...(tylenolMedication && { tylenol: tylenolMedication }),
        ...(benadrylMedication && { benadryl: benadrylMedication }),
      };

      return {
        metadata: {
          Key: metadata.Key,
          LastModified: metadata.LastModified,
          ETag: metadata.ETag,
          Size: metadata.Size,
          StorageClass: metadata.StorageClass
        },
        content: JSON.stringify([{
          selectedCamps: parsedContent.selectedCamps || '',
          email: parsedContent.email || '',
          guardianName: parsedContent.guardianName || '',
          consent: parsedContent.consent || false,
          registrationFormData: {
            submissionDate: parsedContent.registrationFormData.submissionDate || submissionDate,
            firstName: contentFirstName || firstName,
            middleName,
            lastName: contentLastName || lastName,
            sessions: parsedContent.registrationFormData.sessions || sessions,
            tShirtSize: tShirtSize || shirtSize,
            birthDate,
            gender: contentGender || gender,
            diagnosisDate,
            allergies,
            primaryCarePhysician: contentPCP || primaryCarePhysician,
            officePhoneNumber,
            diabetesPhysician,
            insulinType,
            parent1FirstName,
            parent1LastName,
            parent1Mobile,
            parent1Email,
            parent2FirstName,
            parent2LastName,
            parent2Mobile,
            specialInstructions,
            preferredRoommate,
            preferredLanguage,
            medications: updatedMedications,
            isMDI,
            pumpModelBrand,
            isCGM,
            cgmModelBrand,
            carbsBreakfast,
            carbsLunch,
            carbsDinner,
            mealtimeRestrictions,
            insulinToCarbRatio,
            correctionFactor,
            target,
            otherDiagnosis,
            otcMedications,
            otherPrescriptions,
            insulinFor15gSnack,
            correctWith15gOrLess,
            hyperglycemiaSymptoms,
            hyperglycemiaTreatment,
            hypoglycemiaSymptoms,
            hypoglycemiaTreatment,
            diabetesManagementStruggles,
            glucoseSensitiveFoods,
            rapidActingInsulinType,
            longActingInsulinType,
            isCompleted,
            role,
            contactPhone,
            document,
            signature,
            // Additional fields needed by ConfirmationForm
            name: `${contentFirstName || firstName} ${contentLastName || lastName}`,
            age: parseInt(getAge(), 10),
            legalGuardian: parsedContent.guardianName || '',
            contactPhone: contactPhone,
            mdiInsulinType: mdiInsulinType || insulinType,

          },
          camps: parsedContent.selectedCamps ? parsedContent.selectedCamps.split(',').map(camp => camp.trim()) : [],
          age: parseInt(getAge(), 10),
        }])
      };
    });
  };

   /**
   * React component for displaying a loading spinner
   * @returns {JSX.Element} A circular progress component
   */
  const LoadingComponent = () => (
    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  );

  return { data, loading, error, LoadingComponent };
};