import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PrescriptionCard, OverTheCounter, ResponsibleParty, InsulinNotesCard, CamperNotesCard, BGAndCarbsChart } from '../..';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#dfe6e9',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  transition: 'box-shadow 0.3s ease-in-out',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // Ensure all papers take full height of their grid cell
}));

const ContentWrapper = styled(Box)({
  flexGrow: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

export const ContentGrid = ({ data, activeLink, onDataChange }) => {

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gridTemplateRows: {
          xs: 'auto',
          sm: 'repeat(2, minmax(300px, auto))', // Set a minimum height for rows
        },
        gap: 2,
        width: '100%',
        padding: 2,
        height: '100%', // Ensure the grid takes full height of its container
      }}
    >
      {/* Prescriptions - First row, first column */}
      <StyledPaper elevation={1}>
        <Typography variant="h6" gutterBottom>Prescriptions</Typography>
        <ContentWrapper>
          <PrescriptionCard onDataChange={(data) => onDataChange('prescription', data)}/>
        </ContentWrapper>
      </StyledPaper>

      {/* Over the Counter Medicine - First row, second column */}
      <StyledPaper elevation={1}>
        <Typography variant="h6" gutterBottom>Over the Counter Medicine</Typography>
        <ContentWrapper>
          <OverTheCounter onDataChange={(data) => onDataChange('otc', data)}/>
        </ContentWrapper>
      </StyledPaper>

      {/* Responsible Parties - First row, third column */}
      <StyledPaper elevation={1}>
        <Typography variant="h6" gutterBottom>Providers</Typography>
        <ContentWrapper>
          <ResponsibleParty onDataChange={(data) => onDataChange('responsibleParty', data)}/>
        </ContentWrapper>
      </StyledPaper>

      {/* Insulin Data - First and second row, fourth column */}
      <StyledPaper 
        elevation={1}
        sx={{ 
          gridRow: {
            xs: 'auto',
            sm: 'span 2',
          },
          gridColumn: {
            xs: '1',
            sm: 'auto',
            md: 'auto',
            lg: '4',
          },
        }}
      >
        <Typography variant="h6" gutterBottom>Insulin Data</Typography>
        <ContentWrapper>
          <InsulinNotesCard onDataChange={(data) => onDataChange('insulinNotes', data)} />
        </ContentWrapper>
      </StyledPaper>

      {/* Glucose & Carb Chart - Second row, spanning two columns */}
      <StyledPaper 
        elevation={1}
        sx={{ 
          gridColumn: {
            xs: '1',
            sm: 'span 2',
            md: 'span 2',
            lg: 'span 2',
          },
          gridRow: {
            xs: 'auto',
            sm: '2',
            md: '2',
            lg: '2',
          },
        }}
      >
        <Typography variant="h6" gutterBottom>Glucose & Carb Chart</Typography>
        <ContentWrapper>
          <BGAndCarbsChart 
            data={data.bgAndCarbs} 
            onDataChange={(newData) => onDataChange('bgAndCarbs', newData)} 
          />
        </ContentWrapper>
      </StyledPaper>

      {/* Medical Notes - Second row, third column */}
      <StyledPaper elevation={1}
        sx={{
          gridRow: {
            xs: 'auto',
            sm: '2',
            md: '2',
            lg: '2',
          },
        }}
      >
        <Typography variant="h6" gutterBottom>Medical Notes</Typography>
        <ContentWrapper>
          <CamperNotesCard onDataChange={(data) => onDataChange('camperNotes', data)} />
        </ContentWrapper>
      </StyledPaper>
    </Box>
  );
};