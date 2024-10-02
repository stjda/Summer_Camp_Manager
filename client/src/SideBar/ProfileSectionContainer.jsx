import React, { useEffect, useState }from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../util/Models/Stores";
import { DashboardNavigator } from './Dashboard'
import { useNavigate } from 'react-router-dom';
import { Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Avatar, 
  Input,   
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, styled } from '@mui/material';
import { AboutUser, Camps, 
  CareProfile, Volunteers,
  CareAndInsulin, 
  MedicationManager } from "./Profile";
import { CamperFormSelector, StaffFormSelector, ParticipationFormSelector } from './Forms'
import { ContactContainer } from "./Contact";
import { SlideOut } from "./index";
import Pica from 'pica';
import { UPDATE_PERSON, UPDATE_CAMPER_CARE_DATA } from "../util/gpl/mutations";
import { useMutation } from "@apollo/client";
import { EditProfileModal } from "./Modals";
import { handleApolloError } from "../util/gpl/handleApolloError";
import { ConfirmationForm, MedCheckInForm } from './Forms/FormManger'

const StyledCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const CardWrapper = ({ children }) => (
  <StyledCard elevation={3}>
    {children}
  </StyledCard>
);

export const ProfileContainer = observer(() => {

  const navigate = useNavigate();
  const { userProfileStore } = useStore();
  const [localImg, setLocalImg]=useState('');
  const [openModal, setOpenModal] = useState(false);
  const [imageBase64, setImageBase64] = useState(''); // sets up the banner image
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedForm, setSelectedForm] = useState('');
  const [wasConfirmed, setWasConfirmed] = useState(false);
  const [activeForm, setActiveForm] = useState(null)

  const ls_data = localStorage.getItem('STJDA_StoreSnapshot');  // grabbing the data snapshot from persistant storage
  const d = JSON.parse(ls_data);
  
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  // graphql hook
const [updatePerson, { loading: updatePersonLoading, error: updatePersonError, data: updatePersonData }] = useMutation(UPDATE_PERSON, {
  onCompleted: (data) => {
    if (data && data.updatePerson) {
     // sucess
     // dont run this if its a camper or there will be an async isse where careData doesnt get updated, 
     // this will be update when careData triggers the redirect for camper so it pointless to run this if its a camper anyways
      if(!parseLocalStorage('isCamper')){
        navigate('/edit/redirect');
      }

    }
  },
  onError: (error) => handleApolloError(error, 'fetching updatePerson - ProfileContainer')
})
  // graphql hook
const [updateCamperCareData, { loading: updateCareDataLoading, error: updateCareDataError, data: updateCareDataData }] = useMutation(UPDATE_CAMPER_CARE_DATA, {
  onCompleted: (data) => {
    if (data && data.updateCamperCareData) {
      console.log('updated data.updateCamperCareData', data.updateCamperCareData)
      // Handle successful update
      // redirect the page to update everything, do this purposfully after the first hook
      navigate('/edit/redirect');
    }
  },
  onError: (error) => handleApolloError(error, 'fetching updateCamperCareData - ProfileContainer')
})

useEffect(() => {
  console.log('Active Form:', activeForm);
}, [activeForm]);

useEffect(() => {
  if (!parseLocalStorage('banner') && imageBase64) {
    // case for new upload
    setImageBase64(parseLocalStorage('banner'));
  } else if (parseLocalStorage('banner') && imageBase64) {
    // case for updating an existing banner
    setImageBase64(parseLocalStorage('banner'));
  } else {
    setImageBase64(parseLocalStorage('banner'));
  }

  // cleanup the object used to setup the banner
  return () => {
    URL.revokeObjectURL(imageBase64);
   // Clear the timer if the component unmounts
  };
}, [imageBase64]); 

const handleUpdateUser = async (email='', photo='', banner='', notif=parseLocalStorage('notifications'), ph='', firstName='', lastName='') => {

  const updatedUserData = {
    _id: parseLocalStorage('id'),
    email: email,
    photo: photo,
    banner: banner,
    notifications: notif,
    phone: ph,
    firstName: firstName,
    lastName: lastName,
    isVolunteer: parseLocalStorage('isVolunteer')
  };
  const tempData = {
    firstName: firstName,
    lastName: lastName,
    isAdmin: parseLocalStorage('isAdmin')
  };
  console.log('updatedUserData: ', updatedUserData)
  // the reaason we have this for the name only is due to the way the typeDefs are defined as a union for the person object

  const tempDataString = JSON.stringify(tempData);
  localStorage.setItem('temp_shhhh', tempDataString);
  // call the graphql mutation here and pass the object
  await updatePerson({
    variables: updatedUserData
  });
}
const handleUpdateCareData = async (
  camperId='', // parseLocalStorage('id'),
  dataId='', // parseLocalStorage('id'),
  careType='', // careType, 
  cf='', // correctionFactor,
  mdi=false, // mdi,
  cgm='', // cgm,
  ip=false, // insulinPump,
  ipm='', // insulinPumpModel,
  dm='', // doctor,
  de='', // doctorEmail,
  dp='', // doctorPhone,
  aller='', // allergies,
  ec='', // emergencyContact,
  tbg='', // targetBG,
  it='', // null,
  itcr, // insulinCarbRatio,
  longActingI, // longActingInsulin,
  rapidActingI, // rapidActingInsulin,
  ) => { 
  const camperInput = {
    _id: camperId 
  };

  const updatedCareDataInput = {
    _id: dataId,
    careType: careType,
    correctionFactor: cf,
    mdi: mdi,
    cgm: cgm,
    insulinPump: ip,
    insulinPumpModel: ipm,
    doctorName: dm,
    doctorEmail: de,
    doctorPhone: dp,
    allergies: aller,
    emergencyContact: ec,
    insulinType: it,
    targetBG:{
      breakfast: parseInt(tbg.breakfast, 10),
      lunch: parseInt(tbg.lunch, 10),
      dinner: parseInt(tbg.dinner, 10),
    },
    insulinCarbRatio:{
      breakfast: itcr.breakfast || "",
      lunch: itcr.lunch || "",
      dinner: itcr.dinner || "",
    },
    longActingInsulin: longActingI,
    rapidActingInsulin: rapidActingI,
  };

  console.log('updatedCareDataInput' , updatedCareDataInput)

  await updateCamperCareData({
    variables: {
      camperInput: camperInput,
      careDataInput: updatedCareDataInput
    }
  });
}
// sets up the data to call save
const handleSaveProfile = async (personData, careData) => {
  console.log('handleSaveProfile', careData)
  const {name, email, notifications, emergencyContact, phone, photo} = personData
  const {allergies, careType, cgm, correctionFactor, doctor, doctorEmail, doctorPhone, insulinPump, insulinPumpModel, mdi, targetBG, insulinCarbRatio, longActingInsulin, rapidActingInsulin} = careData;

  try{
      // operate on the data here coming from the modal
      /////////////////////////////////////////////
      let nameArr = name.trim().split(" "); // split the string 'name' into first and last
      let fn = nameArr[0]
      let ln='';
      if(nameArr.length > 1){
        ln = nameArr[nameArr.length-1];
      }
      /////////////////////////////////////////////
      const updatedImg = localImg ? localImg : imageBase64 // set the image is it exists, or set the original

      // email='', photo='', banner='', notif=parseLocalStorage('notifications'), ph='', firstName='', lastName=''
      await handleUpdateUser(email, photo, updatedImg, notifications, phone, fn, ln)

      // only need to run this if its a camper
      // camperId='', dataId='', careType='', otcm='', lkbg='', lkts='', cf='', mdi, cgm='', ip=false, ipm='', dm='', de='', dp='', aller='', ec='', tbg='', it=''
      if(parseLocalStorage('isCamper')){
        await handleUpdateCareData(
          parseLocalStorage('id'), // camperId=''
          parseLocalStorage('id'), // dataId=''
          careType, // careType=''
          correctionFactor, // cf=''
          mdi, // mdi
          cgm, // cgm=''
          insulinPump, // ip=false
          insulinPumpModel, // ipm=''
          doctor, // dm=''
          doctorEmail, // de=''
          doctorPhone, // dp=''
          allergies, // aller=''
          emergencyContact, // ec=''
          targetBG, // tbg=''
          null, // it=''
          insulinCarbRatio, // itcr,   
          longActingInsulin, // longActingI,
          rapidActingInsulin, // rapidActingI,
        );
      }
  }catch(error){
    console.log(error)
  }
}

const handleFormSelect = (formType, formName) => {
  setSelectedForm(`${formType}:${formName}`);
};

const formPicker = () => {
  const currForm = selectedForm.split(':')[1];

  
  switch (currForm) {
    case 'Confirm Reservation':
      setActiveForm('ConfirmReservation');
      break;
    case 'Med-Check-in':
      setActiveForm('Med-Check-in');
      break;
    default:
      setActiveForm(null);
  }
}

const handleOpenModal = () => setOpenModal(true);

const handleCloseModal = () =>{ return false }

const handleCancelModal = () => { setWasConfirmed(false); setOpenModal(false) };

const handleClear = () => { setSelectedForm(''); };

const handleSectionChange = (section) => { userProfileStore.setSelectedSection(section); setSelectedForm('');};

  // Logic to save the changes, this is passed as a prop to the modal
const handleSave = (personData, careData) => {
  
  setHasChanges(true);

  if(!wasConfirmed){
    setOpenModal(true);
    return
  }

  if(!(personData && careData)){
    setOpenModal(true);
    return
  }
  
  setOpenModal(handleCloseModal())
  
  if(hasChanges && wasConfirmed){
    console.log('saving: pData', personData)
    console.log('saving: cData', careData)
    handleSaveProfile(personData, careData)
  }

};

const handleMedicationUpdate = (updatedMedications) => {
  // Handle the update, e.g., by sending to a server or updating local state
  console.log('Updated medications:', updatedMedications);
};

const handleLogout = () => {
  setLogoutDialogOpen(true);
};


const confirmLogout = () => {
  setLogoutDialogOpen(false);
  // Perform logout actions here
  navigate('/logout');
};

// convert banner image into base64 string
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  let MAX_WIDTH;
  let MAX_HEIGHT;
  if (file) {
    const img = new Image();
    img.onload = () => {
      const pica = new Pica();
      const canvas = document.createElement('canvas');
      
      MAX_WIDTH = 200;
      MAX_HEIGHT = 300;
  
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
        const base64 = result.toDataURL('image/jpeg', 0.8); // 0.8 is the quality
        const img = base64
        ? (base64 instanceof File ? URL.createObjectURL(base64) : base64)
        : "/default-profile-picture.jpg";
        setLocalImg(img) // set the ima ge locally and enable the save button
        
        setHasChanges(true)
      })
      .catch(err => {
        console.error('Pica error:', err);
        alert('Error processing image. Please try again.');
      });
    };
    img.src = URL.createObjectURL(file);
  }
};

