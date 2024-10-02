import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import HistoryIcon from '@mui/icons-material/History';

export const Camps = ({data}) => {
  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Camps
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PlaceIcon sx={{ mr: 1 }} /> Current: {data.current}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <HistoryIcon sx={{ mr: 1 }} /> Past: {data.past}
        </Typography>
      </CardContent>
    </Card>
  );
};


