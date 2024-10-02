import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Tabs, Tab, Typography } from '@mui/material';
// import { useStore } from '../../../../util/Models/Stores';
import { ContentGrid, SearchGrid } from './DetailedView';
import { AdminPrivileges, AiSection, Appointments, SocialPage, DevicesTab, DirectSearch, } from './index'
//import { userProfileStore }

export const DashboardNavigator = ({ onMobileViewChange, onActiveLinkChange }) => {
  //const { userProfileStore } = useStore();
  const [activeLink, setActiveLink] = useState('Detailed View');
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [navItems, setNavItems] = useState([]);
  const isMobileView = screenSize <= 535;

    
    useEffect(() => {
      const ls_data = localStorage.getItem('STJDA_StoreSnapshot');
      const d = JSON.parse(ls_data);
      
      if (d?.isAdmin) {
        setNavItems([
          { label: 'Assignments', id: 'Assignments' },
          { label: 'Detailed View', id: 'Detailed View' },
          { label: 'Privileges', id: 'Privileges' },
          { label: 'Devices', id: 'Devices' },
          { label: 'Connect', id: 'Connect' },
          { label: 'Appointments', id: 'Appointments' },
          { label: 'Health Insights', id: 'Health Insights' },
        ]);
      } else if (d?.isCamper) {
        setNavItems([
          { label: 'Detailed View', id: 'Detailed View' },
          { label: 'Devices', id: 'Devices' },
          { label: 'Connect', id: 'Connect' },
          { label: 'Appointments', id: 'Appointments' },
          { label: 'Health Insights', id: 'Health Insights' },

        ]);
      }else{
        setNavItems([
          { label: 'Detailed View', id: 'Detailed View' },
        ]);
      }
    }, []); 


  const setActiveLinkAndNotify = (linkId) => {
    setActiveLink(linkId);
    // onActiveLinkChange(linkId);
  };

  useEffect(() => {
    const handleResize = () => {
      const newScreenSize = window.innerWidth;
      setScreenSize(newScreenSize);
      // onMobileViewChange(newScreenSize <= 535);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onMobileViewChange]);

  const MobileNav = () => (
    <Grid container spacing={2} justifyContent="center">
      {navItems.map((item, index) => (
        <Grid item xs={index === 4 ? 12 : 6} key={item.id}>
          <Button
            onClick={() => setActiveLinkAndNotify(item.id)}
            variant={activeLink === item.id ? "contained" : "outlined"}
            fullWidth
          >
            {item.label}
          </Button>
        </Grid>
      ))}
    </Grid>
  );

  const TabularNav = () => (
    <Tabs
      value={activeLink}
      onChange={(event, newValue) => setActiveLinkAndNotify(newValue)}
      variant="fullWidth"
      aria-label="navigation tabs"
      sx={{
        position: 'relative',
        top: '-15px', // creates a gap between the content and the tabs
        left: {
            xs: 'calc(100vw - 92vw)', // for extra small screens
            sm: 'calc(100vw - 95vw)', // for small screens
            md: 'calc(100vw - 109vw)', // for medium screens
            lg: 'calc(100vw - 120vw)', // for large screens
            xl: 'calc(100vw - 125vw)', // for extra large screens
          },
        zIndex: 1,
        '& .MuiTabs-flexContainer': {
          justifyContent: 'flex-start',
        },
        '& .MuiTab-root': {
          minWidth: 'auto',
          padding: '8px 16px',
          color: 'text.primary',
          backgroundColor: '#e0e0e0',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          marginRight: '2px',
          transition: 'all 0.2s',
          '&.Mui-selected': {
            color: 'primary.main',
            backgroundColor: 'white',
            fontWeight: 'bold',
          },
          '&:not(.Mui-selected):hover': {
            backgroundColor: '#d0d0d0',
          },
        },
      }}
    >
      {navItems.map((item) => (
        <Tab
          key={item.id}
          label={item.label}
          value={item.id}
          disableRipple
        />
      ))}
    </Tabs>
  );

 
  return (
    // controls the box around the dashboard elements
    <Box
      position="absolute"
      top="10%"
      left={{ xs: '15vw', sm: '25vw'}}
      right={0}
      bgcolor='whitesmoke'
      borderRadius={2}
      margin="auto"
      padding={2}
      color='black'
      alignItems='center'
      justifyContent='center'
      width={{ xs: '100%'}}
      boxShadow="0 0 0 8px rgba(187, 189, 191, 0.4)"
      height={'auto'}
      sx={{
        overflow: 'visible', // Allow content to overflow for tabs
      }}
    >
      <Box display="flex" alignItems="center" position="relative" flexDirection="column" right={{ xs: '1.75rem'}} bottom={60}>
        {!isMobileView && <TabularNav />}
        {isMobileView && <MobileNav />}
        <Box position="relative" 
        sx={{left: {
            xs: 'calc(100vw - 101vw)', // for extra small screens
            sm: 'calc(100vw - 100vw)', // for small screens
            md: 'calc(100vw - 110vw)', // for medium screens
            lg: 'calc(100vw - 110vw)', // for large screens
            xl: 'calc(100vw - 110vw)', // for extra large screens
          },
          width:{
            xs: 'calc(100vw - 9vw)', // for extra small screens
            sm: 'calc(100vw - 6vw)', // for small screens
            md: 'calc(100vw - 25vw)', // for medium screens
            lg: 'calc(100vw - 25vw)', // for large screens
            xl: 'calc(100vw - 25vw)', // for extra large screens
          }
        }}>

          {/* this is for campers and volunteers */}
          { activeLink === 'Detailed View' && <SearchGrid/> }

          {/* this is for admins */}
          { activeLink === 'Assignments' && <DirectSearch/> }

           {/* this is for admins */}
           { activeLink === 'Privileges' && <AdminPrivileges/> }

          {/* this is for Devices */}
          { activeLink === 'Devices' && <DevicesTab/> }

          {/* this is for Making social connections */}
          { activeLink === 'Connect' && <SocialPage/> }

          {/* this is for Scheduling doctor appointments */}
          { activeLink === 'Appointments' && <Appointments/> }

          {/* this is for Scheduling doctor appointments */}
          { activeLink === 'Health Insights' && <AiSection/> }

        </Box>
      </Box>
    </Box>
  );
};