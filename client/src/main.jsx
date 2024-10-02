import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { CssBaseline } from '@mui/material'
import { registerSW } from 'virtual:pwa-register';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { StoreProvider } from './util/Models/Stores/index.js';
// Create a custom theme with global styles
const muiTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `  
        * {
          -webkit-font-smoothing: antialiased;
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          height: 100%;
        }
        button:focus-visible {
          outline: 2px solid #4a90e2 !important;
          outline: -webkit-focus-ring-color auto 5px !important;
        }
        a {
          text-decoration: none;
        }
      `,
    },
  },
});

// Register the service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to the user asking them if they want to refresh the page to use the new version
    if (confirm("A new version is available, do you want to refresh?")) {
      updateSW();
    }
  },
  onOfflineReady() {
    // Show a message when the app is ready to work offline
    console.log("The app is ready to work offline!");
  },
});

// Render the app with the theme
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline /> {/* Normalize the CSS and add global styles */}
      <GoogleOAuthProvider >
      <StoreProvider>
      <App />
      </StoreProvider>
      </GoogleOAuthProvider>
    </MuiThemeProvider>
  </React.StrictMode>,
);
