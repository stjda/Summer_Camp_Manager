/**
 * ConfirmationForm Component
 * 
 * This component renders a complex form for managing diabetes-related information.
 * It includes filtering capabilities, dynamic form rendering, and API interactions.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.activeForm - Function to control the active form display
 * 
 * Key Features:
 * 1. Dynamic filtering of form entries based on various criteria
 * 2. Rendering of filtered results as expandable accordions
 * 3. Integration with backend API for data fetching and submission
 * 4. Handling of file uploads and form state management
 * 5. Modal for email confirmation and final form submission
 * 
 * State Management:
 * - filteredResults: Stores the filtered form entries
 * - isApplying: Boolean to track if filters are being applied
 * - allData: Object to store all form data
 * - modalOpen: Controls the visibility of the email confirmation modal
 * - formSaveSuccess: Tracks the success status of form saving
 * - accountCreatedSuccess: Tracks the success status of account creation
 * - formData: Stores the current form data being edited
 * - filters: Stores the current filter settings
 * - attributeMaps: Maps for efficient filtering of form entries
 * 
 * API Interactions:
 * - Uses custom hooks (useFetch, useSendToAPI) for API operations
 * - Fetches initial data from the server
 * - Sends form data to the server
 * - Handles account creation and form deletion
 * 
 * Key Functions:
 * - handleChange: Manages form input changes
 * - handleFinalSubmit: Processes the final form submission
 * - handleSubmit: Manages form submission for individual entries
 * - handleFilterChange: Handles changes to filter inputs
 * - applyFilters: Applies selected filters to the data set
 * - renderFilters: Renders the UI for filter options
 * 
 * Rendering:
 * - Displays a filterable list of form entries
 * - Each entry can be expanded to show and edit detailed information
 * - Includes loading and error states
 * 
 * @example
 * <ConfirmationForm activeForm={setActiveForm} />
 * 
 * Note: This component relies on several external components and utilities,
 * such as DynamicForm, EmailModal, and various Material-UI components.
 */
import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFetch, useSendToAPI } from '../../../util/ApiHooks';
import { DynamicForm } from './RenderChildComponents/RenderConfirmationForm';
import { parseApiData } from './FormHelpers/ParesApi'
import { EmailModal } from './Modals/ConfirmationModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { isSHA256 } from '../../../util/DataIntegrity'

const campOptions = ['Residential Camp', 'Robotics Camp', 'Science Camp', 'Nature Camp'];
const genderOptions = ['Male', 'Female', 'Other'];
const adultSizes = ['XS', 'S', 'M', 'L', 'XL'];
const youthSizes = ['Youth-XS', 'Youth-S', 'Youth-M', 'Youth-L', 'Youth-XL'];

