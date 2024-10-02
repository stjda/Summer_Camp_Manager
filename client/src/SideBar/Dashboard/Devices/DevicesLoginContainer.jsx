import React, { useState } from 'react';
import { Box, Typography, Grid, Tooltip, Zoom, Paper, Button, TextField, Autocomplete } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Imported icons
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const breatheAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const DeviceAvatar = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  '&:hover': {
    animation: `${breatheAnimation} 2s ease-in-out infinite`,
    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
  },
}));

export const DevicesTab = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogin = (provider) => {
    console.log(`Initiate login process for: ${provider}`);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const services = [
    { name: 'Dexcom', icon: DeviceHubIcon, color: '#0077C8', available: true },
    { name: 'FreeStyle Libre', icon: FavoriteIcon, color: '#E91E63', available: false },
    { name: 'Medtronic', icon: LocalHospitalIcon, color: '#0077BE', available: false },
    { name: 'Apple Health', icon: AppleIcon, color: '#FF2D55', available: false },
    { name: 'Google Fit', icon: AndroidIcon, color: '#4285F4', available: false },
    { name: 'Fitbit', icon: FitnessCenterIcon, color: '#00B0B9', available: false },
  ];

  const additionalDevices = [
    'Accu-Chek', 'OneTouch', 'Contour', 'Omron', 'iHealth', 'Withings',
    'Garmin', 'Samsung Health', 'MyFitnessPal', 'Strava', 'Polar', 'Suunto'
  ];

  const allDevices = [...services.map(s => s.name), ...additionalDevices];

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login to Your Health Device
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
          Select your health device or app to begin the login process. Choose only the option that's relevant to you.
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {services.map((service) => (
            <Grid item key={service.name} xs={6} sm={4}>
              <Tooltip title={service.available ? `Login with ${service.name}` : 'Coming Soon'} TransitionComponent={Zoom} arrow>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <DeviceAvatar 
                    onClick={() => service.available && handleLogin(service.name)} 
                    sx={{ 
                      backgroundColor: service.color,
                      opacity: service.available ? 1 : 0.6,
                      cursor: service.available ? 'pointer' : 'default',
                    }}
                  >
                    <service.icon sx={{ fontSize: 40, color: 'white' }} />
                  </DeviceAvatar>
                  <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>{service.name}</Typography>
                  {!service.available && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 4px',
                        borderRadius: '4px',
                      }}
                    >
                      Coming Soon
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="text" color="primary" onClick={toggleSearch}>
            I don't see my device
          </Button>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Autocomplete
                fullWidth
                options={allDevices}
                renderInput={(params) => <TextField {...params} label="Search for a device" variant="outlined" />}
                value={searchValue}
                onChange={(event, newValue) => {
                  setSearchValue(newValue);
                  if (newValue) {
                    handleLogin(newValue);
                  }
                }}
                sx={{ mt: 2, mb: 2 }}
              />
            </motion.div>
          )}
        </Box>
      </Paper>
    </Box>
  );
};