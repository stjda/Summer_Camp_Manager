import React, { useState, useEffect } from 'react';
import { Modal, TextField, Button, Box, Typography, Avatar, FormControlLabel, Switch, Grid, Paper, Divider } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useStore } from "../../util/Models/Stores";
import { motion, AnimatePresence } from 'framer-motion';
import Pica from 'pica';

export const EditProfileModal =({ openModal, handleCloseModal, handleCancelModal, hs, parseLocalStorage, wasConfirmed, setWasConfirmed }) => {
    
    const { userProfileStore } = useStore();
    const [errors, setErrors] = useState({
        breakfast: false,
        lunch: false,
        dinner: false
    });
    const ls_data = localStorage.getItem('STJDA_StoreSnapshot');  // grabbing the data snapshot from persistant storage
    const d = JSON.parse(ls_data);
    const insulinCarbRatioRegex = /^\d+\s*:\s*\d+$/;

    const [editedProfile, setEditedProfile] = useState({
        name: parseLocalStorage('name'),
        notifications: JSON.parse(parseLocalStorage('notifications')) ,
        email: parseLocalStorage('email'),
        phone: parseLocalStorage('phone'),
        emergencyContact: parseLocalStorage('emergencyContact'),
        photo: parseLocalStorage('avatar'),
    });
    // this state is pulled from the datastructure in local storage
    const [editedCareData, setEditedCareData] = useState({
        careType: parseLocalStorage('careType'),
        correctionFactor: parseLocalStorage('correctionFactor'),
        mdi: Boolean(parseLocalStorage('mdi')),
        cgm: parseLocalStorage('cgm'),
        insulinPump: parseLocalStorage('insulinPump'),
        insulinPumpModel: parseLocalStorage('insulinPumpModel'),
        doctor: parseLocalStorage('doctor')[0]?.name,
        doctorEmail: parseLocalStorage('doctor')[0]?.email,
        doctorPhone: parseLocalStorage('doctor')[0]?.phone,
        allergies: parseLocalStorage('allergies'),
        targetBG: { 
            breakfast: parseLocalStorage('targetBG')?.breakfast || -2,
            lunch: parseLocalStorage('targetBG')?.lunch || -2,
            dinner: parseLocalStorage('targetBG')?.dinner || -2,
        },
        insulinCarbRatio:{
            breakfast: parseLocalStorage('insulinCarbRatio')?.breakfast || "0 : 0",
            lunch: parseLocalStorage('insulinCarbRatio')?.lunch || "0 : 0",
            dinner: parseLocalStorage('insulinCarbRatio')?.dinner || "0 : 0",
        },
        longActingInsulin: parseLocalStorage('longActingInsulin') || [],
        rapidActingInsulin: parseLocalStorage('rapidActingInsulin') || [],

    });


useEffect(() => {
    console.log(editedCareData)
    return () => {
        // Clean up the object URL when the component unmounts
        if (editedProfile.photo instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(editedProfile.photo));
        }
    };
  
}, [editedProfile.photo]);

// convert image into base64 string
const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
        const pica = new Pica();
        const canvas = document.createElement('canvas');
        
        // Set maximum dimensions
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
            if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
            }
        }

        canvas.width = width;
        canvas.height = height;

        pica.resize(img, canvas, {
            unsharpAmount: 80,
            unsharpRadius: 0.6,
            unsharpThreshold: 2
        })
        .then(result => {
            // Convert canvas to base64
            const base64 = result.toDataURL('image/jpeg', 0.8); // 0.8 is the quality, adjust as needed
            
            setEditedProfile(prevState => ({
            ...prevState,
            photo: base64
            }));
        })
        .catch(err => {
            console.error('Pica error:', err);
            alert('Error processing image. Please try again.');
        });
        };
        img.src = URL.createObjectURL(file);
    }
};

const handleSave = () => {
    // Check if there are any errors before saving
    const hasErrors = Object.values(errors).some(error => error);
    if (hasErrors) {
        alert("Please correct the insulin-to-carb ratio format before saving.");
        return;
    }

    // If no errors, proceed with saving
    hs(editedProfile, editedCareData);
};

const handleSwitchChange = (name, checked, isCareData = false) => {
    if (isCareData) {
        setEditedCareData(prev => {
            return { ...prev, [name]: checked };
        });
    } else {
        setEditedProfile(prev => ({ ...prev, [name]: checked }));
    }
};


const validateInput = (value, field) => {
    const isValid = insulinCarbRatioRegex.test(value);
    setErrors(prev => ({ ...prev, [field]: !isValid }));
    return isValid;
};

const handleChange = (event) => {
    const { name, value } = event.target;
    const field = name.split('.')[1]; // Extract field name (breakfast, lunch, or dinner)
    
    // Update the field value regardless of validation
    setEditedCareData(prev => ({
        ...prev,
        insulinCarbRatio: {
            ...prev.insulinCarbRatio,
            [field]: value
        }
    }));

    // Validate the input
    validateInput(value, field);
};

    
const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
};

const handleCareDataChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith('targetBG.')) {
        const [_, meal] = name.split('.');
        setEditedCareData(prev => ({
            ...prev,
            targetBG: {
                ...prev.targetBG,
                [meal]: value
            }
        }));
    } 
    // if (name.startsWith('insulinCarbRatio.')) {
    //     const [_, meal] = name.split('.');
    //     setEditedCareData(prev => ({
    //         ...prev,
    //         insulinCarbRatio: {
    //             ...prev.insulinCarbRatio,
    //             [meal]: value
    //         }
    //     }));
    // } 
    if (name.startsWith('longActingInsulin.') || name.startsWith('rapidActingInsulin.')) {
        const [insulinType, index, field] = name.split('.');
        setEditedCareData(prev => ({
            ...prev,
            [insulinType]: prev[insulinType].map((item, idx) => 
                idx === parseInt(index) ? { ...item, [field]: value } : item
            )
        }));
    } if (name.startsWith('doctor.')) {
        const [_, field] = name.split('.');
        setEditedCareData(prev => ({
          ...prev,
          doctor: {
            ...prev.doctor,
            [field]: value
          }
        }));
      } else {
        setEditedCareData(prev => ({ ...prev, [name]: value }));
    }
};

const handleInsulinPumpSwitch = (event) => {
    const isChecked = event.target.checked;
    setEditedCareData(prevData => ({
        ...prevData,
        insulinPump: isChecked,
        insulinPumpModel: isChecked ? prevData.insulinPumpModel : '', // Preserve the model when switch is turned on, clear when turned off
    }));
};