export const ConfirmationForm = ({ activeForm }) => {

  // State to hold the filtered results
const [filteredResults, setFilteredResults] = useState([]);
const [isApplying, setIsApplying] = useState(false);
const [expandedPanel, setExpandedPanel] = useState(false);
// const [allData, setAllData] = useState({});
// const [isUpdate, setIsUpdate] =useState();
const [modalOpen, setModalOpen] = useState(false);
const [formSaveSucess ,setFormSaveSucess]=useState({success: null, message: ""})
const [accountCreatedSucess, setAccountCreatedSucess] = useState({success: null, message: ""})
  // call the backend server first, and it will grab the data from the database for the filtering
  const { data:data, loading, error:error, LoadingComponent } = useFetch('http://localhost:3000/api/forms/DiabetesManagement');
  // send post request Hook
  const {
    sendRequest: sendFormData,
    loading: sendFormLoading,
    error: sendFormError,
    response: formResponse,
    LoadComponent: sendFormLoadingComponent
  } = useSendToAPI('http://localhost:3000/api/forms/DiabetesManagement/intake', 'POST');

  const {
    sendRequest: deleteForm,
    loading: deleteAccountLoading,
    error: deleteAccountError,
    response: deleteAccountResponse,
    LoadComponent: deleteAccountLoadingComponent
  } = useSendToAPI('http://localhost:3000/api/delete/DiabetesManagement/delete/stjda-signup-forms', 'DELETE');


  const {
    sendRequest: sendEmailToAccount,
    loading: sendEmailToAccountLoading,
    error: sendEmailToAccountError,
    response: accountResponse,
    LoadComponent: AccountLoadingComponent
  } = useSendToAPI('http://localhost:3000/api/signup/send-email', 'POST');
  

  const [attributeMaps, setAttributeMaps] = useState({
    firstName: new Map(),
    lastName: new Map(),
    age: new Map(),
    primaryCarePhysician: new Map(),
    camps: new Map(),
    tShirtSize: new Map(),
    gender: new Map()
  });
  
  // In a real application, this would use a custom hook to fetch data
  // For now, we're using mock data
  const [filters, setFilters] = useState({
    camps: [],
    firstName: '',
    lastName: '',
    age: '',
    primaryCarePhysician: '',
    tShirtSize: [],
    gender: [],
    showAll: true,
  });
  
  // State to hold the form data for a new entry
  const [formData, setFormData] = useState({
    // anything in this state must also be in the ParseApi.js
    name: '',//
    age: '',//
    dateOfBirth: '',//
    isMDI: false,//
    pumpModelBrand: '',//
    isCGM: false,//
    cgmModelBrand: '',//
    legalGuardian: '',//
    contactPhone: '',//
    carbsBreakfast: '',//
    carbsLunch: '',//
    carbsDinner: '',//
    mealtimeRestrictions: '',//
    insulinToCarbRatio: '',//
    correctionFactor: '',//
    target: '',//
    mdiInsulinType: '',//
    allergies: '',//
    otherDiagnosis: '',//
    otcMedications: '',//
    otherPrescriptions: '',//
    insulinFor15gSnack: false,//
    correctWith15gOrLess: false,//
    hyperglycemiaSymptoms: '',//
    hyperglycemiaTreatment: '',//
    hypoglycemiaSymptoms: '',//
    hypoglycemiaTreatment: '',//
    diabetesManagementStruggles: '',//
    glucoseSensitiveFoods: '',//
    diabetesPhysician: '',//
    officePhoneNumber: '',//
    diagnosisDate: '',//
    gender: '',//
    rapidActingInsulinType: '', //
    longActingInsulinType: '',//
    parent1FirstName: '',//
    parent1LastName: '',//
    parent1Mobile: '',//
    parent2FirstName: '',//
    parent2LastName: '',//
    parent2Mobile: '',//
    preferredLanguage: '',//
    preferredRoommate: '',//
    sessions:[],
    specialInstructions: '',//
    primaryCarePhysician:'',//
    submissionDate: '',//
    tShirtSize: '',//
    selectedCamps: '',
    originalKey:'',
    consent: false,//
    document: null,//
    });

    const handleAccordionChange = (panel) => (event, isExpanded) => {
      setExpandedPanel(isExpanded ? panel : false);
      
      // Reset formData when accordion is expanded or collapsed
      setFormData({
        name: '',
        age: '',
        dateOfBirth: '',
        isMDI: false,
        pumpModelBrand: '',
        isCGM: false,
        cgmModelBrand: '',
        legalGuardian: '',
        contactPhone: '',
        carbsBreakfast: '',
        carbsLunch: '',
        carbsDinner: '',
        mealtimeRestrictions: '',
        insulinToCarbRatio: '',
        correctionFactor: '',
        target: '',
        mdiInsulinType: '',
        allergies: '',
        otherDiagnosis: '',
        otcMedications: '',
        otherPrescriptions: '',
        insulinFor15gSnack: false,
        correctWith15gOrLess: false,
        hyperglycemiaSymptoms: '',
        hyperglycemiaTreatment: '',
        hypoglycemiaSymptoms: '',
        hypoglycemiaTreatment: '',
        diabetesManagementStruggles: '',
        glucoseSensitiveFoods: '',
        diabetesPhysician: '',
        officePhoneNumber: '',
        diagnosisDate: '',
        gender: '',
        rapidActingInsulinType: '',
        longActingInsulinType: '',
        parent1FirstName: '',
        parent1LastName: '',
        parent1Mobile: '',
        parent2FirstName: '',
        parent2LastName: '',
        parent2Mobile: '',
        preferredLanguage: '',
        preferredRoommate: '',
        sessions: [],
        specialInstructions: '',
        primaryCarePhysician: '',
        submissionDate: '',
        tShirtSize: '',
        selectedCamps: '',
        originalKey: '',
        consent: false,
        document: null,
      });
    
      // If the accordion is being expanded, populate the form with the corresponding data
      if (isExpanded) {
        const resultIndex = parseInt(panel.replace('panel', ''), 10);
        const result = filteredResults[resultIndex];
        if (result && result.formData) {
          setFormData(result.formData);
        }
      }
    };
  
// Effect hook to initialize Filter Maps when data is loaded
useEffect(() => {
    if (data) {
      console.log("Data: ", data)
      const newMaps = {
        firstName: new Map(),
        lastName: new Map(),
        age: new Map(),
        primaryCarePhysician: new Map(),
        camps: new Map(),
        tShirtSize: new Map(),
        gender: new Map()
      };
      console.log("Data change: ");
      data.forEach((entry, index) => {
        setFormData({...formData, originalKey: entry.metadata})
        const content = JSON.parse(entry.content)[0];
        console.log("parsed data: ", content)
        const addToMap = (mapName, map, key, index) => {
          if (key === undefined || key === null) {
            // console.log(`Warning: Undefined or null key encountered for ${mapName}`);
            // console.log(`Key: ${key}`);
            // console.log(`Key type: ${typeof key}`);
            return;
          }
          
          try {
            const lowerKey = String(key).toLowerCase();
            
            if (!map.has(lowerKey)) {
              map.set(lowerKey, new Set());
            }
            map.get(lowerKey).add(index);
          } catch (error) {
            console.error(`Error processing key for ${mapName}:`, error);
            console.log(`Problematic key:`, key);
            console.log(`Key type:`, typeof key);
          }
        };
  
        addToMap('firstName', newMaps.firstName, content.registrationFormData.firstName, index);
        addToMap('lastName', newMaps.lastName, content.registrationFormData.lastName, index);
        addToMap('age', newMaps.age, content.age?.toString(), index);
        addToMap('primaryCarePhysician', newMaps.primaryCarePhysician, content.registrationFormData.primaryCarePhysician, index);
        content.camps.forEach(camp => addToMap('camps', newMaps.camps, camp, index));
        addToMap('tShirtSize', newMaps.tShirtSize, content.registrationFormData.tShirtSize, index);
        addToMap('gender', newMaps.gender, content.registrationFormData.gender, index);
      });
  
      setAttributeMaps(newMaps);
    }
  }, [data]);

  // Handle changes to form inputs
  const handleChange = (event, resultIndex = null) => {
    const { name, value, checked } = event.target;
    if (resultIndex !== null) {
      setFilteredResults(prevResults => {
        const newResults = [...prevResults];
        newResults[resultIndex].formData = {
          ...newResults[resultIndex].formData,
          [name]: event.target.type === 'checkbox' ? checked : value
        };
        return newResults;
      });
    } else {
      // Otherwise, we're updating the form for a new entry
      setFormData(prevData => ({
        ...prevData,
        [name]: event.target.type === 'checkbox' ? checked : value,
      }));
    }
  };
// Handle form submission
const handleSubmit = async (event, resultIndex = null) => {
  event.preventDefault();

  if (resultIndex !== null) {
    const updatedResult = filteredResults[resultIndex];
    console.log('updatedResult: ', updatedResult);
    // const formData = filteredResults[resultIndex].formData;
    // setAllData(prevData => ({
    //   ...prevData,
    //   [updatedResult.key]: {
    //       apiData: updatedResult.apiData, 
    //       formData: updatedResult.formData
    //   }
    // }))
  } else {
      try {
        if(!modalOpen){
          setModalOpen(true);
        }else{
          setModalOpen(false)
        }
      } catch (err) {
        console.error('Error sending data:', err);
      }
    }
  };

////////////final submit and retry logic///////
  const handleFinalSubmit = async (email, retry) => {
    // Extract originalKey from formData
    const { originalKey, ...restFormData } = formData;
    // if(isSHA256(originalKey)){
    //   setIsUpdate(true)
    // }
    if(retry){
      setFormSaveSucess({ success: null, message: "" })
      setAccountCreatedSucess({ success: null, message: "" });
    }
    // Create dataToSend object without originalKey
    const dataToSend = { 
      ...restFormData,
      role: 'camper',
    };
  
 
    try {
      // Save the completed form in object storage
      const saveFormResponse = await sendFormData({dataToSend, retry: retry === true ? 1 : 0, originalKey: originalKey});
      
        if(saveFormResponse.status == 200){ // handling status code 200, 201, 409
            try {
              const { checksum } = saveFormResponse
              const deleteSuccess = await deleteForm({originalKeyKey: originalKey});
              
              if(deleteSuccess.status === 200){
                setFormSaveSucess({ success: true, message: "Data successfully saved" });
              }else{
                setFormSaveSucess({ success: false, message: deleteAccountError });
                return
              }
              
              if (!isSHA256(originalKey)) { // if the original key is not SHA256, we're creating a new account
                const sendEmailToAccountResponse = await sendEmailToAccount({dataToSend, key: checksum, newAccountEmail: email});
                if (sendEmailToAccountResponse?.status === 200) {
                  console.log('Setting account created success');
                  setAccountCreatedSucess({ success: true, message: "Email successfully sent" });
                } else {
                  console.log('Account creation failed');
                  setAccountCreatedSucess({ success: false, message: "Email failed to send, please contact the client directly" });
                }
              } else {
                // This is an account update
                setAccountCreatedSucess({ success: true, message: "Account Update Successful" });
              }
            } catch (error) {
              setAccountCreatedSucess({ success: false, message: "Failed to instantiated account workflow" });
              console.log(error);
            }
        } else if (saveFormResponse.status == 201) {
          setFormSaveSucess({ success: true, message: "Data successfully updated" });
          setAccountCreatedSucess({ success: true, message: "Retry was a success" });
        } else if (saveFormResponse.status == 409) {
          setFormSaveSucess({ success: false, message: "The data already exists. If you want to overwrite, please retry" });
        }
        else {
        console.log('Failed to send data to Minio');
        setFormSaveSucess({ success: false, message: sendFormError });
      }
    } catch (error) {
      console.log(error);

    }
  };
//////////////////////////////////////////////////////////////////////

 // Handle changes to filter inputs
 const handleFilterChange = (event) => {
    const { name, value, checked } = event.target;
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [name]: Array.isArray(prevFilters[name])
          ? (checked ? [...prevFilters[name], value] : prevFilters[name].filter(item => item !== value))
          : value,
      }; 
      return newFilters;
    });
  };

