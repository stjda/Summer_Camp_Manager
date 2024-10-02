import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import icons from '../assets/iconRegistry';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useStore } from "../util/Models/Stores";
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import Switch from '@mui/material/Switch';
import LockIcon from '@mui/icons-material/Lock';
import { UpgradeModal } from "./Modals";


export const SlideOut = ({ tabSelected }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selected, setSelected] = useState(0);
  const [isAIOn, setIsAIOn] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const { userProfileStore } = useStore();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const chatWindowRef = useRef(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  // variable for subscription status
  const [hasAIAccess, setHasAIAccess] = useState(false);

  // Simulating checking the user's subscription status
  useEffect(() => {
    // Replace this with your actual subscription check logic
    const checkSubscription = async () => {
      // Simulated API call
      const response = await new Promise(resolve => setTimeout(() => resolve({ hasAccess: true }), 1000));
      setHasAIAccess(response.hasAccess);
    };
    checkSubscription();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target) && !event.target.closest('.ai-toggle')) {
        // (chatWindowRef.current && !chatWindowRef.current.contains(event.target) && !event.target.closest('.ai-toggle'))
        setIsAIOn(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    
    const handleResize = () => {
      if (window.innerWidth <= 605) {
        setIsSidebarOpen(false);
        setWindowWidth(window.innerWidth);
      }
    };

    // Call handleResize initially
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    tabSelected('Profile')
  }, []);

  const handleOpenUpgradeModal = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleCloseUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAI = () => {
    if (hasAIAccess) {
      setIsAIOn(!isAIOn);
    } else {
      // Optionally, you can show a modal or notification here
      console.log("Upgrade required to access AI features");
    }
  };

  const handleChatSubmit = () => {
    if (chatInput.trim() && hasAIAccess) {
      setChatMessages([...chatMessages, { type: 'user', content: chatInput }]);
      // Here you would typically send the message to your AI service
      // and then add the AI's response to the chatMessages
      setChatInput("");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && hasAIAccess) {
      // Here you would typically handle the image upload
      // For now, we'll just add a placeholder message
      setChatMessages([...chatMessages, { type: 'user', content: `Uploaded image: ${file.name}` }]);
    }
  };

  const handleUpgradeClick = () => {
    // Implement your upgrade logic here
    console.log("User clicked upgrade button");
  };
  

  const handleTabSelection = (int) => {
    switch (int) {
      case 0:
        setSelected(0);
        tabSelected('Profile')
        break;
      case 1:
        setSelected(1);
        tabSelected('Forms')
        break;
      case 2:
        setSelected(2);
        tabSelected('MyCamper')
        break;
      case 3:
        setSelected(3);
        tabSelected('Contact')
        break;
      default:
        setSelected(0); // Set to 0 by default to maintain the Profile as dark 
        break;
    }
  }

  return (
    <>
        <Box className="overlap" sx={{
          height: '100vh',
          position: 'relative',
          width: isSidebarOpen ? '225px' : '50px',
          transition: 'width 0.3s ease-in-out',
          zIndex:'10'
        }}>
          <Box className="menu" sx={{
            height: '100%',
            position: 'absolute',
            top: 0,
            width: '100%',
            zIndex:'10'
          }}>
            <Box sx={{ position: 'relative', zIndex:'4'}}>
              <Box className="BG" sx={{
                backgroundColor: '#1479cc',
                height: '100vh',
                position: 'absolute',
                top: 0,
                width: isSidebarOpen ? '218px' : '50px',
                transition: 'width 0.3s ease-in-out',
                zIndex:'9'
              }} />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: '20px',
                  right: '-25px',
                  backgroundColor: '#1479cc',
                  color: 'white',
                  borderRadius: '50%',
                  zIndex: 1,
                  transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out',
                  zIndex:'10'
                }}
                onClick={toggleSidebar}
              >
                <ChevronRightIcon />
              </IconButton>
              {isSidebarOpen && (
                <>
                  <Box className="logo" sx={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100px',
                    height: '100px',
                    backgroundImage: `url(${icons.logo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex:'10'
                  }} />
                  <Box className="menu-name" sx={{ position: 'absolute', top: '234px', width: '169px', zIndex:'10' }}>
                    <Button
                    onClick={() => handleTabSelection(2)}
                      sx={{
                        position: 'absolute',
                        top: '45px',
                        transform: 'translateX(10%)',
                        scale: '1.25',
                        width: '129px',
                        padding: 0,
                        minWidth: 'unset',
                        // left: -10,
                      }}
                    >
                      <img alt="My Camper" src={selected == 2 ? icons.myCamperDark : icons.myCamperLight} style={{ width: '100%' }} />
                    </Button>
                    <Button
                    onClick={() => handleTabSelection(1)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        width: '129px',
                        padding: 0,
                        
                        minWidth: 'unset',
                      }}
                    >
                      <img alt="Forms" src={selected == 1 ? icons.formsDark : icons.formsLight} style={{ width: '100%' }} />
                    </Button>
                  </Box>
                  {/* Contact Button */}
                {userProfileStore.isAdmin === false && <Button
                  onClick={() => handleTabSelection(3)}
                    sx={{
                      position: 'absolute',
                      top: '328px',
                      width: '107px',
                      padding: 0,
                      minWidth: 'unset',
                      zIndex:'10',
                    }}
                  >
                    <img alt="Contact" src={selected == 3 ? icons.contactDark : icons.contactLight} style={{ width: '100%' }} />
                  </Button>
                }
                  
                  <Button
                  onClick={() => handleTabSelection(0)}
                    sx={{
                      transform: 'translateX(-5%)',
                      position: 'absolute',
                      top: '195px',
                      width: '134px',
                      padding: 0,
                      minWidth: 'unset',
                      zIndex:'10'
                    }}
                  >
                    <img alt="Profile" src={selected == 0 ? icons.profileDark : icons.profileLight} style={{ width: '100%' }} />
                  </Button>
                </>
              )}
            </Box>
          </Box>
          {/* Profile Button at the bottom */}
          {/* AI Chat Toggle and Window */}
        {isSidebarOpen && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '20px',
              left: '10px',
              right: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px',
              zIndex: 11
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
            {hasAIAccess ? (
              <>
                <Switch
                  checked={isAIOn}
                  onChange={toggleAI}
                  color="primary"
                  className="ai-toggle"
                />
                <Typography variant="subtitle2" sx={{ color: 'white', flex: 1, marginLeft: '10px' }}>
                  AI Assistant
                </Typography>
              </>
            ) : (
              <>
                <LockIcon 
                  sx={{ color: 'white', marginRight: '10px', cursor: 'pointer' }} 
                  onClick={handleOpenUpgradeModal}
                />
                <Typography variant="subtitle2" sx={{ color: 'white', flex: 1 }}>
                  Upgrade to Unlock
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenUpgradeModal}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'white',
                    },
                  }}
                >
                  Unlock
                </Button>
              </>
            )}
            </Box>
            
            <motion.div
                ref={chatWindowRef}
                initial={{ height: 0, width: '100%' }}
                animate={{ 
                  height: isAIOn ? 'auto' : 0,
                  width: isAIOn ? '100vw' : '100%', // Use viewport width
                  maxWidth: '400px', // Add max-width
                }}
              transition={{ duration: 0.3 }}
              style={{ 
                overflow: 'hidden',
                position: 'absolute',
                left: 0,
                bottom: '100%',
                backgroundColor: 'rgba(20, 121, 204, 0.9)', // Matching the sidebar color
                borderRadius: '8px 8px 0 0',
                boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box sx={{ 
                height: '360px', // Increased by 30% from 200px
                overflowY: 'auto', 
                marginBottom: '10px', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '4px', 
                padding: '10px',
                margin: '10px'
              }}>
                {chatMessages.map((msg, index) => (
                  <Typography key={index} variant="body2" sx={{ color: msg.type === 'user' ? 'white' : '#90caf9', marginBottom: '5px' }}>
                    {msg.type === 'user' ? 'You: ' : 'AI: '}{msg.content}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', padding: '0 10px 10px 10px' }}>
                <TextField
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    input: { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                  }}
                  placeholder="Type a message..."
                />
                <IconButton onClick={handleChatSubmit} sx={{ color: 'white', marginLeft: '5px' }}>
                  <SendIcon />
                </IconButton>
                <IconButton component="label" sx={{ color: 'white' }}>
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  <ImageIcon />
                </IconButton>
              </Box>
            </motion.div>
          </Box>
        )}
      </Box>
       {/* Upgrade Modal */}
       <UpgradeModal open={isUpgradeModalOpen} onClose={handleCloseUpgradeModal} />
    </>
  );
};