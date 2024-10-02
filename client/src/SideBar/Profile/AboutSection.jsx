import React from 'react';
import { Card, CardContent, Typography, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EmergencyIcon from '@mui/icons-material/AddAlert';

export const AboutUser = ({data}) => {
  
  const ls_data = localStorage.getItem('STJDA_StoreSnapshot');  // grabbing the data snapshot from persistant storage
  const d = JSON.parse(ls_data);

  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmailIcon sx={{ mr: 1 }} /> {data.email}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PhoneIcon sx={{ mr: 1 }} /> {data.phoneNumber}
        </Typography>
        { !d.isVolunteer && <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmergencyIcon sx={{ mr: 1 }} /> Emergency Contact: <br></br> {data.emergencyContact}
        </Typography> }
      </CardContent>
    </Card>
  );
};


