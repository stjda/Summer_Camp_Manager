const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../../models');
const { config } = require('dotenv');
const { isAdmin } = require('../../utils/admins/validateAdmins');
config({ path: './.env' });


let userData = {};

// JWT setup
const jwtSecret = 'mysecretsshhhhh';
const jwtExpiration = '2h';

/// you need to also check if the browser has cookies enable, and if it doesnt present a screen for enabling cookies

// '/api/login' endpoint
router.post('/', async (req,res)=>{
    console.log('Login route hit');
    try{
        // find the user by email
        const camper = db.Camper;
        const volunteer = db.Volunteers;;
        ///read ops/////////////////////////////////////////////////////////////////////
        const camperData = await camper.findOne({ where: { email: req.body.email } });
        const volunteerData = await volunteer.findOne({ where: { email: req.body.email } });
        ////////////////////////////////////////////////////////////////////////////////

        if(!camperData && !volunteerData){
            res.cookie('STJDA_No_User', {
                httpOnly: false,
                secure: false,
                sameSite: 'Lax',
                path: '/',
                maxAge: 30000  // Expire after 30 seconds
              })
            
            return res.redirect(409, 'http://localhost:5173/profile');
            // Create user either volunteer or camper
        }
        if (camperData) {
            console.log('Camper data found');
            userData = {...camperData.dataValues};
            const validateCamper = await db.Camper.checkPassword(req.body.password, req.body.email);
            if(validateCamper){
                console.log('Camper password is valid');
            }else{
                console.log('Camper password is invalid');
                return res.redirect(409, 'http://localhost:5173/profile');
            }
        } else {

            try {
                // check if the user has administrato priviliges, if not take away their admin flag
                // this is used when the administrator revokes privileges
                // the next time the user logs in they are stripped of their admin flag
                const email = req.body.email;
                userData = {...volunteerData.dataValues};
                const isAdministrator = isAdmin(email);
                if (!isAdministrator) {
                    await db.Volunteers.update({ VolunteerType: null }, { where: { email: email } });
                }

                const validVolunteer = await db.Volunteers.checkPassword(req.body.password, req.body.email);
                if(validVolunteer){
                    console.log('Volunteer password is valid');
                }else{
                    return res.redirect(409, 'http://localhost:5173/profile');
                }

            } catch (error) {
                console.error('Error checking admin status:', error);
                res.status(500).send('Internal Server Error');
            }
          
        }
        // Cannot send the images along with the token, they are too large
        const { Photo, Banner, ...jwtData } = userData;
        // console.log(jwtData); 
        // Sign JWT
        const token = jwt.sign(jwtData , jwtSecret, { expiresIn: jwtExpiration });
        if(token){
            if(!camperData){ // if user is not a camper, they are a volunteer
                res.cookie('STJDA_volunteer', token, {
                    httpOnly: false,
                    secure: false,
                    sameSite: 'Lax',
                    path: '/',
                    maxAge: 30000  // Expire after 30 seconds
                });
                console.log('Cookie set successfully');
            }else if(!volunteerData){ // if user is not a volunteer they are a camper
                res.cookie('STJDA_camper', token, {
                    httpOnly: false,
                    secure: false,
                    sameSite: 'Lax',
                    path: '/',
                    maxAge: 30000  // Expire after 30 seconds
                });
            console.log('----Cookie set successfully----');
            }
            // Redirect after setting the cookie and sending the cookie
            res.redirect(200, 'http://localhost:5173/profile');
        }
    }catch(err){
        console.error({message: "Error in post route: ", Error: err})
        return res.status(500).json({message: 'Error session interrupted unexpectedly: Session will refresh in 30 min'})
    }
})
module.exports = router;