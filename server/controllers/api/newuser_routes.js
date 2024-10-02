const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../../models');
const { config } = require('dotenv');
const crypto = require('crypto');
const emailjs = require('@emailjs/nodejs');
const { update } = require('../../models/BGTargets');
const { isAdmin } = require('../../utils/admins/validateAdmins');
config({ path: './.env' });

/**
 * Express router providing user signup related routes
 * @module routers/signup
 * @requires express
 * @requires jsonwebtoken
 * @requires crypto
 * @requires @emailjs/nodejs
 */

// JWT setup
const jwtSecret = 'mysecretsshhhhh';
const jwtExpiration = '2h';

const jwtEmailSecret = 'mysecretsshhhhh';
const jwtEmailExpiration = '14d';

/**
 * Send validation email to new user
 * @name POST/api/signup/send-email
 * @function
 * @memberof module:routers/signup
 * @inner
 * @param {string} req.body.newAccountEmail - Email address of the new user
 * @returns {Object} JSON object with message and status
 */
router.post('/send-email', async (req, res) => {
    try {
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/;
        const { newAccountEmail, key } = req.body;
        
        if (!emailPattern.test(newAccountEmail)) {
            return res.status(400).json({ error: "The email address provided was invalid." });
        }

        if(!key){
            return res.status(400).json({ error: "No key provided." });
        }
        console.log("computing checksum on: ", req.body)

        // grab the checksome
        const checksum = key;

         // Generate JWT
         const token = jwt.sign({ checksum }, jwtEmailSecret, { expiresIn: jwtEmailExpiration });

        // Construct validation link
        const validationLink = `http://localhost:5173/validate?${token}`;

        const templateParams = {
            setup_link: validationLink,
            name: req.body.legalGuardian,
            to_email: newAccountEmail,
            subject: 'Complete Your STJDA Camp Registration - Account Setup Required',
            from: "STJDA Camp Registration",
            from_email: "no-reply@stjda.org"
        };

        console.log('EMAILJS_PUBLIC:', process.env.EMAILJS_PUBLIC);

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE, 
            process.env.EMAILJS_TEMPLATE, 
            templateParams, 
            {
                publicKey: process.env.EMAILJS_PUBLIC,
                privateKey: process.env.EMAILJS_PRIVATE,
            }
        );

        console.log('SUCCESS!', response.status, response.text);
        return res.json({ message: "Email sent successfully.", status: 200, emailStatus: response.status});
    } catch (err) {
        console.error('FAILED...', err);
        return res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
});

/**
 * Validate user token
 * @name GET/api/signup/validate/:token
 * @function
 * @memberof module:routers/signup
 * @inner
 * @param {string} req.params.token - JWT token to validate
 * @returns {Object} JSON object with validation status and message
 */
router.get('/validate/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ error: "Token is missing" });
        }

        // Verify the token
        const decoded = jwt.verify(token, jwtEmailSecret);

        // Check if the token is expired (14 days from issuance)
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const sevenDaysInSeconds = 14 * 24 * 60 * 60; // 14 days in seconds

        if (currentTime > decoded.iat + sevenDaysInSeconds) {
            return res.status(401).json({ error: "Token has expired" });
        }
        console.log("decoded", decoded)
        const { checksum } = decoded

        if (!checksum) {
            return res.status(400).json({ error: "Invalid token" });
        }
        console.log("checksum: ",checksum)
        // Check if the data exists in the database
        const bucketName = 'stjda-signup-forms';
         const dbResponse = await fetch(`http://34.135.9.49:3000/api/minioG/checkObjectKey/${bucketName}/${checksum}`);
         
         if (!dbResponse.ok) {
             throw new Error(`Database request failed with status ${dbResponse.status}`);
         }
 
         const dbData = await dbResponse.json();

         if (dbData.exists) {
             console.log("dbData ",dbData)
             // Data exists, user is legitimate
             return res.json({ 
                 valid: true, 
                 key: checksum,
                 message: "Token validated successfully and user data found."
             });
         } else {
             // Data doesn't exist
             return res.status(404).json({ 
                 valid: false, 
                 error: "User data not found in the database."
             });
         }
 
     } catch (err) {
         console.error('Token validation failed:', err);
         return res.status(500).json({ 
             valid: false, 
             error: 'Token validation failed', 
             details: err.message 
         });
     }
 });

/**
 * Create new user account
 * @name POST/api/signup/create
 * @function
 * @memberof module:routers/signup
 * @inner
 * @param {Object} req.body - User data
 * @param {string} req.body.role - User role (volunteer or camper)
 * @returns {Object} JSON object with user data and JWT token
 */
// we made it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!:  {
//     selectedCamps: 'Robotics Camp, Science Camp',
//     age: 37,
//     email: 'guy@beals.com',
//     guardianName: 'taylor swift',
//     consent: true,
//     registrationFormData: {
//       submissionDate: '2024-08-25',
//       firstName: 'Guy',
//       middleName: '',
//       lastName: 'Beals',
//       contactPhone: '234-567-8901',
//       sessions: [ 'session3' ],
//       tShirtSize: 'S',
//       birthDate: '1986-10-13',
//       gender: 'male',
//       diagnosisDate: '2024-08-04',
//       allergies: 'No',
//       primaryCarePhysician: 'Donna',
//       officePhoneNumber: '1234567899',
//       diabetesPhysician: 'larry T.',
//       insulinType: 'qwerty5',
//       parent1FirstName: 'Taylor',
//       parent1LastName: 'Swift',
//       parent1Mobile: '321-456-7890',
//       parent1Email: 'taylor@swift.com',
//       parent2FirstName: 'Kim',
//       parent2LastName: 'Kardashian',
//       parent2Mobile: '888-999-0000',
//       specialInstructions: 'They like kool-aid before bed',
//       preferredRoommate: 'Jerry Hanel',
//       preferredLanguage: 'spanglish',
//       'medications.ibuprofen': false,
//       'medications.tylenol': false,
//       'medications.benadryl': false,
//       isMDI: true,
//       pumpModelBrand: 'pupm123',
//       isCGM: true,
//       cgmModelBrand: 'Dexcom 7',
//       carbsBreakfast: '56',
//       carbsLunch: '78',
//       carbsDinner: '90',
//       mealtimeRestrictions: 'No soda before breakfast',
//       insulinToCarbRatio: '1:5',
//       correctionFactor: '34',
//       target: '99',
//       mdiInsulinType: 'qwerty5',
//       otherDiagnosis: 'Hashimoto, aspurgers',
//       otcMedications: 'nyquil',
//       otherPrescriptions: 'penicilin',
//       insulinFor15gSnack: true,
//       correctWith15gOrLess: true,
//       hyperglycemiaSymptoms: 'insomnia',
//       hyperglycemiaTreatment: 'sleep',
//       hypoglycemiaSymptoms: 'sleepiness',
//       hypoglycemiaTreatment: 'excercise',
//       diabetesManagementStruggles: 'Confidence',
//       glucoseSensitiveFoods: 'Rice, Corn',
//       rapidActingInsulinType: 'qwerty5',
//       longActingInsulinType: 'qwerty6',
//       isCompleted: true,
//       role: 'camper',
//       document: null,
//       signature: 'Guy Beals'
//     },
//     password: 'Colorado1!',
//     firstName: 'Guy',
//     lastName: 'Beals',
//     role: 'camper',
//     countryCode: '+1 🇺🇸',
//     dateOfBirth: '1991-10-13',
//     notifications: true,
//     phone: '3034958899',
//     profileImage: 'data:image/jpeg;base64,/9j...}
router.post('/create', async (req,res)=>{
    let userData;
    let originsData;
    let careData;
    let specialNeed;
    let insulinCarbRatio;
    let overTheCounterMedication;
    let prescriptions;
    let medicalNotes;
    
    console.log("we made it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!: ", req.body)
    res.status(200).json({ message: "request recieve.", success: true })
    return
    // parse through the req.body
    if (!req.body) {
        return res.status(400).json({ message: "Bad request, no data provided" });

    }else if(req.body.role === 'volunteer'){
        userData = {
            // ID: null,
            FirstName: req.body.firstName,
            LastName: req.body.lastName,
            Email: req.body.email,
            Password: req.body.password,
            role: req.body.role,
            DateOfBirth: req.body.dateOfBirth,
            Phone: req.body.phone,
            Photo: req.body.profileImage,
            Notifications: req.body.notifications
        }
        try {                    
            const isAdministrator = isAdmin(userData.Email);

            console.log("isAdministrator", isAdministrator);
            
            if (isAdministrator) {
                try{
                    userData = {...userData, VolunteerType: "Admin"}
                    console.log("userData", userData);
                }catch(error){
                    console.error('Error creating admin user:', error);
                    res.status(500).send('Internal Server Error');
                }
            }
        }catch (error) {
            console.error('Error checking admin status:', error);
            res.status(500).send('Internal Server Error');
        }
    }else if(req.body.role === 'camper'){
        userData = {
            ID: null,
            Photo: req.body.profileImage,
            Email: req.body.email,
            Password: req.body.password,
            Notifications: req.body.notifications,
            Phone: req.body.phone,
            Notes: "",
            CareDataID: null,
            OriginsID: null,
            role: req.body.role,
        }
        careData = {
            CareDataID: null,
            OriginsID: null,
            CamperID: null,
            CareType: req.body.diagnosis,
            TargetBG: req.body.target,
            CorrectionFactor: req.body.correctionFactor,
            MDI: req.body.mdi || null,
            CGM: req.body.cgmModel || '',
            InsulinPump: req.body.insulinPump || null,
            InsulinPumpModel: req.body.insulinPumpModel || null,
            InsulinType: req.body.insulinType, // perscriptions
            Allergies: req.body.allergies,
            EmergencyContact: null,
        }
        originsData = {
            CamperID: null,
            FirstName: req.body.firstName || "Not Provided",
            LastName: req.body.lastName || "Not Provided",
            Gender: null,
            Age: null,
            DateOfBirth: req.body.dateOfBirth,
            Mother: null,
            Father: null,
        }
        bgTargets = {
            CareDataID: null,
            TimeLabel: null,
            BGTargetBreakfast: null,
            BGTargetLunch: null,
            BGTargetDinner: null,
            BGTargetOther: null,
        }
        insulinCarbRatio = {
            CareDataID: null,
            RatioBreakfast: req.body.InsulinToCarbRatio.Breakfast,
            RatioLunch: req.body.InsulinToCarbRatio.Lunch,
            RatioDinner: req.body.InsulinToCarbRatio.Dinner,
        }
        mealReadings = {
            CareDataID: null,
            CamperID: null,
            DateTaken: null,
            TimeLabel: null,
            UnixTime: null,
            CarbAmount: null,
            GlucoseReading: null,
            Meal: null,
            ImageIdentifier: null,
        }
        longActingInsulin = {
            CareDataID: null,
            Dosage: null,
            LastAdministered: null,
            Name: req.body.longActingInsulin,
        }
        rapidActingInsulin = {
            CareDataID: null,
            Dosage: null, 
            LastAdministered: null,
            Name: req.body.rapidActingInsulin,
        }
        specialNeed = {
            CareDataID: null,
            SpecialNeedType: req.body.specialNeeds,
            Notes: null,
            SpecialNeedInstructions: null
        }
        /////////////
        providers = {
            CareDataID: null,
            CamperID: null,
            Role: null,
            Name: null,
            Email: null,
            Phone: null
        }
        overTheCounterMedication = {
            CareDataID: null,
            CamperID: null,
            ActiveIngredients: null,
            DosageAdult: null,
            DosageChild: null,
            Instructions: null,
            SideEffects: null,
            Warnings: null,
            CreatedBy: null,
            MedicationName: req.body.overTheCounterMeds,
        }
        prescriptions = {
            CareDataID: null,
            CamperID: null,
            GenericName: null,
            Form: null,
            Dosage: null,
            Frequency: null,
            Refills: null,
            PrescribedFor: null,
            SideEffects: null,
            Interactions: null,
            PerscriptionDate: null,
            Instructions: null,
            MedicineName: req.body.prescriptions,
        }
        medicalNotes = {
            CareDataID: null,
            CamperID: null,
            NoteType: null,
            Content: null,
            Injury: null,
            CreatedBy: null,
            UpdatedBy: null,
        }
    }   
        try {
            // Check for duplicate user
            const Model = userData.role === 'camper' ? db.Camper : db.Volunteers;
           
            ///read ops check for duplicate users/////////////////////////////////////////////////////////////////////
            const duplicateUserA = await db.Camper.findOne({ where: { email: userData.Email } });
            const duplicateUserB = await db.Volunteers.findOne({
                where: { email: userData.Email },
                attributes: ['Email']  // Only select the email field
            });
            ////////////////////////////////////////////////////////////////////////////////

            if (duplicateUserA || duplicateUserB) {
                return res.redirect(409, 'http://localhost:5173/error=Conflict');
            }
            // if something weird happened...not sure why this would occur
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({ message: "Email and password are required." });
            }
            // Create user either volunteer or camper
            const newUser = await Model.create(userData);
            // remove the Photo base 64 string
            const { Photo, ...jwtData } = newUser.dataValues;
            // grab the models associated with the camper
            const CamperModels = userData.role === 'camper' ? true : false;
            // if we are making a camper do this
            if (CamperModels) {
                try{
                    // links the camperModel to the care Data model using a Database hook
                    const careDataWithCamperID = {...careData};
                    const newCareData = await db.Camper.associateCamperWithCareData(userData.Email,careDataWithCamperID, 5)
                    if(!newCareData){
                        console.log('Failed to create care data');
                    }else{
                        console.log("newCareData ",newCareData)
                        console.log('Care data created successfully');
                    }
                   // Destructure needed properties from newCareData
                    const { CamperID: cpID, ID: cdID } = newCareData.dataValues;

                    // calculate campers age////////////////////////
                    const bDay = new Date(originsData.DateOfBirth);
                    console.log('bday' + bDay) // bdayThu Jun 20 2024 19:00:00 GMT-0500 (Central Daylight Time)
                    const today = new Date();
                    let age = today.getFullYear() - bDay.getFullYear();
                    const m = today.getMonth() - bDay.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < bDay.getDate())) {
                        age--;
                    }
                
                    //////////////////////////////////////////////
                    // create orgigins table for camper
                    originsData.Age = age;  // set age
                    // assigns the data to the var originsDataWithCamperID
                    const originsDataWithCamperID = {...originsData, CamperID: cpID };
                    const newOrigins = await db.OriginsData.create(originsDataWithCamperID);
                    if(!newOrigins){
                        console.log('Failed to create origins data');
                    }

                    // bg target table
                    const bgTargetWithCamperID = {...bgTargets, CareDataID: cdID}
                    const newBgTarget = await db.BGTargets.create(bgTargetWithCamperID)
                    if(!newBgTarget){
                        console.log('Failed to create bg target data');
                    }

                    // create insulin carb ratio table
                    const insulinCarbRatioWithCareDataID = {...insulinCarbRatio, CareDataID: cdID};
                    const newInsulinCarbRatio = await db.InsulinCarbRatios.create(insulinCarbRatioWithCareDataID);
                    if(!newInsulinCarbRatio){
                        console.log('Failed to create insulin carb ratio data');
                    }

                    const mealReadingsWithCarDataID = {...mealReadings, CareDataID: cdID, CamperID: cpID};
                    const newMealReadings = await db.MealReadings.create(mealReadingsWithCarDataID);
                    if(!newMealReadings){
                        console.log('Failed to create meal readings data');
                    }

                    const providersWithCareDataID = {...providers, CareDataID: cdID, CamperID: cpID};
                    const newProviders = await db.Providers.create(providersWithCareDataID);
                    if(!newProviders){
                        console.log('Failed to create providers data');
                    }

                    const prescriptionWithCareDataID = { ...prescriptions, CareDataID: cdID, CamperID: cpID };
                    const newPrescription = await db.Prescriptions.create(prescriptionWithCareDataID);
                    if(!newPrescription){
                        console.log('Failed to create providers data');
                    }

                    const overTheCounterMedicationWithCareDataID = { ...overTheCounterMedication, CareDataID: cdID, CamperID: cpID };
                    const newOverTheCounter = await db.OverTheCounterMedication.create(overTheCounterMedicationWithCareDataID);
                    if(!newOverTheCounter){
                        console.log('Failed to create over the counter medication data');
                    }
                   
                    const medicalNotesWithCareDataID = {...medicalNotes, CareDataID: cdID, CamperID: cpID};
                    const newMedicalNotes = await db.MedicalNotes.create(medicalNotesWithCareDataID);
                    if(!newMedicalNotes){
                        console.log('Failed to create medical notes data');
                    }

                    const longActingWithCareID = {...longActingInsulin, CareDataID: cdID};
                    const newLongActing = await db.LongActingInsulin.create(longActingWithCareID);
                    if(!newLongActing){
                        console.log('Failed to create long acting insulin data');
                    }

                    const rapidActingWithCareID = {...rapidActingInsulin, CareDataID: cdID};
                    const newRapidActing = await db.RapidActingInsulin.create(rapidActingWithCareID);
                    if(!newRapidActing){
                        console.log('Failed to create rapid acting insulin data');
                    }

                    // create special needs table
                    const specialNeedsWithCareDataID = {...specialNeed, CareDataID: cdID};
                    const newSpecialNeeds = await db.SpecialNeed.create(specialNeedsWithCareDataID);
                    
                    if(!newSpecialNeeds){
                        console.log('Failed to create special needs data');
                    }

                }catch(err){
                    console.log(err)
                } 
                
            } else {
                console.log('No models to search in since the role is not "camper".');
            }
            // Sign JWT
            const token = jwt.sign( jwtData, jwtSecret, { expiresIn: jwtExpiration });

            if(token){
                if(!CamperModels){ // if user is not a camper, they are a volunteer
                    res.cookie('STJDA_volunteer', token, {
                        httpOnly: false,
                        secure: false,
                        sameSite: 'Lax',
                        path: '/',
                        maxAge: 30000  // Expire after 30 seconds
                    });
                    console.log('Cookie set successfully');
                }else if(CamperModels){ // if user is not a volunteer they are a camper
                    res.cookie('STJDA_camper', token, {
                        httpOnly: false,
                        secure: false,
                        sameSite: 'Lax',
                        path: '/',
                        maxAge: 30000  // Expire after 30 seconds
                    });
                }
                console.log('Cookie set successfully');
                // Redirect after setting the cookie and sending the cookie
                res.redirect(200, 'http://localhost:5173/profile');
            }
    }catch(err){
        console.error({ message: "Error in post route: ", err });
        res.status(500).json({ message: "Server error", error: err.message });
    }
})

module.exports = router;