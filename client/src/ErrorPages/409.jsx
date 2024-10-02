import React from 'react';
import { Button, Typography, Box, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Error409 = () => {

  const [errorType, setErrorType] = React.useState('');

  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/');
  };

  return (

    <Container component="main" maxWidth="sm" sx={{
        backgroundImage: 'url("https://u-static.fotor.com/images/text-to-image/result/PRO-7450981820b149c993d17001ec653433.jpg")',
        backgroundSize: 'cover',  
        backgroundRepeat: 'no-repeat',  
        backgroundPosition: 'center',  
        height: '100vh',  
        display: 'flex',
        alignItems: 'center',  
        justifyContent: 'center',
        borderRadius: '1rem'
      }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <Typography variant="h4" gutterBottom>
          Conflict Detected.
          </Typography>
        
          <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
          Your request could not be processed due to a conflict. Please review your data and try again.
          </Typography>

          <Button variant="contained" color="primary" onClick={handleRedirect}>
            Go to Login Page
          </Button>
        </Paper>
      </Container>
    );
  };