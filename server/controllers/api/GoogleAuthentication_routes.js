const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const db = require('../../models');
const { config } = require('dotenv');
// config({ path: '../../../../.env' });
config({ path: './.env' });
// console.log(path.resolve('./.env'));
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid'
];

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = process.env.REDIRECT_URI
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

let authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
});

const getTokens = async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    if (!tokens) throw new Error("Failed to retrieve tokens");
    return tokens.id_token;
  } catch (error) {
    console.error('Failed to retrieve access tokens:', error);
    throw error;
  }
};

// google auth route /api/auth/google
router.get("/google", async (req, res) => {
  try {
    // send the URL used for authentication after building it
    res.status(200).send(authUrl);
  } catch (error) {
    console.log("Error: ", error) // pass error to centralized error handler
  }
});

// /api/auth/profile
router.get('/profile', async (req, res) => {
  try {
    
    const { code } = req.query;
    const tokens = await getTokens(code); // getTokens is a function that retrieves OAuth tokens
    
    if (!tokens) {
      throw new Error("No tokens received");
    }
    
    const decodedToken = jwt.decode(tokens);
    console.log('decoded token',decodedToken);
    
    // if decoded token.email == verified, send to SQL database
 
    if(decodedToken.email_verified){
        // send email to database to check if it exists
        const camper = await db.Camper.findOne({ where: { Email: decodedToken.email } });
        const volunteers = await db.Volunteers.findOne({ where: { Email: decodedToken.email } });
        // console.log("people in the db: ",camper, volunteers);

        if (!camper && !volunteers) { // if the user doesnt exist
          // send back an unsecure cookie 
          res.cookie('STJDA_No_User', {
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 30000  // Expire after 30 seconds
          })
        }else if (!camper){ // if user is not a camper, they are a volunteer
          // Send back a cookie with the JWT to use clientside
          res.cookie('STJDA_volunteer', tokens, {
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 30000  // Expire after 30 seconds
          });
        }else if(!volunteers){ // if user is not a volunteer they are a camper
          // Send back a cookie with the JWT to use clientside
          res.cookie('STJDA_camper', tokens, {
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 30000  // Expire after 30 seconds
          });
        }
        console.log('Cookie set successfully in google oauth');
      // Redirect the user to the specific URL after successful token retrieval
      // this redirect page displays a spinner then sends back the cookie for server side parsing
      res.redirect('http://localhost:5173/profile'); 
    }else{
      res.cookie('STJDA_No_Verified_Gmail', {
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
        path: '/',
        maxAge: 3000  // Expire after 30 seconds
      })
      res.redirect(401, 'http://localhost:5173/error=emailNotVerified');
    }
  } catch (error) {
    console.error('Failed to retrieve access tokens:', error);
    res.redirect('http://localhost:5173/error=emailNotVerified');
  }
});


// /api/auth/credentials
router.get('/credentials', async (req, res) => {
  // we recieve the cookie and parse it to text then send it back
  try {
    // Access tokens from cookies
    const accessToken = req.cookies.STJDA_camper || req.cookies.STJDA_volunteer ;

    if (accessToken) {
      res.json({ authenticated: true, token: accessToken });
    } else {
      res.status(401).json({ authenticated: false, message: 'No token found' });
    }
    // if (accessToken) {
    //   // If an access token is found, send it as the response
    //   res.send(accessToken);
    // } else {
    //   // If no token is found in the cookies, error and redirect back to login start
    //   res.status(401).redirect('http://localhost:5173/login');
    // }
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;