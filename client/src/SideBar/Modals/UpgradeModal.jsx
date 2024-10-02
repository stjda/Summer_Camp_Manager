import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export const UpgradeModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="upgrade-modal-title"
      aria-describedby="upgrade-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography id="upgrade-modal-title" variant="h6" component="h2">
          Upgrade to Access AI Assistant
        </Typography>
        <Typography id="upgrade-modal-description" sx={{ mt: 2 }}>
          Unlock the power of AI assistance by upgrading your platform.
        </Typography>
        <Button onClick={onClose} sx={{ mt: 2 }}>Close</Button>
      </Box>
    </Modal>
  );
};
