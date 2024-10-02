import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';


export const Volunteers = ({ camperName, volunteers }) => {

  
const getVolunteerIcon = (type) => {
  switch (type) {
    case 'Doctor':
      return <LocalHospitalIcon />;
    case 'Counselor':
      return <PsychologyIcon />;
    case 'Phys Trainer':
      return <FitnessCenterIcon />;
    case 'Administrator':
      return <GroupIcon />;
    case 'Nurse':
      return <LocalHospitalIcon />;
    case 'Camper':
      return <PersonIcon />;
    default:
      return <PersonIcon />;
  }
};
  
  const renderList = () => {
    if (camperName && volunteers && volunteers.length > 0) {
      return (
        <>
          <ListItem>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={`Assignments:`} />
          </ListItem>
          {volunteers.map((volunteer, index) => (
            <ListItem key={index} sx={{ pl: 4 }}>
              <ListItemIcon>
                {getVolunteerIcon(volunteer.type)}
              </ListItemIcon>
              <ListItemText 
                primary={volunteer.name || volunteer}
                secondary={volunteer.id ? `ID: ${volunteer.id}` : null}
              />
            </ListItem>
          ))}
        </>
      );
    } else if (camperName) {
      const names = camperName.split(', ');
      return (
        <>
          <ListItem>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Assignments:" />
          </ListItem>
          {names.map((name, index) => (
            <ListItem key={index} sx={{ pl: 4 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={name} />
            </ListItem>
          ))}
        </>
      );
    } else if (volunteers && volunteers.length > 0) {
      return volunteers.map((volunteer, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            {getVolunteerIcon(volunteer.type)}
          </ListItemIcon>
          <ListItemText 
            primary={volunteer.name || volunteer}
            secondary={volunteer.id ? `ID: ${volunteer.id}` : null}
          />
        </ListItem>
      ));
    } else {
      return (
        <ListItem>
          <ListItemText primary="No data available" />
        </ListItem>
      );
    }
  };

const getTitle = () => {
  if (camperName && volunteers && volunteers.length > 0) {
    return 'Assignment';
  } else if (camperName) {
    const names = camperName.split(', ');
    // in case we want to check if the length makes it plural
    return names.length > 1 ? 'Assignment' : 'Assignment';
  } else if (volunteers && volunteers.length > 0) {
    return 'Volunteer Assignments';
  } else {
    return 'No Data';
  }
};

  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {getTitle()}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List dense>
          {renderList()}
        </List>
      </CardContent>
    </Card>
  );
};