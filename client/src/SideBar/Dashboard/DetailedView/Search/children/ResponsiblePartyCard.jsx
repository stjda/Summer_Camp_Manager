import React from 'react';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

export const ResponsibleParty = ({ onDataChange }) => {
    
    const roles = [
        { role: 'Counselor', name: 'John Doe' },
        { role: 'Med-staff AM', name: 'Jane Smith' },
        { role: 'Med-staff PM', name: 'Alice Johnson' },
        { role: 'Admin', name: 'Bob Brown' }
    ];

    return (
        <Card sx={{ minWidth: 225, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Responsible Party
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        {roles.map((item, index) => (
                            <Typography variant="body1" key={index}>
                                {item.role}: {item.name}
                            </Typography>
                        ))}
                    </Box>
                    <Avatar sx={{ bgcolor: 'lightgreen' }}>
                        <PersonIcon />
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
}