// Handle changes to the "Show All" checkbox
  const handleShowAllChange = (event) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, showAll: event.target.checked };
      return newFilters;
    });
  };

const handleApplyFilters = () =>{
    setIsApplying(true);
    
    setTimeout(() => {
        applyFilters();
        setIsApplying(false);
    }, 1000);
}

const displayIcon = (boolean) => {
  return boolean ? 
    <CheckCircleIcon sx={{ color: 'success.main' }} /> : 
    <CancelIcon sx={{ color: 'error.main' }} />;
}

//////////Apply the filters///////////////////////////////////////////////////////////////
const applyFilters = () => {
    const currentFilters = filters;
    if (data) {
      // console.log("Applying filters:", currentFilters);
      let matchingIndices = new Set(data.map((_, index) => index));
      // console.log("Initial matching indices:", matchingIndices);
  
      if (!currentFilters.showAll) {
        const applyFilter = (filterValue, mapName) => {
          if (filterValue) {
            const matches = attributeMaps[mapName].get(filterValue.toLowerCase()) || new Set();
            matchingIndices = new Set([...matchingIndices].filter(x => matches.has(x)));
          }
        };
  
        applyFilter(currentFilters.firstName, 'firstName');
        applyFilter(currentFilters.lastName, 'lastName');
        applyFilter(currentFilters.age, 'age');
        applyFilter(currentFilters.primaryCarePhysician, 'primaryCarePhysician');
  
        if (currentFilters.camps.length > 0) {
          const campMatches = new Set(currentFilters.camps.flatMap(camp => 
            [...(attributeMaps.camps.get(camp.toLowerCase()) || [])]
          ));
          matchingIndices = new Set([...matchingIndices].filter(x => campMatches.has(x)));
        }
  
        if (currentFilters.tShirtSize.length > 0) {
          const sizeMatches = new Set(currentFilters.tShirtSize.flatMap(size => 
            [...(attributeMaps.tShirtSize.get(size.toLowerCase()) || [])]
          ));
          matchingIndices = new Set([...matchingIndices].filter(x => sizeMatches.has(x)));
        }
  
        if (currentFilters.gender.length > 0) {
          const genderMatches = new Set(currentFilters.gender.flatMap(gender => 
            [...(attributeMaps.gender.get(gender.toLowerCase()) || [])]
          ));
          matchingIndices = new Set([...matchingIndices].filter(x => genderMatches.has(x)));
        }
      }
      // console.log("Final matching indices:", matchingIndices);
      // Convert matching indices back to full data objects
      const results = [...matchingIndices].map(index => {
        const entry = data[index];
        const content = JSON.parse(entry.content)[0];
        return {
          ...content,
          key: entry.metadata.Key,
          formData: parseApiData(content, entry.metadata.Key)
        };
      });
      // Sort results by last name and update state  
      const sortedResults = results.sort((a, b) => 
        a.registrationFormData.lastName.localeCompare(b.registrationFormData.lastName)
      );
      console.log("Sorted results:", sortedResults);
      setFilteredResults(sortedResults);
    }
  };


