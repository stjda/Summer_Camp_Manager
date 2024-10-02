import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, Snackbar } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LockIcon from '@mui/icons-material/Lock';
import { UpgradeModal } from "../Modals";
import { keyframes } from '@emotion/react';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(720deg);
  }
`;
const TypewriterText = ({ text, onComplete, inputRef }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
        if (inputRef.current) {
          inputRef.current.value = displayText + text[currentIndex];
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
      }, 50);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete(text);
    }
  }, [currentIndex, text, onComplete, displayText, inputRef]);

  return null;
};

const MedicationField = React.memo(({ med, type, index, field, editMode, typingFields, handleEdit, simulateAIResponse, setTypingFields }) => {
  const inputRef = useRef(null);

  const onTypewriterComplete = useCallback((finalText) => {
    handleEdit(type, index, field, finalText);
    setTypingFields(prev => ({
      ...prev,
      [`${type}-${index}-${field}`]: false
    }));
  }, [type, index, field, handleEdit, setTypingFields]);

  const handleChange = (e) => {
    handleEdit(type, index, field, e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [med[field]]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
      <TextField
        label={field.charAt(0).toUpperCase() + field.slice(1)}
        value={med[field] || ''}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        disabled={!editMode || typingFields[`${type}-${index}-${field}`]}
        fullWidth
        multiline
        minRows={1}
        maxRows={10}
        inputRef={inputRef}
        InputProps={{
          style: { 
            overflow: 'hidden',
          }
        }}
      />
      {typingFields[`${type}-${index}-${field}`] && (
        <TypewriterText 
          text={simulateAIResponse(med.medicationName, type)[field] || ''} 
          onComplete={onTypewriterComplete}
          inputRef={inputRef}
        />
      )}
    </Box>
  );
});

export const MedicationManager = ({ overTheCounterMeds, prescriptions, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [hasAIAccess, setHasAIAccess] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [medications, setMedications] = useState({
    overTheCounter: overTheCounterMeds,
    prescriptions: prescriptions
  });
  const [spinningIcons, setSpinningIcons] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [typingFields, setTypingFields] = useState({});
// these feilds will be omited on the med form
  const hiddenFields = ['care_id', 'camperID', 'perscriptionDate'];

  const handleEdit = useCallback((type, index, field, value) => {
    setMedications(prevMeds => ({
      ...prevMeds,
      [type]: prevMeds[type].map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  }, []);

  const handleOpenUpgradeModal = () => { setIsUpgradeModalOpen(true); };

  const handleCloseUpgradeModal = () => { setIsUpgradeModalOpen(false); };

  const handleSave = () => {
    setEditMode(false);
    onUpdate(medications);
  };


  const autoFillMedicationData = async (type, index) => {
    const medicationName = medications[type][index].medicationName;
    
    setSpinningIcons(prev => ({ ...prev, [`${type}-${index}`]: true }));
    
    const aiGeneratedData = simulateAIResponse(medicationName, type);

    if (aiGeneratedData.isUnsure) {
      setSnackbarMessage(`Unable to find information for "${medicationName}". Please check the spelling and try again.`);
      setSnackbarOpen(true);
    } else {
      Object.keys(aiGeneratedData).forEach(field => {
        if (field !== 'isUnsure') {
          setTypingFields(prev => ({
            ...prev,
            [`${type}-${index}-${field}`]: true
          }));
          handleEdit(type, index, field, '');
        }
      });

      setSnackbarMessage(`Auto-filling data for ${medicationName}`);
      setSnackbarOpen(true);
    }

    setTimeout(() => {
      setSpinningIcons(prev => ({ ...prev, [`${type}-${index}`]: false }));
    }, 3000);
  };

  const simulateAIResponse = (medicationName, type) => {
    const knownMedications = ['aspirin', 'ibuprofen', 'acetaminophen'];
    const commonFields = {
      instructions: "Take with food or milk if stomach upset occurs.",
      sideEffects: "May cause stomach irritation, nausea, or headache.",
    };

    if (knownMedications.includes(medicationName.toLowerCase())) {
      if (type === 'overTheCounter') {
        return {
          ...commonFields,
          activeIngredients: "Something made up that I'll figure out later",
          dosageAdult: "1-2 tablets every 4-6 hours",
          dosageChild: "Consult a doctor for children under 12",
          warnings: "Do not take while under the influence of alcohol",
          createdBy: "User-A.i"
        };
      }
    }

    if (knownMedications.includes(medicationName.toLowerCase())) {
      if (type === 'prescriptions') {
        return {
          ...commonFields,
          form: "Softgel tablet",
          dosage: "25mg table",
          frequency: "Twice daily, morning and evening",
          interactions: "Do not take while under the influence of alcohol",
          genericName: "abc - 123"
        };
      }
      return commonFields;
    } else {
      return { isUnsure: true };
    }
  };

  const renderMedication = (med, type, index) => (
    <Accordion key={`${type}-${index}`}>
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }
        }}
      >
        <Typography>{med.medicationName || 'Unnamed medication'}</Typography>
        {hasAIAccess ? (
          <Tooltip title="Auto-fill Medication Data">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                autoFillMedicationData(type, index);
              }}
              size="small"
              sx={{ ml: 2 }}
            >
              Generate with A.i <AutorenewIcon 
                sx={{
                  animation: spinningIcons[`${type}-${index}`] ? `${spin} 2s linear infinite` : 'none',
                }}
              />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            startIcon={<LockIcon sx={{ fontSize: '0.75rem' }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenUpgradeModal();
            }}
            size="small"
            variant="outlined"
            sx={{ 
              ml: 2, 
              fontSize: '0.60rem', 
              padding: '1px 5px',
              minWidth: 'auto'
            }}
          >
            Unlock AI-powered Data
          </Button>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.keys(med).filter(field => !hiddenFields.includes(field)).map(field => (
            <MedicationField
              key={field}
              med={med}
              type={type}
              index={index}
              field={field}
              editMode={editMode}
              typingFields={typingFields}
              handleEdit={handleEdit}
              simulateAIResponse={simulateAIResponse}
              setTypingFields={setTypingFields}
            />
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <>
      <Card sx={{ m: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Medications
            </Typography>
            <Button 
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              variant="contained"
            >
              {editMode ? 'Save' : 'Edit'}
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>Over-the-Counter Medications</Typography>
          {medications.overTheCounter.map((med, index) => 
            renderMedication(med, 'overTheCounter', index)
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Prescriptions</Typography>
          {medications.prescriptions.map((med, index) => 
            renderMedication(med, 'prescriptions', index)
          )}
        </CardContent>
      </Card>
      <UpgradeModal open={isUpgradeModalOpen} onClose={handleCloseUpgradeModal} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};