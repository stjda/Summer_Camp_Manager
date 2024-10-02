import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, Alert, LinearProgress, Fade } from '@mui/material';
import axios from 'axios';
import { SignInSection } from '../Login';
import icons from '../assets/iconRegistry';

/**
 * Array of facts about diabetes and STJDA to display during token validation.
 * @type {string[]}
 */
const facts = [
  "Type 1 diabetes affects about 1 in 400 children and adolescents.",
  "STJDA has been serving South Texas families since 2011.",
  "Regular physical activity can help manage blood sugar levels in children with diabetes.",
  "STJDA offers educational programs to help families understand and manage diabetes.",
  "Childhood diabetes can be effectively managed with proper care and support.",
];

/**
 * ValidateToken component handles the token validation process and displays
 * a loading screen with rotating facts before showing the SignInSection.
 * 
 * @component
 * @returns {React.ReactElement} The rendered ValidateToken component
 */
export const ValidateToken = () => {
  const location = useLocation();
  const [checksum, setChecksum] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentFact, setCurrentFact] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);

  useEffect(() => {
    const tokenFromUrl = location.search.substring(1);
    setToken(tokenFromUrl);

    /**
     * Validates the token by making an API call.
     * @async
     * @function validateToken
     */
    const validateToken = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/signup/validate/${tokenFromUrl}`);
        if (response.data.valid) {
          setIsValidated(true); // this changes to the login component
          setChecksum(response.data.key)
          // Start fading out the background
          const fadeOutInterval = setInterval(() => {
            setBackgroundOpacity((prevOpacity) => {
              const newOpacity = prevOpacity - 0.1;
              if (newOpacity <= 0) {
                clearInterval(fadeOutInterval);
                return 0;
              }
              return newOpacity;
            });
          }, 50);
        } else {
            console.error('Validation failed:', error);
            setError('Validation failed. Please contact the organization.');
            setTimeout(() => {
              window.location.href = 'https://stjda.org/contact';
            }, 3000);
        }
      } catch (error) {
        console.error('Validation failed:', error);
        setError('Validation failed. Please contact the organization.');
        setTimeout(() => {
          window.location.href = 'https://stjda.org/contact';
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    /**
     * Interval to rotate through facts during loading.
     * @type {number}
     */
    const rotationInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 5000);

    /**
     * Interval to update the progress bar during loading.
     * @type {number}
     */
    const progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    // Start token validation after a delay
    setTimeout(() => {
      validateToken();
    }, 12800); // 12800, or 12.8 seconds

    // Cleanup function to clear intervals
    return () => {
      clearInterval(rotationInterval);
      clearInterval(progressInterval);
    };
  }, [location]);

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
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#ffffff', // Static background color
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
            backgroundSize: '400% 400%',
            animation: 'gradient 12s ease infinite',
            opacity: backgroundOpacity,
            transition: 'opacity 0.5s ease',
          }}
        />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Fade in={loading || !isValidated} timeout={850}>
              <Box sx={{ display: loading || !isValidated ? 'block' : 'none', width: '100%' }}>
                <Box
                  component="img"
                  src={icons.logo}
                  alt="Logo"
                  sx={{
                    width: '150px',
                    height: 'auto',
                    marginBottom: 3
                  }}
                />
                <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'white' }}>
                  Validating Your Account
                </Typography>
                <Box sx={{ width: '100%', mb: 4, height: '4px' }}>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
                <Paper 
                  elevation={6}
                  sx={{
                    p: 3,
                    mb: 4,
                    width: '100%',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '15px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
                    transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
                    '&:hover': {
                      boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
                    },
                    overflow: 'hidden' // Prevent content from expanding the Paper
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                    Did You Know?
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'auto' // Allow scrolling if content is too long
                  }}>
                    {facts[currentFact]}
                  </Typography>
                </Paper>
              </Box>
            </Fade>
            <Fade in={!loading && isValidated} timeout={750}>
              <Box sx={{ display: !loading && isValidated ? 'block' : 'none' }}>
                <SignInSection checksum={checksum} />
              </Box>
            </Fade>
            {error && (
              <Alert severity="error" sx={{ mt: 4 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};