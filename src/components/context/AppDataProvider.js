import React, { createContext, useState, useContext } from 'react';
import Sila from 'sila-sdk';

export const appContext = createContext(null);

// Set default app data
const appData = {
  auth: {},
  users: [],
  wallets: [],
  accounts: [],
  responses: [],
  success: []
};

// Get app data
const getAppStorage = () => ({
  auth: JSON.parse(localStorage.getItem('auth')) || appData.auth,
  users: JSON.parse(localStorage.getItem('users')) || appData.users,
  wallets: JSON.parse(localStorage.getItem('wallets')) || appData.wallets,
  accounts: JSON.parse(localStorage.getItem('accounts')) || appData.accounts,
  responses: JSON.parse(localStorage.getItem('responses')) || appData.responses,
  success: JSON.parse(localStorage.getItem('success')) || appData.success
});

// Set app data
const setAppStorage = (data) => ( // eslint-disable-next-line
  data.auth && localStorage.setItem('auth', JSON.stringify(data.auth)),
  data.users && localStorage.setItem('users', JSON.stringify(data.users)),
  data.wallets && localStorage.setItem('wallets', JSON.stringify(data.wallets)),
  data.accounts && localStorage.setItem('accounts', JSON.stringify(data.accounts)),
  data.responses && localStorage.setItem('responses', JSON.stringify(data.responses)),
  data.success && localStorage.setItem('success', JSON.stringify(data.success))
);

console.log(localStorage.getItem('success'));

// Initialize app data
if (JSON.parse(localStorage.getItem('appData'))) {
  setAppStorage(JSON.parse(localStorage.getItem('appData')));
  localStorage.removeItem('appData')
}
let initAppData = getAppStorage();

// Set the API Auth credentials in the SDK and update the environment in the SDK
let auth = initAppData.auth;
if (!auth) auth = { handle: false, key: false };
Sila.configure(auth);
Sila.setEnvironment('prod');
Sila.enableSandbox();
// Sila.disableSandbox();

// Create a provider for components to consume and subscribe to changes
const AppDataProvider = props => {

  // Initialize app state
  const [app, setApp] = useState({
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
    kyc: null,
    alert: {},
    loaded: false,
    manageLinkAccount: false,
    manageSettings: false,
    manageReset: false
  });

  const updateApp = (state) => setApp(prevApp => ({ ...prevApp, ...state }));

  const handleError = (err) => {
    let error = err;
    try {
      JSON.parse(err);
      error = JSON.stringify(err, null, '\t');
    } catch (e) {
      console.log(`Unexpected Response is not a JSON object: \n${err}`);
    }
    updateApp({
      responses: [{
        alert: true,
        message: error,
        type: 'danger'
      }, ...app.responses]
    });
  }

  const refreshApp = () => {
    initAppData = getAppStorage();
    auth = initAppData.auth;
    updateApp({
      auth: auth,
      users: initAppData.users,
      responses: initAppData.responses,
      wallets: initAppData.wallets,
      accounts: initAppData.accounts,
      success: initAppData.success
    });
    if (auth === undefined) {
      // If there is no Auth setting, remove authentication in the SDK and demo app
      auth = { handle: false, key: false };
      updateApp({ auth: {} });
    }
    Sila.configure(auth); // Set the API Auth credentials in the SDK
    Sila.enableSandbox(); // Update the Sandbox setting in the SDK
    // Sila.disableSandbox();
  }

  const resetApp = () => {
    setAppStorage(appData);
    refreshApp();
    updateApp({
      private_key: null,
      kyc: null,
      transactions: false,
      activeUser: false,
      users: [],
      wallets: [],
      accounts: [],
      responses: [{
        alert: true,
        message: 'Application data cleared',
        type: 'success',
        loaded: true
      }],
      success: []
    });
  }

  const setAuth = (handle, key) => {
    Sila.configure({ handle, key });
    initAppData = getAppStorage();
    initAppData.auth = { handle, key };
    setAppStorage(initAppData);
    setAppData({
      responses: [{
        alert: true,
        message: 'Application authentication updated',
        type: 'success'
      }, ...initAppData.responses]
    }, () => {
      updateApp({
        activeUser: app.activeUser ? {
          ...app.activeUser,
          private_key: key
        } : false
      });
      refreshApp();
    });
  }

  const setAppData = (options, callback) => {
    initAppData = getAppStorage();
    for (let key in options) {
      if (initAppData.hasOwnProperty(key)) initAppData[key] = options[key];
    }
    setAppStorage(initAppData);
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