import React from 'react';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import { LocalHospital as LocalHospitalIcon } from '@mui/icons-material' // Using a generic pill icon

export const OverTheCounter = ({ onDataChange }) => {

  const overTheCounter = [
    { Medicine: 'Asprin', dosage: '500mg' },
    { Medicine: 'Midol', dosage: '200mg' }
  ];

  return (
    <Card sx={{ minWidth: 225, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
            Over The Counter Meds
            </Typography>
            {overTheCounter.map((item, index) => (
              <Typography variant="body1" key={index}>
                {item.Medicine} - Dosage: {item.dosage}
              </Typography>
            ))}
          </Box>
          <Avatar sx={{ bgcolor: 'transparent', boxShadow: 1 }}>
            <LocalHospitalIcon color="secondary" />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}