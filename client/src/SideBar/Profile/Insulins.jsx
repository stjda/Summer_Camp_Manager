import React from 'react';
import { Box, Typography, Divider, Card, CardContent } from '@mui/material';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ScienceIcon from '@mui/icons-material/Science';

export const CareAndInsulin = ({ data }) => {
    
      const renderInsulinInfo = (insulinData) => {
        if (insulinData && insulinData.length > 0) {
          return insulinData.map((insulin, index) => (
            <Box key={insulin._id || index} sx={{ pl: 1, mt: 0.5 }}>
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
          return <Box sx={{ pl: 1, fontStyle: 'italic' }}>No data</Box>;
        }
      };
    
      return (
        <Card sx={{ m: 2, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Care Profile
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', p: 2, borderRadius: 1, boxShadow: 1 }}>
                <MedicalInformationIcon sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="body1">
                  Care Type: <Box component="span" fontWeight="bold" sx={{ ml: 1, color: 'text.primary' }}>{data.careType}</Box>
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
    
            {/* Insulin Types */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScienceIcon sx={{ mr: 1 }} />
                    Long Acting Insulin:
                  </Box>
                  <Box sx={{ backgroundColor: 'background.paper', p: 2, borderRadius: 1, boxShadow: 1 }}>
                    {renderInsulinInfo(data.longActingInsulin)}
                  </Box>
                </Typography>
              </Box>
    
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScienceIcon sx={{ mr: 1 }} />
                    Rapid Acting Insulin:
                  </Box>
                  <Box sx={{ backgroundColor: 'background.paper', p: 2, borderRadius: 1, boxShadow: 1 }}>
                    {renderInsulinInfo(data.rapidActingInsulin)}
                  </Box>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      );
    };