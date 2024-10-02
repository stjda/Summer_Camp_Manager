import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../util/Models/Stores';
import { Box, Typography, LinearProgress } from '@mui/material';
import icons from '../assets/iconRegistry';


export const Logout = () => {
    const loadingMessages = [
        "Terminating the session...",
        "Clearing the data...",
        "Disconnecting from the databases...",
        "Cleaning the caches...",
        "Sending you home..."
      ];
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const { userProfileStore } = useStore();
    // call to graphql for the camper data
        
    useEffect(() => {
      let timer;
       // Remove items from localStorage
      localStorage.removeItem('STJDA');
      localStorage.removeItem('STJDA_StoreSnapshot');
      localStorage.removeItem('STJDArememberMe');
      
      userProfileStore.clearAllData();

      startLoading();
      timer = setTimeout(() => {
          setLoading(false);
      }, 7500);
      return () => clearTimeout(timer);

    }, [navigate]);

    useEffect(() => {
        let timer;
        if (loading && progress < 100) {
          timer = setInterval(() => {
            setProgress((prevProgress) => {
              const newProgress = prevProgress + 1.5;
              return newProgress > 100 ? 100 : newProgress;
            });
            
            // Update message every 20% progress
            if (progress % 20 === 0) {
              setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
            }
          }, 100);
        }
        return () => {
          clearInterval(timer);
        };
      }, [loading, progress]);

    const startLoading = () => {
        setProgress(0);
    };

if (loading) {
    return (
        <>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <Box
        m={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
          backgroundSize: '400% 400%',
          animation: 'gradient 10s ease infinite'
        }}
      >
          <Box
            component="img"
            src={icons.logo}
            alt="Logo"
            sx={{
                width: '150px',  // Adjust size as needed
                height: 'auto',
                marginBottom: 3  // Add some space between logo and text
            }}
        />
        <Typography variant="h6" gutterBottom>Updating your profile...</Typography>
        <Box sx={{ width: '300px', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {loadingMessages[messageIndex]}
        </Typography>
        
      </Box>
    </>
        );
    }else{

        navigate('/');

    }
    
};