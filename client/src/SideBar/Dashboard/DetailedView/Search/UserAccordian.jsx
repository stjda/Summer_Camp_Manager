// UserAccordion.jsx
import React from 'react';
import {
    Accordion, AccordionSummary, AccordionDetails, Typography, Checkbox, IconButton, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ContentGrid } from './GridContainer';

export const UserAccordion = ({ data, isChecked, onCheckboxChange, onCopy, handleDataChange }) => {

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${data.id}-content`}
                id={`panel${data.id}-header`}
            >
                <Checkbox
                    checked={isChecked}
                    onChange={(event) => onCheckboxChange(data.firstName, data.lastName, data.email, event.target.checked)}
                    onClick={(event) => event.stopPropagation()}
                />
                <Typography sx={{ width: '33%', flexShrink: 0 }}>
                    {`${data.firstName || '-'} ${data.lastName || '-'}`}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{data.email || 'N/A'}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>

                    {/* Render the ContentGrid component here */}
                    <ContentGrid 
                        activeLink={123} 
                        data={data} 
                        onDataChange={handleDataChange}
                    />
                    
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 2 }}>
                    <IconButton onClick={() => onCopy(data)}>
                        <ContentCopyIcon />
                    </IconButton>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};


             {/* <Typography>ID: {data.id}</Typography>
                <Typography>Email: {data.email || 'N/A'}</Typography>
                <Typography>Last Known BG: {data.__typename === 'Camper' ? (data.careData?.lastKnownBG || 'N/A') : 'N/A'}</Typography>
                <Typography>MDI: {data.__typename === 'Camper' ? (data.careData?.mdi ? 'Yes' : 'No') : 'N/A'}</Typography>
                <Typography>Assigned Staff/Camper: {Array.isArray(data.volunteerAssignments) 
                    ? data.volunteerAssignments.map(assignment => assignment.email).join(', ')
                    : 'None'}
                </Typography> */}