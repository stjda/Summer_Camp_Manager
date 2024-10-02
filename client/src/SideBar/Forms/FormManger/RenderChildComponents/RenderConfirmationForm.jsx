/**
 * DynamicForm Component Renders the Form inside the Accordian of the Confirmation Form COmponent
 * 
 * This component renders a dynamic form based on a predefined form structure.
 * It uses the template for rendering the field questions of the confirmation form.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.handleChange - Function to handle changes in form fields
 * @param {Function} props.handleSubmit - Function to handle form submission
 * @param {Object} props.apiData - Initial data for the form
 * @param {number|null} [props.index=null] - Index of the form (if multiple forms are rendered)
 * @param {Function} props.setFormData - Function to update the parent component's form data
 * 
 * @example
 * <DynamicForm
 *   handleChange={handleChange}
 *   handleSubmit={handleSubmit}
 *   apiData={initialData}
 *   setFormData={setFormData}
 * />
 * 
 * Features:
 * - Renders form fields dynamically based on the formStructure
 * - Supports various field types: text, textarea, switch, date, select, file
 * - Handles file uploads
 * - Performs form validation
 * - Manages local form state and syncs with parent component
 * 
 * The component uses Material-UI components for styling and layout.
 * It also includes custom logic for formatting and handling specific field types.
 *  * @example
 * <DynamicForm
 *   handleChange={handleChange}
 *   handleSubmit={handleSubmit}
 *   apiData={initialData}
 *   setFormData={setFormData}
 * />
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  FormHelperText,
  IconButton,
  Typography,
} from '@mui/material';
import { UploadFile, Clear } from '@mui/icons-material';
import { UploadFileHelper } from '../FormHelpers/UploadImageToServer';
import { formStructure } from '../../../../assets/Templates/ConfirmationForm';

export const DynamicForm = ({handleChange, handleSubmit, apiData, index=null, setFormData}) => {
  const [localFormData, setLocalFormData] = useState(apiData);
  const [errors, setErrors] = useState({});
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [fileData, setFileData] = useState({key: null, url: null});
  const fileInputRef = useRef({});

    /**
   * File upload helper hook
   * @type {Object}
   */
  const { // destructue the upload file helper hook, from UploadImageToServer.js
    processAndUploadFile, 
    uploadLoading, 
    uploadError, 
    uploadResponse, 
    uploadLoadingComponent 
  } = UploadFileHelper('', setLocalFormData, false); // We'll set the fieldName later

   /**
   * Effect to sync local form data with parent component
   */
  useEffect(() => {
    setFormData(prevData => ({...prevData, ...localFormData}));
    console.log("local form data",localFormData)
    // sets the UI to show the link and the key
    if (localFormData.document) {
      setFileData({
        key: localFormData.document.key || null,
        url: localFormData.document.url || null
      });
    }
  }, [localFormData, setFormData]);

  /**
   * Handles changes in form fields
   * @param {Event} e - The change event
   * @param {string} fieldName - Name of the changed field
   */
  const handleLocalChange = (e, fieldName) => {
    const { value, type, checked } = e.target;
    let newValue;

    if (fieldName === 'selectedCamps') {
      newValue = Array.isArray(value) ? value.join(', ') : value;
    } else {
      newValue = type === 'checkbox' ? checked : value;
    }

    setLocalFormData(prevData => ({
      ...prevData,
      [fieldName]: newValue
    }));

    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: ''
    }));

    setIsFormChanged(true);

    handleChange({ target: { name: fieldName, value: newValue } }, index);
  };

    /**
   * Handles file selection and upload
   * @param {Event} e - The file input change event
   * @param {string} fieldName - Name of the file field
   */
  const handleFileChange = async (e, fieldName) => {
    const files = Array.from(e.target.files);
  
    if (files.length > 0) {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const uploadedFileData = await processAndUploadFile(file, fieldName);
          return {
            name: file.name,
            key: uploadedFileData?.key,
            url: uploadedFileData?.url
          };
        })
      );
  
    const newValue = files.length === 1 ? uploadedFiles[0] : uploadedFiles;

    if (newValue) {
      // Use the processAndUploadFile function from the hook and upload the file directly right now
      await processAndUploadFile(newValue, fieldName);
  
      // Notify parent component
      handleChange({ target: { name: fieldName, value: newValue } }, index);
    }}
  };

    /**
   * Clears selected file(s)
   * @param {string} fieldName - Name of the file field
   * @param {number} [fileIndex] - Index of the file to clear (for multiple files)
   */
  const handleFileClear = (fieldName) => {
    setLocalFormData(prevData => {
      const currentValue = prevData[fieldName];
      let newValue;
  
      if (Array.isArray(currentValue)) {
        // Multiple files
        newValue = currentValue.filter((_, index) => index !== fileIndex);
        if (newValue.length === 0) newValue = null;
      } else {
        // Single file
        newValue = null;
      }
  
      return { ...prevData, [fieldName]: newValue };
    });

    setIsFormChanged(true);

    // Notify parent component
    handleChange({ target: { name: fieldName, value: null } }, index);
  };

   /**
   * Formats select field values
   * @param {string} value - The value to format
   * @returns {string} Formatted value
   */
  const formatSelectValue = (value) => {
    if (typeof value !== 'string') return '';
    return value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

    /**
   * Retrieves the value of a form field
   * @param {string} fieldName - Name of the field
   * @param {string} fieldType - Type of the field
   * @returns {*} The field value
   */
  const getFieldValue = (fieldName, fieldType) => {
    let value;

    if (fieldName === 'dateOfBirth' && localFormData.dateOfBirth) {
      try {
        const date = new Date(localFormData.dateOfBirth);
        value = date.toISOString().split('T')[0]; // This will return 'YYYY-MM-DD'
      } catch (error) {
        console.error("Invalid date:", localFormData.dateOfBirth);
        value = '';
      }
    } else if (fieldName === 'primaryCarePhysician') {
      value = localFormData.primaryCarePhysician ?? '';
    } else if(fieldName === 'selectedCamps') {
      value = localFormData[fieldName] ? localFormData[fieldName].split(', ') : [];
    }else if (fieldType === 'file') {
      if (Array.isArray(localFormData[fieldName])) {
        value = localFormData[fieldName].map(file => file.name).join(', ');
      } else if (localFormData[fieldName]) {
        value = localFormData[fieldName].name;
      } else {
        value = '';
      } 
    }else {
      value = localFormData[fieldName] ?? '';
    }

    if (fieldType === 'select' && fieldName !== 'selectedCamps') {
      return value ? formatSelectValue(value) : '';
    }

    return value;
  };

    /**
   * Validates the form
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    Object.entries(formStructure).forEach(([_, fields]) => {
      fields.forEach(field => {
        if (field.required && !getFieldValue(field.name, field.type)) {
          newErrors[field.name] = 'This field is required';
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    /**
   * Renders a form field based on its type
   * @param {Object} field - Field configuration object
   * @returns {React.ReactElement} Rendered form field
   */
  const renderField = (field) => {
    const commonProps = {
      fullWidth: true,
      label: field.label,
      name: field.name,
      value: String(getFieldValue(field.name === 'Physician' ? 'primaryCarePhysician' : field.name, field.type)),
      onChange: (e) => handleLocalChange(e, field.name === 'Physician' ? 'primaryCarePhysician' : field.name),
      required: field.required,
      error: !!errors[field.name],
      helperText: errors[field.name] || field.helperText
    };

    // Special case for originalKey
    if (field.name === 'originalKey') {
      return (
        <TextField
          {...commonProps}
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            style: {
              fontSize: '0.70rem',
              padding: '2px 4px',
              backgroundColor: 'transparent',
            },
          }}
          variant="standard"
          margin="dense"
          sx={{
            '& .MuiInputBase-root': {
              height: '24px',
            },
            '& .MuiFormLabel-root': {
              fontSize: '0.8rem',
            },
          }}
        />
      );
    }
    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 3 : 1}
            
          />
        );
      case 'switch':
        return (
          <FormControl error={!!errors[field.name]}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(getFieldValue(field.name, field.type))}
                  onChange={(e) => handleLocalChange(e, field.name)}
                  name={field.name}
                  required={field.required}
                />
              }
              label={field.label}
            />
            {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
          </FormControl>
        );
      case 'date':
        return (
          <TextField
            {...commonProps}
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />
        );
      case 'select':
        if (field.name === 'selectedCamps') {
          return (
            <FormControl fullWidth error={!!errors[field.name]}>
              <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
              <Select
                labelId={`${field.name}-label`}
                id={field.name}
                name={field.name}
                multiple
                value={getFieldValue(field.name, field.type)}
                onChange={(e) => handleLocalChange(e, field.name)}
                label={field.label}
                required={field.required}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {field.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
            </FormControl>
          );
        } else {
          return (
            <FormControl fullWidth error={!!errors[field.name]}>
              <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
              <Select
                labelId={`${field.name}-label`}
                id={field.name}
                name={field.name}
                value={getFieldValue(field.name, field.type)}
                onChange={(e) => handleLocalChange(e, field.name)}
                label={field.label}
                required={field.required}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {field.options.map((option) => (
                  <MenuItem key={option} value={formatSelectValue(option)}>
                    {formatSelectValue(option)}
                  </MenuItem>
                ))}
              </Select>
              {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
            </FormControl>
          );
        }
// this should handle multiple uploads but, 
// multiple uploads are not being set when the initial object form data is being pulled in from the database in the Get-hook
// unless theres a reason im not doing multiple uploads right now, wil throw an errorthey 'key' is not defined in the console because only one is being rendered, not multiple
        case 'file':  
          return (
          <Box>
            <input  
              type="file"
              multiple={field.multiple} // change this in the template to allow multiple
              ref={el => fileInputRef.current[field.name] = el}
              style={{ display: 'none' }}
              onChange={(e) => {handleFileChange(e, field.name); setIsFormChanged(true);}}
              required={field.required}
            />
            <Button
              variant="contained"
              onClick={() => {fileInputRef.current[field.name].click();}}
              startIcon={<UploadFile />}
              disabled={localFormData.document?true:false}
            >
              {field.label}
            </Button>
            {localFormData[field.name] && (
              <Box mt={1}>
                {Array.isArray(localFormData[field.name]) ? (
                  localFormData[field.name].map((file, index) => (
                    <Box key={index} mt={1} display="flex" flexDirection="column">
              {/* If you want to add logic to delete the form from the database when the red 'X' is clicked do it in handleClearFile */}
                      <IconButton onClick={() => {handleFileClear(field.name, index)  }} size="small" style={{ color: 'red' }}>
                        <Clear />
                      </IconButton>
                      <Box flexGrow={1}>
                        <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                          File Type: {file.key.split('.')[1] || 'Unknown file type'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" style={{ fontSize: '0.60rem' }}>
                        Unique Identifier: {file.key.split('.')[0]}
                      </Typography>
                      <Box>
                        <Button variant="contained" style={{ backgroundColor: 'transparent' }}>
                          <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              View uploaded file
                            </a>
                          </Typography>
                        </Button>
                      </Box>
                    </Box>
                  ))
                ) : (
                  // Single file
                  <Box display="flex" flexDirection="column" mb={1}>
                    <IconButton onClick={() => handleFileClear(field.name)} size="small" style={{ color: 'red' }}>
                      <Clear />
                    </IconButton>
                    <Box flexGrow={1}>
                      <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                        File Type: {localFormData[field.name].key.split('.')[1] || 'Unknown file type'}
                      </Typography>
                    </Box>
                    {localFormData[field.name].key && (
                      <Typography variant="body2" style={{ fontSize: '0.60rem' }}>
                        Unique Identifier: {localFormData[field.name].key.split('.')[0]}
                      </Typography>
                    )}
                    {localFormData[field.name].url && (
                      <Box>
                        <Button variant="contained" style={{ backgroundColor: 'transparent' }}>
                          <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                            <a href={localFormData[field.name].url} target="_blank" rel="noopener noreferrer">
                              View uploaded file
                            </a>
                          </Typography>
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
            {errors[field.name] && <FormHelperText error>{errors[field.name]}</FormHelperText>}
            {uploadLoading && uploadLoadingComponent()}
            {uploadError && <p>Error: {uploadError}</p>}
            {uploadResponse && <p>Upload successful!</p>}
          </Box>
          );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (validateForm()) {
        handleSubmit(e, index);
      }
    }}>
      <Grid container spacing={3}>
        {Object.entries(formStructure).map(([section, fields]) => (
          <React.Fragment key={section}>
            <Grid item xs={12}>
              <Box sx={{ fontWeight: 'bold', mb: 2 }}>{section}</Box>
            </Grid>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
      <Button 
      type="submit" 
      variant="contained" 
      color="primary" 
      sx={{ mt: 3 }}
      disabled={!isFormChanged}      
      >
        Submit
      </Button>
    </form>
  );
};