return (
    <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="edit-profile-modal"
        aria-describedby="modal-to-edit-user-profile"
    >
        <Paper sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 2,
        }}>
            <Typography variant="h4" component="h2" gutterBottom color="primary" align="center">
                {wasConfirmed ? 'Confirm your Profile' : 'Edit Profile'}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                    src={editedProfile.photo 
                        ? (editedProfile.photo instanceof File
                            ? URL.createObjectURL(editedProfile.photo)
                            : editedProfile.photo)
                        : "/default-profile-picture.jpg"}
                    sx={{ width: 120, height: 120, mb: 2 }}
                />
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleImageUpload}
                />
                <label htmlFor="raised-button-file">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload Photo
                    </Button>
                </label>
            </Box>

            {parseLocalStorage('isAdmin') && (
                <Typography sx={{ color: 'red', mb: 2 }}>(Administrator)</Typography>
            )}

            <Grid container spacing={3} justifyContent="center">
                {/* Personal Information */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        InputLabelProps={{ shrink: true }} 
                        fullWidth 
                        label="Name" 
                        name="name" 
                        value={editedProfile.name} 
                        onChange={handleInputChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        InputLabelProps={{ shrink: true }} 
                        fullWidth 
                        label="Phone" 
                        name="phone" 
                        value={editedProfile.phone} 
                        onChange={handleInputChange}
                    />
                </Grid>
                {!d.isVolunteer && (
                    <>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Emergency Contact" 
                                name="emergencyContact" 
                                value={editedProfile.emergencyContact} 
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                InputLabelProps={{ shrink: true }} 
                                fullWidth 
                                label="Allergies" 
                                name="allergies" 
                                value={editedCareData.allergies} 
                                onChange={handleCareDataChange} 
                            />
                        </Grid>
                    </>
                )}
                
                {/* Care Profile */}
                {!d.isVolunteer && !parseLocalStorage('isAdmin') && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                                Care Profile
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="space-around">
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={editedProfile.notifications}
                                            onChange={(event) => handleSwitchChange('notifications', event.target.checked)} 
                                            name="notifications" 
                                        />
                                    }
                                    label="Notifications"
                                />
                                <FormControlLabel
                                    key="mdi-switch"
                                    control={
                                        <Switch 
                                            checked={editedCareData.mdi} 
                                            onChange={(event) => handleSwitchChange('mdi', event.target.checked, true)}
                                            name="mdi"
                                        />
                                    }
                                    label="MDI"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={editedCareData.insulinPump}
                                            onChange={handleInsulinPumpSwitch}
                                            name="insulinPump"
                                        />
                                    }
                                    label="Insulin Pump"
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <AnimatePresence>
                                {editedCareData.insulinPump && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                                    >
                                        <TextField 
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: '100%', maxWidth: '400px' }}
                                            margin="normal" 
                                            label="Insulin Pump Model" 
                                            name="insulinPumpModel" 
                                            value={editedCareData.insulinPumpModel} 
                                            onChange={handleCareDataChange} 
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                InputLabelProps={{ shrink: true }} 
                                fullWidth 
                                label="Care Type" 
                                name="careType" 
                                value={editedCareData.careType} 
                                onChange={handleCareDataChange} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                InputLabelProps={{ shrink: true }} 
                                fullWidth 
                                label="Correction Factor" 
                                name="correctionFactor" 
                                value={editedCareData.correctionFactor} 
                                onChange={handleCareDataChange} 
                            />
                        </Grid>

                        {/* Doctor Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>Doctor Information</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                InputLabelProps={{ shrink: true }}
                                fullWidth 
                                margin="normal" 
                                label="Doctor Name" 
                                name="doctor" 
                                value={editedCareData.doctor} 
                                onChange={handleCareDataChange} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                InputLabelProps={{ shrink: true }}
                                fullWidth 
                                margin="normal" 
                                label="Doctor Email" 
                                name="doctorEmail" 
                                value={editedCareData.doctorEmail} 
                                onChange={handleCareDataChange} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                InputLabelProps={{ shrink: true }}
                                fullWidth 
                                margin="normal" 
                                label="Doctor Phone" 
                                name="doctorPhone" 
                                value={editedCareData.doctorPhone} 
                                onChange={handleCareDataChange} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                InputLabelProps={{ shrink: true }}
                                fullWidth 
                                margin="normal" 
                                label="CGM" 
                                name="cgm" 
                                value={editedCareData.cgm} 
                                onChange={handleCareDataChange} 
                            />
                        </Grid>
                        
                        {/* Target Blood Glucose */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>Target Blood Glucose</Typography>
                            <Grid container spacing={2}>
                                {['breakfast', 'lunch', 'dinner'].map((meal) => (
                                    <Grid item xs={12} sm={4} key={meal}>
                                        <TextField 
                                            fullWidth 
                                            label={meal.charAt(0).toUpperCase() + meal.slice(1)}
                                            name={`targetBG.${meal}`}
                                            value={editedCareData.targetBG[meal]}
                                            onChange={handleCareDataChange}
                                            InputProps={{
                                                endAdornment: <Typography variant="caption">mg/dL</Typography>,
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        
                        {/* Insulin-to-Carb Ratio */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>Insulin-to-Carb Ratio</Typography>
                            <Grid container spacing={2}>
                                {['breakfast', 'lunch', 'dinner'].map((meal) => (
                                    <Grid item xs={12} sm={4} key={meal}>
                                        <TextField
                                            fullWidth
                                            label={meal.charAt(0).toUpperCase() + meal.slice(1)}
                                            name={`insulinCarbRatio.${meal}`}
                                            value={editedCareData.insulinCarbRatio[meal]}
                                            onChange={handleChange}
                                            error={errors[meal]}
                                            helperText={errors[meal] ? "Invalid format. Use '1:20', '3:40', etc." : "Units:Grams (U:g)"}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        
                        {/* Long Acting Insulin */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>Long Acting Insulin</Typography>
                            {editedCareData.longActingInsulin.map((insulin, index) => (
                                <Grid container spacing={2} key={index}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Name"
                                            name={`longActingInsulin.${index}.name`}
                                            value={insulin.name}
                                            onChange={handleCareDataChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Dosage"
                                            name={`longActingInsulin.${index}.dosage`}
                                            value={`${insulin.dosage}`}
                                            onChange={handleCareDataChange}
                                            InputProps={{
                                                endAdornment: <Typography variant="caption">Units</Typography>,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>
                        
                        {/* Rapid Acting Insulin */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>Rapid Acting Insulin</Typography>
                            {editedCareData.rapidActingInsulin.map((insulin, index) => (
                                <Grid container spacing={2} key={index}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Name"
                                            name={`rapidActingInsulin.${index}.name`}
                                            value={insulin.name}
                                            onChange={handleCareDataChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Dosage"
                                            name={`rapidActingInsulin.${index}.dosage`}
                                            value={insulin.dosage}
                                            onChange={handleCareDataChange}
                                            InputProps={{
                                                endAdornment: <Typography variant="caption">Units</Typography>,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Button onClick={() => {setWasConfirmed(false); handleCancelModal()}} variant="outlined" sx={{ mr: 2 }}>
                    Cancel
                </Button>
                <Button 
                    onClick={() => {
                        const hasErrors = Object.values(errors).some(error => error);
                        if (hasErrors) {
                            alert("Please correct the insulin-to-carb ratio format before saving.");
                        } else {
                            setWasConfirmed(true); 
                            handleSave();
                        }
                    }} 
                    variant="contained" 
                    color="primary"
                    sx={{ mr: 2 }}
                >
                    {wasConfirmed ? 'Confirm' : 'Save'}
                </Button>
                <Button 
                    onClick={() => {setWasConfirmed(false); handleSave();}} 
                    variant="contained" 
                    color="secondary" 
                    hidden={!wasConfirmed}
                >
                    Remove Account
                </Button>
            </Box>
        </Paper>
    </Modal>
)};