const parseLocalStorage = (value) => {
    // console.log(d)
    switch (value) {
      case 'id':
        return d.id;
      case 'name':
        return d.name;
      // case 'notes':
      //   return d.careProfile.notes;
      case 'avatar':
        return d.avatar;
      case 'banner':
        return d.coverPhoto;
      case 'email':
        return d.aboutUser.email;
      case 'notifications':
        return d.aboutUser.notifications;
      case 'isCamper':
        return d.isCamper;
      case 'isVolunteer':
        return d.isVolunteer;
      case 'isAdmin':
        return d.isAdmin;
      case 'phone':
        return d.aboutUser.phoneNumber;
      case 'emergencyContact':
        return d.aboutUser.emergencyContact;
      case 'prescriptions':
        return d.careProfile.prescriptions;
      case 'campsCurrent':
        return d.camps[0];
      case 'careType':
        return d.careProfile.careType;
      case 'overTheCounterMeds':
        return d.careProfile.overTheCounterMeds;
      case 'correctionFactor':
        return d.careProfile.correctionFactor;
      case 'cgm':
        return d.careProfile.cgm;
      case 'insulinCarbRatio':
        return d.careProfile.insulinCarbRatio;
      case 'insulinPump':
        return d.careProfile.insulinPump;
      case 'insulinPumpModel':
        return d.careProfile.insulinPumpModel;
      case 'insulinType':
        return d.careProfile.insulinType;
      case 'doctor':
        // if (!d.careProfile.providers) return []; // Return an empty array if providers is undefined or empty
        return d.careProfile.providers
        .map(provider => ({ // Then map to get the needed details
          name: provider.providerName,
          email: provider.providerEmail,
          phone: provider.providerPhone,
          role: provider.role
        }));
        // .filter(provider => provider.role.trim().toLowerCase() === 'doctor') // Filter doctors first
      case 'targetBG':
        return d.careProfile.targetBG
      case 'insulinCarbRatio':
        return d.careProfile.insulinCarbRatio || "";
      case 'longActingInsulin':
        return d.careProfile.longActingInsulin;
      case 'rapidActingInsulin':
        return d.careProfile.rapidActingInsulin;
      case 'allergies':
        const aller = d.careProfile.allergies;
        for(let i = 0; i < aller.length; i++)
          return d.careProfile.allergies[i];
        break;
      case 'volunteerAssignments':
        return d.volunteerAssignments;
      case 'mdi':
        if (d.careProfile.mdi === 'true') return true;
        if (d.careProfile.mdi === 'false') return false;
        return d.careProfile.mdi || '';
      case 'campsPast':
        for(let i = 1; i < d.camps.length(); i++)
          return d.camps[i];
       default:
        break;
    }
  }

  return (
    <Box sx={{ backgroundColor: '#f7f7f8', width: '100vw', minHeight: '100vh', position: 'relative', overflowY: 'auto' }}>
      <Box>
        {userProfileStore.selectedSection === "MyCamper" ? (
          <DashboardNavigator />
        ) : (
          <Box sx={{ marginLeft: { xs: '0px', sm: '240px' } }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <Paper
                sx={{
                  // manages the banner image
                  height: { xs: 200, sm: 250, md: 300 },
                  mb: { xs: 4, sm: 6, md: 8 },
                  p: { xs: 2, sm: 3, md: 4 },
                  backgroundImage: `url(${localImg ? localImg : imageBase64})`,
                  // backgroundSize:'cover',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'repeat',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: { xs: 2, sm: 0 }, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', p: 2, borderRadius: '10px' }}>
                  <Avatar
                    sx={{ width: { xs: 80, sm: 120, md: 150 }, height: { xs: 80, sm: 120, md: 150 }, border: '3px solid gray', mr: 3 }}
                    src={d.avatar}
                    alt={d.name}
                  />
                  <Typography variant="h4" component="h1" sx={{ color: 'blue', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                    {d.name} {d.isAdmin && <Typography component="span" sx={{ color: 'red' }}>(Administrator)</Typography>}
                  </Typography>
                </Box>
                {userProfileStore.selectedSection === "Profile" && (
                  <label htmlFor="profile-image-upload">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="profile-image-upload"
                    />
                    <Button variant="contained" color="primary" component="span" sx={{ mt: { xs: 2, sm: 0 } }}>
                      Edit Cover Photo
                    </Button>
                  </label>
                )}
              </Paper>

              {userProfileStore.selectedSection === "Profile" && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="secondary" onClick={handleOpenModal}>
                      Edit Profile
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      disabled={!hasChanges}
                      sx={{ opacity: hasChanges ? 1 : 0.5 }}
                    >
                      Save
                    </Button>
                  </Box>
                  <Button variant="contained" color="error" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              )}

              {userProfileStore.selectedSection === "Contact" ? (
                <ContactContainer />
                // this handles the scenario where the sidebar changes, it stops displaying the form
              ) : (userProfileStore.selectedSection === "Forms" && activeForm === 'ConfirmReservation') ? <ConfirmationForm activeForm={setActiveForm}/> 
                : (userProfileStore.selectedSection === "Forms" && activeForm === 'Med-Check-in') ? <MedCheckInForm activeForm={setActiveForm}/> : (
                <Grid container spacing={4}>
                  {/* Left Column */}
                  <Grid item xs={12} md={4}>
                    <Grid container direction="column" spacing={4}>
                      {userProfileStore.selectedSection === "Profile" && (
                        <>
                          <Grid item><CardWrapper><AboutUser data={d.aboutUser} /></CardWrapper></Grid>
                          {d.isCamper && (
                            <>
                              <Grid item><CardWrapper><Camps data={d.camps} /></CardWrapper></Grid>
                              <Grid item>
                                <CardWrapper>
                                  <Volunteers
                                    camperName={d.name}
                                    volunteers={parseLocalStorage("volunteerAssignments")}
                                  />
                                </CardWrapper>
                              </Grid>
                            </>
                          )}
                        </>
                      )}
                  
                      {userProfileStore.selectedSection === "Forms" && !d.isCamper && (
                        <Grid item>
                          <CardWrapper>
                            <StaffFormSelector
                              selectedForm={selectedForm}
                              onFormSelect={handleFormSelect}
                              onClear={handleClear}
                            />
                          </CardWrapper>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>

                  {/* Middle Column */}
                  <Grid item xs={12} md={4}>
                    <Grid container direction="column" spacing={4}>
                      {userProfileStore.selectedSection === "Profile" && (
                        <>
                          {d.isCamper && (
                            <Grid item><CardWrapper><CareProfile data={d.careProfile} /></CardWrapper></Grid>
                          )}
                          {(d.isVolunteer && !d.isAdmin) && (
                            <Grid item>
                              <CardWrapper>
                                <Volunteers
                                  camperName={d.volunteerAssignments.map(a => a.name.replace(',', '')).join(', ')}
                                />
                              </CardWrapper>
                            </Grid>
                          )}
                          {d.isAdmin && (
                            <Grid item>
                              <CardWrapper>
                                <Volunteers
                                  camperName={d.isCamper ? d.camperNames : null}
                                  volunteers={!d.isCamper ? d.volunteerAssignments.volunteers : null}
                                />
                              </CardWrapper>
                            </Grid>
                          )}
                        </>
                      )}
                      {userProfileStore.selectedSection === "Forms" && !d.isCamper && (
                        <Grid item>
                          <CardWrapper>
                            <CamperFormSelector
                              selectedForm={selectedForm}
                              onFormSelect={handleFormSelect}
                              onClear={handleClear}
                              handleNext={formPicker}
                            />
                          </CardWrapper>
                        </Grid>
                      )}
                      {userProfileStore.selectedSection === "Forms" && !(d.isAdmin || d.isVolunteer) && (
                        <Grid item>
                          <CardWrapper>
                            <ParticipationFormSelector
                              selectedForm={selectedForm}
                              onFormSelect={handleFormSelect}
                              onClear={handleClear}
                            />
                          </CardWrapper>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                
                  {/* Right Column */}
                  <Grid item xs={12} md={4}>
                    <Grid container direction="column" spacing={4}>
                      {userProfileStore.selectedSection === "Profile" && d.isCamper && (
                        <>
                          <Grid item>
                            <CardWrapper>
                              <CareAndInsulin data={d.careProfile} />
                            </CardWrapper>
                          </Grid>
                          <Grid item>
                            <CardWrapper>
                              <MedicationManager
                                overTheCounterMeds={d.careProfile.overTheCounterMeds}
                                prescriptions={d.careProfile.prescriptions}
                                onUpdate={handleMedicationUpdate}
                              />
                            </CardWrapper>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Container>
          </Box>
        )}
      </Box>
      {/* this is the slide out that manages the components state */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: 'auto', height: '100vh', zIndex: 1000 }}>
        <SlideOut tabSelected={handleSectionChange} />
      </Box>

      <EditProfileModal
        openModal={openModal} 
        handleCloseModal={handleCloseModal} 
        hs={handleSave}
        parseLocalStorage={parseLocalStorage}
        handleCancelModal={handleCancelModal}
        wasConfirmed={wasConfirmed}
        setWasConfirmed={setWasConfirmed}
      />

      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmLogout} color="primary" autoFocus>Yes, Logout</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});