import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const CamperNotesCard = ({ onDataChange }) => {

    const camperNotes = [
        { title: 'Injury', content: 'Details of the injury...' },
        { title: 'Med-Notes AM', content: 'Morning medication notes...' },
        { title: 'Special Needs PM', content: 'Evening special needs...' }
      ];

  return (
    <Card sx={{ minWidth: 225, borderRadius: 2, boxShadow: 3, padding: 1, bgcolor: 'background.paper' }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          CAMPER NOTES
        </Typography>
        {camperNotes.map((note, index) => (
          <Box key={index} mb={2}>
            <Typography variant="subtitle1" color="error" gutterBottom>
              {note.title}
            </Typography>
            <Typography variant="body2">
              NOTES: {note.content}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}