import React from 'react';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import PillIcon from '@mui/icons-material/LocalPharmacy'; // Using a generic pill icon

export const PrescriptionCard = ({ onDataChange, data }) => {

  const prescription = [
    { perception: 'Amoxicillin', dosage: '500mg' },
    { perception: 'Ibuprofen', dosage: '200mg' }
  ];

  return (
    <Card sx={{ minWidth: 225, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Prescriptions
            </Typography>
            {prescription.map((item, index) => (
              <Typography variant="body1" key={index}>
                {item.perception} - Dosage: {item.dosage}
              </Typography>
            ))}
          </Box>
          <Avatar sx={{ bgcolor: 'transparent', boxShadow: 1 }}>
            <PillIcon color="secondary" />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}