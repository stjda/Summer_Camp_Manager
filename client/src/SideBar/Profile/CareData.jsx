import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider } from '@mui/material';

import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ScienceIcon from '@mui/icons-material/Science'

export const CareProfile = ({data}) => {

   // console.log("in the care data card: ",data)
   const parseDate = (d) => {
      if (!d) return 'No Date'; // Return a default value if d is undefined or null
   
      const lastBGTimeString = String(d); // Ensure d is converted to a string
      let date;
   
      if (lastBGTimeString.includes('T')) {
         // Format: "2024-05-08T00:41"
         date = new Date(lastBGTimeString);
      } else {
         // Format: "1715967900000"
         const t = parseInt(lastBGTimeString, 10);
         date = new Date(t);
      }
   
      // Check if the date is valid
      if (isNaN(date.getTime())) {
         return 'Invalid Date';
      }
   
      // Format the date and time
      const options = {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         hour12: true
      };
   
      return date.toLocaleString('en-US', options);
   }
   const renderMedications = (medications) => {
      if (medications && medications.length > 0) {
        return (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {medications.map((med, index) => (
              <li key={index}>
                {med.medicationName ? (
                  <>
                    <Typography variant="body2" component="span" fontWeight="bold">{med.medicationName}</Typography>
                    {med.dosageChild && <Typography variant="body2" component="div">Child Dosage: {med.dosageChild}</Typography>}
                    {med.dosageAdult && <Typography variant="body2" component="div">Adult Dosage: {med.dosageAdult}</Typography>}
                    {med.instructions && <Typography variant="body2" component="div">Instructions: {med.instructions}</Typography>}
                  </>
                ) : (
                  'Unnamed medication'
                )}
              </li>
            ))}
          </ul>
        );
      } else {
        return <Typography variant="body2" fontStyle="italic">No medications listed</Typography>;
      }
    };
    
    const renderInsulinInfo = (insulinData) => {
      if (insulinData && insulinData.length > 0) {
        return insulinData.map((insulin, index) => (
          <Box key={insulin._id || index} sx={{ pl: 3, mt: 0.5 }}>
            <Typography variant="body2">
              Name: <Box component="span" fontWeight="bold">{insulin.name}</Box>
            </Typography>
            <Typography sx={{marginBottom: '4px'}} variant="body2">
              Dose: <Box component="span" fontWeight="bold">{insulin.dosage || 'N/A'}</Box>
            </Typography>
            <Typography sx={{marginBottom: '4px'}} variant="body2">
              Last Administered: <Box component="span" fontWeight="bold">{insulin.lastAdministered || 'N/A'}</Box>
            </Typography>
          </Box>
        ));
      } else {
        return <Box sx={{ pl: 3, fontStyle: 'italic' }}>No data</Box>;
      }
    };

    return (
      <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Medical Profile
            </Typography>
          </Box>
  
          <Divider sx={{ mb: 2 }} />
  
          {/* Provider Information */}
          {data.providers && data.providers.length > 0 ? (
            data.providers.map((provider, index) => (
              <React.Fragment key={index}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1 }} /> Doctor: 
                  <Box component="span" fontWeight="bold" ml={1}>
                    {provider.providerName && provider.providerEmail 
                      ? `${provider.providerName} : ${provider.providerEmail}` 
                      : 'no data'}
                  </Box>
                </Typography>
  
                <Divider sx={{ my: 1 }} />
  
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalHospitalIcon sx={{ mr: 1 }} /> Primary Care: 
                  <Box component="span" fontWeight="bold" ml={1}>
                    {provider.providerPhone || 'no data'}
                  </Box>
                </Typography>
  
                {index < data.providers.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No provider information available
            </Typography>
          )}
  
          <Divider sx={{ my: 2 }} />
          
          {/* Medical Information */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              MDI: <Box component="span" fontWeight="bold">{data.mdi ? 'Yes' : 'No'}</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              CGM: <Box component="span" fontWeight="bold">{data.cgm}</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Insulin Pump: <Box component="span" fontWeight="bold">{data.insulinPump ? `Model: ${data.insulinPumpModel}` : 'No data'}</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Correction Factor: <Box component="span" fontWeight="bold">{data.correctionFactor}</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Allergies: 
              <Box component="span" fontWeight="bold">
                {data.allergies && data.allergies.length > 0
                  ? data.allergies.join(', ')
                  : 'No allergies listed'}
              </Box>
            </Typography>
          </Box>
  
          <Divider sx={{ my: 2 }} />
          
          {/* Glucose and Insulin Information */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Target Blood Glucose:
              </Typography>
              <Box sx={{ fontWeight: 'bold', mb: 1 }}>
                <Typography variant="body2" component="div">
                  Breakfast: {data.targetBG.breakfast}
                </Typography>
                <Typography variant="body2" component="div">
                  Lunch: {data.targetBG.lunch}
                </Typography>
                <Typography variant="body2" component="div">
                  Dinner: {data.targetBG.dinner}
                </Typography>
              </Box>
            </Box>
  
            <Divider orientation="vertical" flexItem />
  
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Insulin-to-Carb Ratio:
              </Typography>
              <Box sx={{ fontWeight: 'bold', mb: 1 }}>
                <Typography variant="body2" component="div">
                  Breakfast: {data.insulinCarbRatio?.breakfast}
                </Typography>
                <Typography variant="body2" component="div">
                  Lunch: {data.insulinCarbRatio?.lunch}
                </Typography>
                <Typography variant="body2" component="div">
                  Dinner: {data.insulinCarbRatio?.dinner}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };