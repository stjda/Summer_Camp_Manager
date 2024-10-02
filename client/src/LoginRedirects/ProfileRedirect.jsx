import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import {jwtDecode} from 'jwt-decode';
import { useStore } from '../util/Models/Stores';
import { CircularProgress, Box, Typography, Button, Container, Paper, LinearProgress } from '@mui/material';
import { GET_CAMPER_BY_EMAIL, GET_VOLUNTEER_BY_EMAIL } from '../util/gpl/queries';
import icons from '../assets/iconRegistry';
import { handleApolloError } from '../util/gpl/handleApolloError';
/**
 * // This redirect manages the api calls for the user profile data
 * @returns JWT of user data
 * @returns STJDA cookies for managing user redirection
 * @returns loading screen
 * @returns error handling
 * @returns data for the client side reactive data model
 */

// this is the page Google OAuth redirects to, then we redirect the user from here
export const ProfileRedirect = () => {
    const loadingMessages = [
        "Polishing the inside of the screen...",
        "Warming up the CPU...",
        "Dusting off the pixels...",
        "Coordinating the electrons...",
        "Caffeinating the GPU..."
    ];
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [STJDA_No_User, setSTJDA_No_User] = useState(false);
    const { userProfileStore } = useStore();
    // call to graphql for the camper data
    const [getCamperByEmail, { data, loading: queryLoading, error }] = useLazyQuery(GET_CAMPER_BY_EMAIL, {
      fetchPolicy: 'no-cache',
        onCompleted: (data) => {
          if (data && data.camperByEmail) {
            // clear redis
            console.log("data.camperByEmail in the 1st redirect ", data.camperByEmail)

            userProfileStore.setId(data.camperByEmail._id);
            userProfileStore.setAllergies(data.camperByEmail.careData.allergies);
            userProfileStore.setAvatar(data.camperByEmail.photo);
            userProfileStore.setCoverPhoto(data.camperByEmail.banner);
            userProfileStore.setNotifications(data.camperByEmail.notifications);
            userProfileStore.setPhone(data.camperByEmail.phone);
            userProfileStore.setNotes(data.camperByEmail.notes);
            
            userProfileStore.setIsCamper(data.camperByEmail.__typename === 'Camper')
            userProfileStore.setAge(data.camperByEmail.originsData.age);
            userProfileStore.setDob(data.camperByEmail.originsData.dateOfBirth)
            userProfileStore.setFather(data.camperByEmail.originsData.father);
            userProfileStore.setMother(data.camperByEmail.originsData.mother);
            userProfileStore.setGender(data.camperByEmail.originsData.gender);
            
            userProfileStore.setCareType(data.camperByEmail.careData.careType);
            userProfileStore.setCgm(data.camperByEmail.careData.cgm);
            userProfileStore.setCorrectionFactor(data.camperByEmail.careData.correctionFactor);
            userProfileStore.setEmergencyContact(data.camperByEmail.careData.emergencyContact);
            //
            userProfileStore.setName(data.camperByEmail.originsData.firstName + ' ' + data.camperByEmail.originsData.lastName);
            // userProfileStore.addCurrentCamp(data.camperByEmail.camperCamps.campID); // TypeError: Cannot read properties of null (reading 'campID')

            //
            userProfileStore.setInsulinPump(data.camperByEmail.careData.insulinPump);
            userProfileStore.setInsulinPumpModel(data.camperByEmail.careData.insulinPumpModel)
            userProfileStore.setInsulinType(data.camperByEmail.careData.insulinType);
            userProfileStore.setMdi(data.camperByEmail.careData.mdi);
            
            // targetBG
            if(data.camperByEmail.careData.targetBG.breakfast != null){
              userProfileStore.setTargetBGBreakfast(data.camperByEmail.careData.targetBG.breakfast); 
            }
            if(data.camperByEmail.careData.targetBG.lunch != null){
              userProfileStore.setTargetBGLunch(data.camperByEmail.careData.targetBG.lunch); 
            }
            if(data.camperByEmail.careData.targetBG.dinner != null){
              userProfileStore.setTargetBGDinner(data.camperByEmail.careData.targetBG.dinner); 
            }
            // insulinCarbRatio
            if(data.camperByEmail.careData.insulinCarbRatio.breakfast != null){
              userProfileStore.setInsulinToCarbRatioBreakfast(data.camperByEmail.careData.insulinCarbRatio.breakfast);
            }
            if(data.camperByEmail.careData.insulinCarbRatio.lunch != null){
              userProfileStore.setInsulinToCarbRatioLunch(data.camperByEmail.careData.insulinCarbRatio.lunch);
            }
            if(data.camperByEmail.careData.insulinCarbRatio.dinner != null){
              userProfileStore.setInsulinToCarbRatioDinner(data.camperByEmail.careData.insulinCarbRatio.dinner);
            }

            if (data.camperByEmail && 
              data.camperByEmail.volunteerAssignments && 
              Array.isArray(data.camperByEmail.volunteerAssignments.volunteer) &&
              Array.isArray(data.camperByEmail.volunteerAssignments.volunteerType)) {

                for(let i = 0; i < data.camperByEmail.volunteerAssignments.volunteer.length; i++){
                  userProfileStore.addVolunteerAssignment(data.camperByEmail.volunteerAssignments.volunteer[i], data.camperByEmail.volunteerAssignments.volunteerType[i])
                }
            } else {
              // Handle the case where volunteer is not an array
              console.warn('No volunteer assignments found for this camper');
            }

              // Handle meal readings
            if (data.camperByEmail.careData && Array.isArray(data.camperByEmail.careData.mealReadings)) {
              data.camperByEmail.careData.mealReadings.forEach(reading => {
                const {camperID, care_id, timeLabel, unixTime, carbAmount, glucoseLevel, meal, imageIdentifier } = reading;
                userProfileStore.setBloodGlucoseRecord(
                  timeLabel ?? '',
                  unixTime ?? 0,
                  carbAmount ?? 0,
                  glucoseLevel ?? 0,
                  meal ?? '',
                  imageIdentifier ?? '',
                  camperID, 
                  care_id,
                );
              });
            } else {
              console.warn('No meal readings found for this camper');
            }

              // Handle LONG acting insulin
              if (data.camperByEmail.careData && Array.isArray(data.camperByEmail.careData.longActingInsulin)) {
                data.camperByEmail.careData.longActingInsulin.forEach(insulin => {
                  userProfileStore.setLongActingInsulin(insulin);
                });
              } else {
                console.warn('No long acting insulin data found for this camper');
              }

              // Handle RAPID acting insulin
              if (data.camperByEmail.careData && Array.isArray(data.camperByEmail.careData.rapidActingInsulin)) {
                data.camperByEmail.careData.rapidActingInsulin.forEach(insulin => {
                  userProfileStore.setRapidActingInsulin(insulin);
                });
              } else {
                console.warn('No rapid acting insulin data found for this camper');
              }
              // Handle providers
            if (data.camperByEmail.careData && Array.isArray(data.camperByEmail.careData.providers)) {
              data.camperByEmail.careData.providers.forEach(provider => {
                const { role, providerName, providerEmail, providerPhone } = provider;
                userProfileStore.setProvider(role, providerName, providerEmail, providerPhone);
              });
            } else {
              console.warn('No provider data found for this camper');
            }

             // Handle prescriptions
            if (data.camperByEmail.careData && Array.isArray(data.camperByEmail.careData.prescriptions)) {
              data.camperByEmail.careData.prescriptions.forEach(prescription => {
                const {camperID, care_id, medicationName, genericName, form, dosage, frequency, refills, prescribedFor, sideEffects, interactions, prescriptionDate, instructions } = prescription;
                
                // Split the medicineName string into an array of individual medication names
                const medicineNames = medicationName 
                  ? (typeof medicationName === 'string' && medicationName.includes(',') 
                    ? medicationName.split(',').map(name => name.trim()).filter(Boolean)
                    : [medicationName.toString().trim()].filter(Boolean))
                  : [];
                  
                if (medicineNames.length === 0) {
                  console.warn('No valid medicine name provided for a prescription');
                  return; // Skip this iteration if no valid names
                }

                // Create a prescription entry for each medicine name
                medicineNames.forEach(name => {
                  userProfileStore.setPrescription(
                    name,  // Use the individual medicine name
                    genericName,
                    form,
                    dosage,
                    frequency,
                    refills,
                    prescribedFor,
                    sideEffects,
                    interactions,
                    prescriptionDate,
                    instructions,
                    camperID, 
                    care_id,
                  );
                });
              });
            } else {
              console.warn('No prescription data found for this camper');
            }
              // Handle over-the-counter medications
            if (data.camperByEmail.careData && Array.isArray(data.camperByEmail.careData.overTheCounterMedications)) {
              data.camperByEmail.careData.overTheCounterMedications.forEach(medication => {
                const {camperID, care_id, medicationName, activeIngredients, dosageAdult, dosageChild, instructions, sideEffects, warnings, createdBy } = medication;
                 
                // Safely handle medicationName, even if it's undefined or null
                const medicationNames = medicationName 
                  ? (typeof medicationName === 'string' && medicationName.includes(',') 
                     ? medicationName.split(',').map(name => name.trim()).filter(Boolean)
                     : [medicationName.toString().trim()].filter(Boolean))
                  : [];
            
                if (medicationNames.length === 0) {
                  console.warn('No valid medication name provided for an over-the-counter medication');
                  return; // Skip this iteration if no valid names
                }
            
                medicationNames.forEach(name => {
                  userProfileStore.setOverTheCounterMedication(
                    name,  // Use the individual medication name
                    activeIngredients,
                    dosageAdult,
                    dosageChild,
                    instructions,
                    sideEffects,
                    warnings,
                    createdBy,
                    camperID, 
                    care_id
                  );
                });
              });
            } else {
              console.warn('No over-the-counter medication data found for this camper');
            }

            // Handle special needs
            if (data.camperByEmail.careData && data.camperByEmail.careData.specialNeed) {
              const { specialNeedType, specialNeedInstructions, notes } = data.camperByEmail.careData.specialNeed;
              
              // Split the specialNeedType string into an array of individual special need types
              const specialNeedTypes = specialNeedType 
                ? (typeof specialNeedType === 'string' && specialNeedType.includes(',') 
                  ? specialNeedType.split(',').map(type => type.trim()).filter(Boolean)
                  : [specialNeedType.toString().trim()].filter(Boolean))
                : [];
                
              if (specialNeedTypes.length === 0) {
                console.warn('No valid special need type provided:', data.camperByEmail.careData.specialNeed);
              } else {
                // Create a special need entry for each type
                specialNeedTypes.forEach(type => {
                  userProfileStore.setSpecialNeeds(
                    type,  // Use the individual special need type
                    specialNeedInstructions || null,
                    notes || null
                  );
                });
              }
            } else {
              console.warn('No special needs data found for this camper');
            }

              // Handle medical notes
            if (data.camperByEmail.careData && Array.isArray(data.camperByEmail.careData.medicalNotes)) {
              data.camperByEmail.careData.medicalNotes.forEach(note => {
                const {camperID, care_id, noteType, Content, injury, createdBy, updatedBy } = note;
                userProfileStore.setMedicalNote(camperID, care_id, noteType, Content, injury, createdBy, updatedBy);
              });
            } else {
              console.warn('No medical notes found for this camper');
            }

            if(localStorage.getItem("STJDA_StoreSnapshot")){
                localStorage.removeItem("STJDA_StoreSnapshot");
            }
            userProfileStore.saveToLocalStorage();

            userProfileStore.debugState();
          }
          // update the server cache
          cacheUsersData(userProfileStore.getEmail())
            .then(data => {
              console.log("Successfully cached user data:", data);
            })
            .catch(error => {
              console.error("Failed to cache user data:", error);
            });
        },
        onError: (error) => handleApolloError(error, 'fetching getCamperByEmail - Profile Redirect')
      });
      // call to graphql for the volunteer data
    const [getVolunteerByEmail, { d, loading: lding, err }] = useLazyQuery(GET_VOLUNTEER_BY_EMAIL,{
      fetchPolicy: 'no-cache',
        onCompleted: (d) => {
          if (d && d.volunteerByEmail) {
            console.log("d.volunteerByEmail ",d.volunteerByEmail)
            if (d.volunteerByEmail.volunteerType === "Admin") {
              // do something for admin
              console.log("inside profile redirect and we have the admin")
                userProfileStore.setId(d.volunteerByEmail._id);
                userProfileStore.setName(d.volunteerByEmail.firstName + ' ' + d.volunteerByEmail.lastName);
                userProfileStore.setAvatar(d.volunteerByEmail.photo);
                userProfileStore.setCoverPhoto(d.volunteerByEmail.banner);
                userProfileStore.setNotifications(d.volunteerByEmail.notifications);
                userProfileStore.setPhone(d.volunteerByEmail.phone);
                userProfileStore.setVolunteerType(d.volunteerByEmail.VolunteerType);
                userProfileStore.setIsVolunteer(false);
                userProfileStore.setIsAdmin(true)

                if(localStorage.getItem("STJDA_StoreSnapshot")){
                  localStorage.removeItem("STJDA_StoreSnapshot");
              }

            } else {
              // do something for volunteer non-admin
              console.log("not admin")
                userProfileStore.setId(d.volunteerByEmail._id);
                userProfileStore.setName(d.volunteerByEmail.firstName + ' ' + d.volunteerByEmail.lastName);
                userProfileStore.setAvatar(d.volunteerByEmail.photo);
                userProfileStore.setCoverPhoto(d.volunteerByEmail.banner);
                userProfileStore.setNotifications(d.volunteerByEmail.notifications);
                userProfileStore.setPhone(d.volunteerByEmail.phone);
                userProfileStore.setVolunteerType(d.volunteerByEmail.VolunteerType);
                if(localStorage.getItem("STJDA_StoreSnapshot")){
                    localStorage.removeItem("STJDA_StoreSnapshot");
                }

            if (Array.isArray(d.volunteerByEmail.volunteerAssignments.camper)) {
                for(let i = 0; i < d.volunteerByEmail.volunteerAssignments.camper.length; i++){
                  userProfileStore.addVolunteerAssignment(d.volunteerByEmail.volunteerAssignments.camper[i], "Camper")
                }
            } else {
              // Handle the case where volunteer is not an array
              console.error('Expected an array of names, received something else inside profile redirect, getVolunteerByEmail.');
            }
            }
            userProfileStore.saveToLocalStorage();
            userProfileStore.debugState();

            // update the server cache
            cacheUsersData(userProfileStore.getEmail())
              .then(data => {
                console.log("Successfully cached user data:", data);
              })
              .catch(error => {
                console.error("Failed to cache user data:", error);
              });
          }
        },
        onError: (error) => handleApolloError(error, 'fetching getVolunteerByEmail - Profile Redirect')
      });
    /////////////end graphql hooks
    useEffect(() => {
        let timer;
        if (document.cookie.split(';').some((item) => item.trim().startsWith('STJDA_No_User'))) {
            setSTJDA_No_User(true);
            setLoading(false);
            
        } 
        else if(document.cookie.split(';').some((item) => item.trim().startsWith('STJDA_volunteer'))) {
            // set the data model to isVolunteer true
            userProfileStore.setIsVolunteer(true);
            // set a session in the data model

        }
        else if(document.cookie.split(';').some((item) => item.trim().startsWith('STJDA_camper'))){
            // set the data model to isCamper true
            userProfileStore.setIsCamper(true);
            // set the session in the data model

        }else{
          setSTJDA_No_User(true);
          setLoading(false);
        }

        startLoading();
        
        timer = setTimeout(() => {
            setLoading(false);
        }, 10500);
        fetchData();

        return () => clearTimeout(timer);

    }, [navigate]);

    useEffect(() => {
        let timer;
        if (loading && progress < 100) {
          timer = setInterval(() => {
            setProgress((prevProgress) => {
              const newProgress = prevProgress + 1.05;
              return newProgress > 100 ? 100 : newProgress;
            });
            
            // Update message every 20% progress
            if (progress % 20 === 0) {
              setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
            }
          }, 100);
        }
        return () => {
          clearInterval(timer);
        };
      }, [loading, progress]);

    const startLoading = () => {
        setProgress(0);
    };

    const fetchData = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/auth/credentials", {
                method: "GET",
                credentials: 'include',  // this is sending the cookies to the backend for authentication
                headers: {
                    'Content-Type': 'application/json'
                  },
                }).catch(error => {
                    console.error("Fetch error:", error);
                    throw error;
                });
                                
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            if (data){
                // Remove anything in local storage called 'STJDA'
                localStorage.removeItem('STJDA');
                // refresh the token
                localStorage.setItem("STJDA", data);
                const decodedToken = jwtDecode(data);
                if (decodedToken) {
                    // parse out the parts of the token 
                    userProfileStore.setIsLoggedIn(true);
                    // set email here for queries
                    userProfileStore.setEmail(decodedToken.email || decodedToken.Email);

                    console.log("decoded token", decodedToken)

                    userProfileStore.setSessionsExpiry(decodedToken.exp);
                    const email = userProfileStore.getEmail();
                    
                    if(userProfileStore.getisVolunteer()){
                        // calling graphql
                        getVolunteerByEmail({ variables: { email } });
                        
                    }else if(userProfileStore.getIsCamper()){
                        // calling graphql
                        getCamperByEmail({ variables: { email } });
                    }
                }
            } else {
                console.error("No token found in the response");
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    const cacheUsersData = async (email) => {
      // Clearing the cache: 
      // If the value in the request body is explicitly set to null, it will delete the key from Redis.
      // Updating the cache: If a value is provided, it will set or update the key in Redis with the new value.
      // Error handling: If value is undefined (not provided in the request), it will return a 400 error.
      try {

        const key = email
        const localStorageData = JSON.parse(localStorage.getItem('STJDA_StoreSnapshot'));
    
        if (!localStorageData) {
          throw new Error("No user data found in local storage");
        }
    
        // First, clear existing data (if any) by setting it to null
        const clearResponse = await fetch(`http://localhost:3000/api/redis/cache/${key}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value: null })
        });
    
        if (!clearResponse.ok) {
          throw new Error(`HTTP error while clearing cache! status: ${clearResponse.status}`);
        }
    
        // Now, set the new data
        const setResponse = await fetch(`http://localhost:3000/api/redis/cache/${key}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            value: localStorageData,
            expirationInSeconds: 3600 // Set expiration to 1 hour, adjust as needed
          })
        });
    
        if (!setResponse.ok) {
          throw new Error(`HTTP error while setting cache! status: ${setResponse.status}`);
        }
    
        const result = await setResponse.json();
        console.log("Cache set result:", result);
    
        return localStorageData; // Return the data that was just cached
    
      } catch (error) {
        console.error("Error caching user data:", error);
        throw error;
      }
    };


if(STJDA_No_User){
    return(
        <Container component="main" maxWidth="sm" sx={{
            backgroundImage: 'url("https://u-static.fotor.com/images/text-to-image/result/PRO-0fe755d158e34321a14f8f231abd8368.jpg")',
            backgroundSize: 'cover',  
            backgroundRepeat: 'no-repeat',  
            backgroundPosition: 'center',  
            height: '100vh',  
            display: 'flex',
            alignItems: 'center',  
            justifyContent: 'center',
            borderRadius: '1rem'
          }}>
        <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
        <Box style={{ textAlign: 'center' }}>  {/* Centering the text and progress circle */}
            <Typography variant="h6" gutterBottom>
                It looks like you don't have an account using those credentials...
            </Typography>
        </Box>
        <Box style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>  {/* Button row */}
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => {
                    navigate('/')
                    if (document.cookie.split(';').some((item) => item.trim().startsWith('STJDA_No_User'))) {
                        document.cookie = "STJDA_No_User=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        setSTJDA_No_User(false)
                    }
                }}
                sx={{ margin: 1, fontSize: '1rem' }} 
            > Go to Home
            </Button>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => {
                    navigate('/')
                    /// set the cookie as expired and redirect to login
                    if (document.cookie.split(';').some((item) => item.trim().startsWith('STJDA_No_User'))) {
                        document.cookie = "STJDA_No_User=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        setSTJDA_No_User(false)
                    }
                }} 
                sx={{ margin: 1, fontSize: '1rem' }}  
            >
                Create an account
            </Button>  
        </Box>
    </Paper>
    </Box>
    </Container>
    )
}
if (loading) {
    return (
        <>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <Box
        m={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
          backgroundSize: '400% 400%',
          animation: 'gradient 12s ease infinite'
        }}
      >
         <Box
                    component="img"
                    src={icons.logo}
                    alt="Logo"
                    sx={{
                        width: '150px',  // Adjust size as needed
                        height: 'auto',
                        marginBottom: 3  // Add some space between logo and text
                    }}
                />
        <Typography variant="h6" gutterBottom>Redirecting to your profile...</Typography>
        <Box sx={{ width: '300px', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {loadingMessages[messageIndex]}
        </Typography>
        <CircularProgress />
      </Box>
    </>
        );
    }else{

        navigate('/profile/authenticated');  // This redirects to the authenticated route after 10.5 seconds

    }
    
};