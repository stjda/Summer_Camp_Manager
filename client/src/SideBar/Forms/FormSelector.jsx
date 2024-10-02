import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel, Button, Box } from '@mui/material';

const FormSelector = ({ type, options, selectedForm, onFormSelect, onClear, handleNext }) => {
  const isSelected = selectedForm.startsWith(`${type}:`);

  const handleChange = (event) => {
    onFormSelect(type, event.target.value);
  };


  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {options.title}
        </Typography>
        <RadioGroup value={isSelected ? selectedForm.split(':')[1] : ''} onChange={handleChange}>
          {options.forms.map((form) => (
            <FormControlLabel key={form.value} value={form.value} control={<Radio />} label={form.label} />
          ))}
        </RadioGroup>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={onClear}>Clear</Button>
          <Button variant="contained" disabled={!isSelected} onClick={handleNext}>Continue</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export const StaffFormSelector = (props) => (
  <FormSelector
    {...props}
    type="staff"
    options={{
      title: "Staff Forms",
      forms: [
        { value: "Background Check", label: "Background Check" }
      ]
    }}
  />
);

export const CamperFormSelector = (props) => (
  <FormSelector
    {...props}
    type="camper"
    options={{
      title: "Intake Forms",
      forms: [
        { value: "Confirm Reservation", label: "Confirm Reservation" },
        { value: "Med-Check-in", label: "Med-Check-in" }
      ]
    }}
  />
);

export const ParticipationFormSelector = (props) => (
  <FormSelector
    {...props}
    type="participation"
    options={{
      title: "Participant Forms",
      forms: [
        { value: "Accomodations", label: "Accomodations" },
        { value: "Release", label: "Medical Release" }
      ]
    }}
  />
);