// Render the filter UI
  const renderFilters = () => (
    <Grid container spacing={2} style={{ marginBottom: '20px' }}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.showAll}
              onChange={handleShowAllChange}
              name="showAll"
            />
          }
          label="Show All"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl component="fieldset">
          <Typography variant="subtitle1">Camps</Typography>
          <FormGroup>
            {campOptions.map((camp) => (
              <FormControlLabel
                key={camp}
                control={
                  <Checkbox
                    checked={filters.camps.includes(camp)}
                    onChange={handleFilterChange}
                    name="camps"
                    value={camp}
                    disabled={filters.showAll}
                  />
                }
                label={camp}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl component="fieldset">
          <Typography variant="subtitle1">Gender</Typography>
          <FormGroup>
            {genderOptions.map((gender) => (
              <FormControlLabel
                key={gender}
                control={
                  <Checkbox
                    checked={filters.gender.includes(gender)}
                    onChange={handleFilterChange}
                    name="gender"
                    value={gender}
                    disabled={filters.showAll}
                  />
                }
                label={gender}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl component="fieldset">
        <Typography variant="subtitle1">Shirt Size</Typography>
            <Box sx={{ display: 'flex' }}>
                <FormGroup sx={{ mr: 2 }}>
                {adultSizes.map((size) => (
                    <FormControlLabel
                    key={size}
                    control={
                        <Checkbox
                        checked={filters.tShirtSize.includes(size)}
                        onChange={handleFilterChange}
                        name="tShirtSize"
                        value={size}
                        disabled={filters.showAll}
                        />
                    }
                    label={size}
                    />
                ))}
                </FormGroup>
                <FormGroup>
                {youthSizes.map((size) => (
                    <FormControlLabel
                    key={size}
                    control={
                        <Checkbox
                        checked={filters.tShirtSize.includes(size)}
                        onChange={handleFilterChange}
                        name="tShirtSize"
                        value={size}
                        disabled={filters.showAll}
                        />
                    }
                    label={size}
                    />
                ))}
                </FormGroup>
            </Box>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          value={filters.firstName}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          value={filters.lastName}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Age"
          name="age"
          value={filters.age}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Box display="flex" alignItems="center">
          <Typography variant="body1" style={{ marginRight: '8px' }}>Dr.</Typography>
          <TextField
            fullWidth
            label="Physician"
            name="primaryCarePhysician"
            value={filters.primaryCarePhysician}
            onChange={handleFilterChange}
            disabled={filters.showAll}
            helperText="Format: 'DoctorsName'"
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleApplyFilters}
          disabled={isApplying}
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
///////////////////////////////////////////////////////////////////////////////////////
  if (loading) return LoadingComponent ? <LoadingComponent /> : <Box>Loading...</Box>;
  if (error) return <Box>Error: {error.message}</Box>;

  return (
    <>
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h4">
        Diabetes Management Form
      </Typography>
      <Button 
      startIcon={<ArrowBackIcon />}  
      variant="outlined" 
      onClick={() => activeForm("")}
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
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" width="100%">
              <Typography flexGrow={1}>
                {`${result.registrationFormData.firstName} ${result.registrationFormData.lastName}, Age: ${result.age}`}
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography mr={1}>Completed:</Typography>
                {displayIcon(result.registrationFormData.isCompleted)}
              </Box>
            </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* renders the form */}
              <DynamicForm handleChange={handleChange} handleSubmit={handleSubmit} apiData={result.formData} setFormData={setFormData} />
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>No results found. Please adjust your filters.</Typography>
      )}
    </Paper>
    <EmailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormData({})
          setFormSaveSucess({success: null, message: ""})
          setAccountCreatedSucess({success: null, message: ""})
          activeForm("")
        }}
        onSubmit={(email, retry) => handleFinalSubmit(email, retry)}
        saveSuccess={formSaveSucess}
        accountCreatedSuccess={accountCreatedSucess}
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
    </>
  );
};
