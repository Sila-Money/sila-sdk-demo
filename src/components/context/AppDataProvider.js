import React, { createContext, useState, useContext } from 'react';
import Sila from 'sila-sdk';

export const appContext = createContext(null);

// Initialize app data
const appData = { 
  auth: {},
  users: [],
  wallets: [],
  accounts: [],
  responses: [],
  success: []
};

// Initialize Local Storage for persistent app data
let initAppData = JSON.parse(localStorage.getItem('appData'));
if (!initAppData) {
  initAppData = appData;
  localStorage.setItem('auth', JSON.stringify(initAppData));
}

// Initialize app state
const appState = {
  auth: initAppData.auth,
  responses: initAppData.responses,
  wallets: initAppData.wallets,
  accounts: initAppData.accounts,
  users: initAppData.users,
  activeUser: initAppData.users.length ? initAppData.users.find(user => user.active) : false,
  success: initAppData.success,
  handle: '',
  transactions: false,
  kycType: 'default',
  kyc: {},
  alert: {},
  loaded: false,
  manageLinkAccount: false,
  manageSettings: false,
  manageReset: false
};

// Set the API Auth credentials in the SDK and update the environment in the SDK
let auth = initAppData.auth;
if (auth === undefined || auth === {})
  auth = { handle: false, key: false };
Sila.configure(auth);
Sila.setEnvironment('prod');
Sila.enableSandbox();
// Sila.disableSandbox();

// Create a provider for components to consume and subscribe to changes
const AppDataProvider = props => {
  const [app, setApp] = useState(appState);

  const updateApp = (state) => {
    setApp(prevApp => ({ ...prevApp, ...state }));
  }

  const handleError = (err) => {
    let error = err;
    try {
      JSON.parse(err);
      error = JSON.stringify(err, null, '\t');
    } catch (e) {
      console.log(`Unexpected Response is not a JSON object: \n${err}`);
    }
    updateApp({ responses: [...app.responses, {
      alert: true,
      message: error,
      style: 'danger'
    }] });
  }

  const refreshApp = () => {
    initAppData = JSON.parse(localStorage.getItem('appData'));
    auth = initAppData.auth;
    updateApp({ 
      users: initAppData.users, 
      responses: initAppData.responses, 
      wallets: initAppData.wallets, 
      accounts: initAppData.accounts, 
      success: initAppData.success,
      auth: auth 
    });
    if (auth === undefined) {
      // If there is no Auth setting, remove authentication in the SDK and demo app
      auth = { handle: false, key: false };
      updateApp({ auth: {} });
    }
    Sila.configure(auth);   // Set the API Auth credentials in the SDK
    Sila.enableSandbox();   // Update the Sandbox setting in the SDK
    // Sila.disableSandbox();
  }

  const resetApp = () => {
    localStorage.setItem('appData', JSON.stringify(appData));
    refreshApp();
    updateApp({ private_key: null, kyc: null, transactions: false, activeUser: false, users: [], wallets: [], accounts: [], responses: [{ alert: true, message: 'Applciation data cleared', style: 'success', loaded: true }] });
  }

  const setAuth = (handle, key) => {
    Sila.configure({handle, key});
    initAppData = JSON.parse(localStorage.getItem('appData'));
    initAppData.auth = { handle, key };
    localStorage.setItem('appData', JSON.stringify(initAppData));
    updateApp({ 
      activeUser: { ...app.activeUser, private_key: key },
      responses: [ ...initAppData.responses, { alert: true, message: 'Applciation authentication updateed', style: 'success' }]
    });
    refreshApp();
  }

  const setAppData = (options, callback) => {
    initAppData = JSON.parse(localStorage.getItem('appData'));
    for (let key in options) {
      if (initAppData.hasOwnProperty(key)) initAppData[key] = options[key];
    }
    localStorage.setItem('appData', JSON.stringify(initAppData));
    refreshApp();
    if (callback) callback();
  }

  return <appContext.Provider value={{ 
    app,
    auth,
    handleError,
    updateApp,
    refreshApp,
    resetApp,
    setAuth,
    setAppData,
    api: Sila
  }} {...props} />;
};

export const useAppContext = () => useContext(appContext);

export default AppDataProvider;