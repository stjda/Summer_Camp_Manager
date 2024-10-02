import React from 'react';
import { Box, Typography, TextField, Button, Stack, Container } from '@mui/material';
import { Email, Send } from '@mui/icons-material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { FAQAccordion } from './index'


export const Contact = ({ displayForm }) => {
  const hoverBoxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)';

  return (
    <Box
      sx={{
        bgcolor: 'grey.300',
        p: 0,
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          boxShadow: hoverBoxShadow,
          transition: "transform 0.25s ease-in-out",
          transform: 'scale(1.0)'
        }
      }}
    >
      <Typography variant="h4" align="center">
        CONTACT
      </Typography>
      <Typography variant="h6" align="center">
        Send us a message:
      </Typography>

      <Container maxWidth="sm" sx={{ my: 2 }}>
        <form action="mailto:info@stjda.org" method="post" encType="text/plain">
          <Stack spacing={2}>
            <TextField fullWidth label="Name" name="Name" required variant="outlined" />
            <TextField fullWidth label="Email" name="Email" type="email" required variant="outlined" />
            <TextField fullWidth label="Subject" name="Subject" required variant="outlined" />
            <TextField
              fullWidth
              label="Message"
              name="Message"
              multiline
              rows={4}
              required
              variant="outlined"
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Button
                startIcon={<ArrowBackOutlinedIcon />}
                variant="contained"
                onClick={displayForm}
                sx={{
                  color: 'black',
                  bgcolor: 'grey.300',
                  '&:hover': {
                    boxShadow: hoverBoxShadow,
                    transition: "transform 0.25s ease-in-out",
                    transform: 'scale(1.0)'
                  }
                }}
              >
                Return
              </Button>
              <Button
                startIcon={<Send />}
                variant="contained"
                type="submit"
                sx={{
                  color: 'grey.500',
                  bgcolor: 'grey.300',
                  '&:hover': {
                    boxShadow: hoverBoxShadow,
                    transition: "transform 0.25s ease-in-out",
                    transform: 'scale(1.0)'
                  }
                }}
              >
                SEND MESSAGE
              </Button>
            </Stack>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};