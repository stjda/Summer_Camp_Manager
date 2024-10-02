import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const InsulinNotesCard = ({ onDataChange }) => { // wrap this in a nobserver

    const insulinData = [
        { title: 'CF', notes: 'Your notes here...' },
        {
          title: 'I:C Ratio',
          details: { B: '10', L: '15', D: '20' }
        },
        {
          title: 'BG Target',
          details: { B: '5.5', L: '6.0', D: '6.5' }
        },
        { title: 'Care Type', notes: 'Your notes here...' },
        { title: 'Pump/ CGM', notes: 'Your notes here...' }
      ];

  return (
    <Card sx={{ minWidth: 200, borderRadius: 2, boxShadow: 3, padding: 1 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Insulin Notes
        </Typography>
        {insulinData.map((section, index) => (
          <Box key={index} mb={2}>
            <Typography variant="subtitle1" color="error">
              {section.title}
            </Typography>
            {section.notes && (
              <Typography variant="body2">
                NOTES: {section.notes}
              </Typography>
            )}
            {section.details && Object.entries(section.details).map(([key, value], idx) => (
              <Typography key={idx} variant="body2">
                {key.toUpperCase()}: {value}
              </Typography>
            ))}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
