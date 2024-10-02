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
  FormHelperText,
} from '@mui/material';
import { UploadFile, Clear } from '@mui/icons-material';
import { medCheckInFormStructure } from '../../../../assets/Templates/MedCheckIn';

/**
 * DynamicMedicalCheckInForm Component
 * 
 * This component renders a dynamic form for medical check-ins based on a predefined form structure.
 * It handles form state, validation, and submission.
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
 * <DynamicMedicalCheckInForm
 *   handleChange={handleChange}
 *   handleSubmit={handleSubmit}
 *   apiData={initialData}
 *   index={0}
 *   setFormData={setFormData}
 * />
 */
export const DynamicMedicalCheckInForm = ({ handleChange, handleSubmit, apiData, index = null, setFormData }) => {
  
  const [localFormData, setLocalFormData] = useState(apiData);
  const [errors, setErrors] = useState({});
  const [isFormChanged, setIsFormChanged] = useState(false);
  const fileInputRef = useRef({});

    /**
   * Effect to sync local form data with parent component
   */
  useEffect(() => {
    setFormData(prevData => ({ ...prevData, ...localFormData }));
  }, [localFormData, setFormData]);

   /**
   * Handles changes in form fields
   * @param {Event} e - The change event
   * @param {string} fieldName - Name of the changed field
   */
   const handleLocalChange = (e, fieldName) => {
    const { value, type, checked } = e.target;
    const newValue = type === 'checkbox' || type === 'switch' ? checked : value;

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
   * Retrieves the value of a form field
   * @param {string} fieldName - Name of the field
   * @param {string} fieldType - Type of the field
   * @returns {*} The field value
   */
 const getFieldValue = (fieldName, fieldType) => {
    let value = localFormData[fieldName] ?? '';
  
    if (fieldType === 'datetime-local' && value) {
      // Create a date object in UTC
      const utcDate = new Date(value);
      
      // Convert UTC to local time
      const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
      
      // Format the local date to YYYY-MM-DDTHH:mm
      value = localDate.toISOString().slice(0, 16);
    } else if (fieldType === 'date' && value) {
      // Create a date object in UTC
      const utcDate = new Date(value);
      
      // Convert UTC to local time
      const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
      
      // Format the local date to YYYY-MM-DD
      value = localDate.toISOString().split('T')[0];
    }
  
    return value;
  };

    /**
   * Validates the form
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    medCheckInFormStructure["Medical Check-In"].forEach(field => {
      if (field.required && !getFieldValue(field.name, field.type)) {
        newErrors[field.name] = 'This field is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    /**
   * Renders a form field based on its type
   * @param {Object} field - Field configuration object
   * @returns {React.ReactElement} Rendered form field
   */
  const renderFormField = (field) => {
    const { name, label, type, helperText, required, options } = field;
    const value = getFieldValue(name, type);

    switch (type) {
      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => handleLocalChange(e, name)}
                name={name}
              />
            }
            label={label}
          />
        );
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            label={label}
            name={name}
            value={value}
            onChange={(e) => handleLocalChange(e, name)}
            helperText={helperText || errors[name]}
            required={required}
            error={!!errors[name]}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth error={!!errors[name]}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleLocalChange(e, name)}
              label={label}
              name={name}
              required={required}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
          </FormControl>
        );
      // Add file handling here if needed
      default:
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            type={type}
            value={value}
            onChange={(e) => handleLocalChange(e, name)}
            helperText={helperText || errors[name]}
            required={required}
            InputLabelProps={{ shrink: true }}
            error={!!errors[name]}
          />
        );
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
 if (validateForm()) {
        // Convert local dates back to UTC before submitting
        const submissionData = { ...localFormData };
        medCheckInFormStructure["Medical Check-In"].forEach(field => {
          if ((field.type === 'datetime-local' || field.type === 'date') && submissionData[field.name]) {
            const localDate = new Date(submissionData[field.name]);
            submissionData[field.name] = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
          }
        });
        handleSubmit(e, index, submissionData);
      }
    }}>
      <Grid container spacing={3}>
        {medCheckInFormStructure["Medical Check-In"].map((field) => (
          <Grid item xs={12} sm={6} key={field.name}>
            {renderFormField(field)}
          </Grid>
        ))}
      </Grid>
      <Box mt={3}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={!isFormChanged}
        >
          Submit
        </Button>
      </Box>
    </form>
  );
};