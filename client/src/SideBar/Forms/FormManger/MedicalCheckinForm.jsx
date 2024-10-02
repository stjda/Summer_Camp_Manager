import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Checkbox,
  Tooltip 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { DynamicMedicalCheckInForm } from './RenderChildComponents/RenderMedicalCheckInForm';
import { MedicalCheckInModal } from './Modals/MedicalCheckInModal';
import { useMedCheckInData, useSendToAPI } from '../../../util/ApiHooks/index';
import { isSHA256 } from '../../../util/DataIntegrity'

/**
 * MedCheckInForm Component
 * 
 * This component renders a medical check-in form with filtering capabilities and a modal for final submission.
 * It manages form data, applies filters, and handles form submission.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.activeForm - Function to control the active form display
 * @param {Function} props.handleSubmit - Function to handle the form submission in the parent component
 */
export const MedCheckInForm = ({ activeForm, handleSubmit: parentHandleSubmit }) => {

  const [filteredResults, setFilteredResults] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formSaveSuccess, setFormSaveSuccess] = useState({ success: null, message: "" });
  const [accountCreatedSuccess, setAccountCreatedSuccess] = useState({ success: null, message: "" });
  const [selectedResult, setSelectedResult] = useState(null);
  const [expandedPanel, setExpandedPanel] = useState(false);

  const prefix = '';
  const bucket = 'stjda-signup-forms';
  const endpoint = 'http://localhost:3000/api/forms/med-checkin-filtering';
  
   /**
   * Custom hook to fetch medical check-in data
   */
  const { data:data, loading, error:error, LoadingComponent } = useMedCheckInData(endpoint, prefix, bucket, true);

    /**
   * Custom hook to send medical check-in data
   */
  const {
    sendRequest: sendFormData,
    loading: sendFormLoading,
    error: sendFormError,
    response: formResponse,
    LoadComponent: sendFormLoadingComponent
  } = useSendToAPI('http://localhost:3000/api/forms/MedicalCheckIn/submit', 'POST');

  const {
    sendRequest: deleteForm,
    loading: deleteAccountLoading,
    error: deleteAccountError,
    response: deleteAccountResponse,
    LoadComponent: deleteAccountLoadingComponent
  } = useSendToAPI('http://localhost:3000/api/delete/DiabetesManagement/delete/med-checkin-forms', 'DELETE');

  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    contactPhone: '',
    primaryCarePhysician: '',
    showAll: true,
  });

  const [attributeMaps, setAttributeMaps] = useState({
    firstName: new Map(),
    lastName: new Map(),
    age: new Map(),
    email: new Map(),
    contactPhone: new Map(),
    primaryCarePhysician: new Map(),
  });

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    lastDoseGiven: '',
    nextDoseDue: '',
    lastSiteChangePump: '',
    lastSiteChangeCGM: '',
    currentBloodGlucose: '',
    lastCalibration: '',
    mensesStarted: false,
    counselorConsent: false,
    selfCareTasks: '',
    legalGuardianSignature: '',
    signatureDate: '',
    isCompleted: false
    });

    const handleAccordionChange = (panel) => (event, isExpanded) => {
      setExpandedPanel(isExpanded ? panel : false);
      
      // Reset formData when accordion is expanded or collapsed
      setFormData({
        name: '',
        age: '',
        lastDoseGiven: '',
        nextDoseDue: '',
        lastSiteChangePump: '',
        lastSiteChangeCGM: '',
        currentBloodGlucose: '',
        lastCalibration: '',
        mensesStarted: false,
        counselorConsent: false,
        selfCareTasks: '',
        legalGuardianSignature: '',
        signatureDate: '',
        isCompleted: false
      });
    
      // If the accordion is being expanded, populate the form with the corresponding data
      if (isExpanded) {
        const resultIndex = parseInt(panel.replace('panel', ''), 10);
        const result = filteredResults[resultIndex];
        if (result) {
          setFormData({
            name: result.name || '',
            age: result.age || '',
            lastDoseGiven: result.lastDoseGiven || '',
            nextDoseDue: result.nextDoseDue || '',
            lastSiteChangePump: result.lastSiteChangePump || '',
            lastSiteChangeCGM: result.lastSiteChangeCGM || '',
            currentBloodGlucose: result.currentBloodGlucose || '',
            lastCalibration: result.lastCalibration || '',
            mensesStarted: result.mensesStarted || false,
            counselorConsent: result.counselorConsent || false,
            selfCareTasks: result.selfCareTasks || '',
            legalGuardianSignature: result.legalGuardianSignature || '',
            signatureDate: result.signatureDate || '',
            isCompleted: result.isCompleted || false
          });
        }
      }
    };
  /**
   * Effect to initialize attribute maps when data is loaded
   */
  useEffect(() => {
    if (data) {
      const newMaps = {
        firstName: new Map(),
        lastName: new Map(),
        age: new Map(),
        email: new Map(),
        contactPhone: new Map(),
        primaryCarePhysician: new Map(),
      };

      data.forEach((entry, index) => {
        const addToMap = (mapName, map, key, index) => {
          if (key === undefined || key === null) return;
          try {
            const lowerKey = String(key).toLowerCase();
            if (!map.has(lowerKey)) {
              map.set(lowerKey, new Set());
            }
            map.get(lowerKey).add(index);
          } catch (error) {
            console.error(`Error processing key for ${mapName}:`, error);
          }
        };

        addToMap('firstName', newMaps.firstName, entry.firstName, index);
        addToMap('lastName', newMaps.lastName, entry.lastName, index);
        addToMap('age', newMaps.age, entry.age.toString(), index);
        addToMap('email', newMaps.email, entry.email, index);
        addToMap('contactPhone', newMaps.contactPhone, entry.contactPhone, index);
        addToMap('primaryCarePhysician', newMaps.primaryCarePhysician, entry.primaryCarePhysician, index);
      });
      
      setAttributeMaps(newMaps);
    }
  }, [data]);

  /**
   * Handles changes in form fields
   * @param {Event} event - The change event
   * @param {number} resultIndex - Index of the result being edited
   */
  const handleChange = (event, resultIndex) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFilteredResults(prevResults => {
      const newResults = [...prevResults];
      newResults[resultIndex] = {
        ...newResults[resultIndex],
        [name]: newValue
      };
      return newResults;
    });

    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: newValue
    }));
  };

    /**
   * Handles form submission for a specific result
   * @param {Event} event - The submit event
   * @param {number} resultIndex - Index of the result being submitted
   */
  const handleSubmit = (event, resultIndex) => {
    event.preventDefault();
    const updatedData = {
      ...filteredResults[resultIndex],
      ...formData
    };
    setSelectedResult(updatedData);
    setModalOpen(true);
  };

    /**
   * Handles final form submission via the modal
   * @param {string} email - Email address for submission
   * @param {boolean} retry - Whether this is a retry attempt
   */
  const handleFinalSubmit = async (email, retry) => {
    
    if(retry){
      setFormSaveSuccess({ success: null, message: "" })
      setAccountCreatedSuccess({ success: null, message: "" });
    }
      const dataToSend = {
        ...selectedResult,
        ...formData,
        email: email // Update the email field with the provided email parameter
      };
      const { documentKey, ...restOfData } = dataToSend // pull off the document key
      console.log(restOfData)
      console.log(documentKey)
    
      try {
        // Save the completed form in object storage
        const saveFormResponse = await sendFormData({restOfData, retry: retry === true ? 1 : 0, documentKey: documentKey});
        try { // handling status code 200, 201, 409
          if(saveFormResponse.status == 200){ // 200 means the data is new, and doesnt already exist
                setFormSaveSuccess({ success: true, message: "" }); // the message is coming in from RenderMedicalCheckIn Modal when set to empty string
                
                
                if(isSHA256(documentKey)){ // for new entrie, there is no sha256 key, the key is added after the first save
                  const deleteSuccess = await deleteForm({originalKeyKey: documentKey});
                  if(deleteSuccess.status === 200){
                    setFormSaveSuccess({ success: true, message: "Stale data successfully removed" });
                    setAccountCreatedSuccess({ success: true, message: "" });
                  }else{
                    setFormSaveSuccess({ success: false, message: deleteAccountError });
                    setAccountCreatedSuccess({ success: false, message: "" });
                    return
                  }
                }else{
                  console.log("document key is not a SHA256 hash")
                  setAccountCreatedSuccess({ success: true, message: "" });
                }        

          } else if (saveFormResponse.status == 201) { // 201 mean the data exist, and we retried confirming the update, so we need to delete any old data
                
                const deleteSuccess = await deleteForm({originalKeyKey: documentKey});
                
                if(deleteSuccess.status === 200){
                  setFormSaveSuccess({ success: true, message: "Data successfully updated" });
                  setAccountCreatedSuccess({ success: true, message: "Retry was a success" });
                }else{
                  setFormSaveSuccess({ success: false, message: deleteAccountError });
                  setAccountCreatedSuccess({ success: false, message: "Retry Failed, please redo your submission" });
                  return
                }
                
          } else if (saveFormResponse.status == 409) {
                setFormSaveSuccess({ success: false, message: "The data already exists. If you want to overwrite, please retry" });
              }
          else {
                console.log('Failed to send data');
                setFormSaveSuccess({ success: false, message: sendFormError });
              }
        } catch (error) {
          setAccountCreatedSuccess({ success: false, message: "Failed to update account" });
          console.log(error);
        }
      } catch (error) {
        console.log(error);
  
      }
  };

  const handleFilterChange = (event) => {
    const { name, value, checked } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: name === 'showAll' ? checked : value,
    }));
    setShowResults(false);
  };

    /**
   * Handles changes to filter inputs
   * @param {Event} event - The change event
   */
  const handleApplyFilters = () => {
    setIsApplying(true);
    setTimeout(() => {
      applyFilters();
      setIsApplying(false);
      setShowResults(true);
    }, 1000);
  };

    /**
   * Applies filters to the data set
   */
  const applyFilters = () => {
    if (data) {
      let matchingIndices = new Set(data.map((_, index) => index));

      if (!filters.showAll) {
        const applyFilter = (filterValue, mapName) => {
          if (filterValue) {
            const matches = attributeMaps[mapName].get(filterValue.toLowerCase()) || new Set();
            matchingIndices = new Set([...matchingIndices].filter(x => matches.has(x)));
          }
        };

        applyFilter(filters.firstName, 'firstName');
        applyFilter(filters.lastName, 'lastName');
        applyFilter(filters.age, 'age');
        applyFilter(filters.email, 'email');
        applyFilter(filters.contactPhone, 'contactPhone');
        applyFilter(filters.primaryCarePhysician, 'primaryCarePhysician');
      }

      const results = [...matchingIndices].map(index => data[index]);
      const sortedResults = results.sort((a, b) => 
        a.lastName.localeCompare(b.lastName)
      );
      setFilteredResults(sortedResults);
    }
  };

    /**
   * Renders an icon based on a boolean value
   * @param {boolean} boolean - The boolean value to base the icon on
   * @returns {React.ReactElement} The rendered icon
   */
  const displayIcon = (boolean) => {
    return boolean ? 
      <CheckCircleIcon sx={{ color: 'success.main' }} /> : 
      <CancelIcon sx={{ color: 'error.main' }} />;
  };

    /**
   * Renders the filter UI
   * @returns {React.ReactElement} The rendered filter UI
   */
  const renderFilters = () => (
    <Grid container spacing={2} style={{ marginBottom: '20px' }}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.showAll}
              onChange={handleFilterChange}
              name="showAll"
            />
          }
          label="All entries"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          value={filters.firstName}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          value={filters.lastName}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Age"
          name="age"
          type="number"
          value={filters.age}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Contact Phone"
          name="contactPhone"
          value={filters.contactPhone}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Primary Care Physician"
          name="primaryCarePhysician"
          value={filters.primaryCarePhysician}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleApplyFilters}
          disabled={isApplying || (!filters.showAll && !filters.firstName && !filters.lastName && !filters.age && !filters.email && !filters.contactPhone && !filters.primaryCarePhysician)}
        >
          {isApplying ? <CircularProgress size={24} color="inherit" /> : 'Apply Filters'}
        </Button>
      </Grid>

      {isApplying && (
        <Grid item xs={12}>
          <Typography>Applying filters...</Typography>
        </Grid>
      )}
    </Grid>
  );

  if (loading) return LoadingComponent ? <LoadingComponent /> : <Box>Loading...</Box>;
  if (error) return <Box>Error: {error}</Box>;

  return (
  <>
    <Paper elevation={3} sx={{ p: 3, m: 2, minHeight: '400px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
            Medical Check-In Form
        </Typography>
        <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => activeForm("")} 
        variant="outlined"
        >
          Back
        </Button>
      </Box>

      {renderFilters()}

      {isApplying ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((result, index) => (
            <Accordion 
              key={index}
              expanded={expandedPanel === `panel${index}`}
              onChange={handleAccordionChange(`panel${index}`)}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '10px 0',
                  },
                }}
              >
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography noWrap>
                      {`${result.name}, Age: ${result.age}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    {result?.documentKey && (
                      <Tooltip title={`Integrity Id: ${result.documentKey}`}>
                        <Typography 
                          variant="caption" 
                          noWrap
                          sx={{
                            fontSize: '0.65rem',
                            maxWidth: { xs: '100%', sm: '200px', md: '300px' },
                            display: 'inline-block',
                            verticalAlign: 'middle',
                          }}
                        >
                          {`Integrity Id: ${result.documentKey}`}
                        </Typography>
                      </Tooltip>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <Typography mr={1}>Completed:</Typography>
                      {displayIcon(result.isCompleted)}
                    </Box>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <DynamicMedicalCheckInForm 
                  handleChange={(e) => handleChange(e, index)}
                  handleSubmit={(e) => handleSubmit(e, index)}
                  apiData={result}
                  index={index}
                  setFormData={setFormData}
                />
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography>No results found. Please adjust your filters.</Typography>
        )}
      </Paper>
      <MedicalCheckInModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormSaveSuccess({ success: null, message: "" });
          setAccountCreatedSuccess({ success: null, message: "" });
          setFormData({});
          activeForm("");
        }}
        onSubmit={handleFinalSubmit}
        saveSuccess={formSaveSuccess}
        accountCreatedSuccess={accountCreatedSuccess}
      />
    </>
  );
};