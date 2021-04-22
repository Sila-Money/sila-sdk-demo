import React, { createContext, useState, useContext } from 'react';
import Sila from 'sila-sdk';

export const appContext = createContext(null);

// Set default app data
let appData = {
  auth: {},
  settings: {
    flow: false, 
    referrer: false,
    kybBusinessType: false, 
    kybNaicsCode: false, 
    kybNaicsCategory: false, 
    kybHandle: false, 
    kybAdminHandle: false,
    kycHandle: false, 
    kybMembersStatus: false,
    kybRoles: []
  },
  users: [],
  wallets: [],
  accounts: [],
  responses: [],
  success: []
};

// Get app data
const getAppStorage = () => {
  const storage = {
    auth: JSON.parse(localStorage.getItem('auth')) || appData.auth,
    settings: JSON.parse(localStorage.getItem('settings')) || appData.settings,
    users: JSON.parse(localStorage.getItem('users')) || appData.users,
    wallets: JSON.parse(localStorage.getItem('wallets')) || appData.wallets,
    accounts: JSON.parse(localStorage.getItem('accounts')) || appData.accounts,
    responses: JSON.parse(localStorage.getItem('responses')) || appData.responses,
    success: JSON.parse(localStorage.getItem('success')) || appData.success
  };
  console.log(storage);
  return storage;
};

// Set app data
const setAppStorage = (data) => ( // eslint-disable-next-line
  data.auth && localStorage.setItem('auth', JSON.stringify(data.auth)),
  data.settings && localStorage.setItem('settings', JSON.stringify(data.settings)),
  data.users && localStorage.setItem('users', JSON.stringify(data.users)),
  data.wallets && localStorage.setItem('wallets', JSON.stringify(data.wallets)),
  data.accounts && localStorage.setItem('accounts', JSON.stringify(data.accounts)),
  data.responses && localStorage.setItem('responses', JSON.stringify(data.responses)),
  data.success && localStorage.setItem('success', JSON.stringify(data.success.filter(success => typeof(success) !== 'string')))
);

// Initialize app data
if (JSON.parse(localStorage.getItem('appData'))) {
  setAppStorage(JSON.parse(localStorage.getItem('appData')));
  localStorage.removeItem('appData');
}
let initAppData = getAppStorage();

// Set the API Auth credentials in the SDK and update the environment in the SDK
let auth = initAppData.auth;
if (!auth) auth = { handle: false, key: false };
Sila.configure(auth);
Sila.setEnvironment('sandbox');
Sila.enableSandbox();
// Sila.disableSandbox();

// Create a provider for components to consume and subscribe to changes
const AppDataProvider = props => {
  const activeUser = initAppData.users.find(u => u.active);

  // Initialize app state
  const [app, setApp] = useState({
    auth: initAppData.auth,
    settings: { 
      ...initAppData.settings,
      kybHandle: activeUser && activeUser.business ? activeUser.handle : false,
      kybAdminHandle: activeUser && activeUser.admin ? activeUser : activeUser && activeUser.business && !activeUser.certified && initAppData.users.some(u => u.admin && u.business_handle === activeUser.handle) ? initAppData.users.find(u => u.admin && u.business_handle === activeUser.handle).handle : false
    },
    responses: initAppData.responses,
    wallets: initAppData.wallets,
    accounts: initAppData.accounts,
    users: initAppData.users,
    success: initAppData.success,
    activeUser: activeUser || false,
    kyc: {},
    kyb: {},
    alert: {},
    transactions: false,
    loaded: false,
    manageProcessorToken: false,
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
  };

  const refreshApp = () => {
    initAppData = getAppStorage();
    auth = initAppData.auth;
    updateApp({
      auth: auth,
      settings: initAppData.settings,
      users: initAppData.users,
      responses: initAppData.responses,
      wallets: initAppData.wallets,
      accounts: initAppData.accounts,
      success: initAppData.success
    });
    if (!auth) {
      // If there is no Auth setting, remove authentication in the SDK and demo app
      auth = { handle: false, key: false };
      updateApp({ auth: {} });
    }
    Sila.configure(auth); // Set the API Auth credentials in the SDK
    Sila.enableSandbox(); // Update the Sandbox setting in the SDK
    // Sila.disableSandbox();
  };

  const resetApp = () => {
    setAppData({ ...appData }, () => {
      updateApp({
        users: [],
        wallets: [],
        accounts: [],
        success: [],
        responses: [{
          alert: true,
          message: 'Application data cleared',
          type: 'success',
          loaded: true
        }],
        kyc: {},
        kyb: {},
        transactions: false,
        activeUser: false
      });
    });
  };

  const setAuth = (handle, key, callback) => {
    Sila.configure({ handle, key });
    setAppData({
      auth: { handle, key }, 
      responses: [{
        alert: true,
        message: 'Application authentication updated',
        type: 'success'
      }, ...app.responses] 
    }, () => {
      updateApp({
        activeUser: app.activeUser ? {
          ...app.activeUser,
          private_key: key
        } : false
      });
      if (callback) callback();
    });
  };

  const checkAuth = async (handle, key) => {
    const newAuth = handle && key ? { handle, key } : app.auth;
    try {
      const res = await Sila.checkHandle('');
      if (res.statusCode === 200) {
        delete newAuth.failed;
        setAppData({ auth: newAuth }, () => {
          updateApp({ manageSettings: false });
        });
      } else {
        setAppData({ auth: { ...newAuth, failed: true } }, () => {
          updateApp({ manageSettings: true });
        });
      }
    } catch (err) {
      setAppData({ auth: {...newAuth, failed: true } }, () => {
        updateApp({ manageSettings: true });
      });
    }
  };

  const setAppData = (options, callback) => {
    initAppData = getAppStorage();
    for (let key in options) {
      if (initAppData.hasOwnProperty(key)) initAppData[key] = options[key];
    }
    setAppStorage(initAppData);
    refreshApp();
    if (callback) callback();
  };

  const setNewUser = (callback) => {
    setAppData({
      users: app.users.map(({ active, ...u }) => u),
      settings: appData.settings,
    }, () => {
      updateApp({ activeUser: false, kyc: {}, kyb: {} });
      if (callback) callback();
    });
  };

  return <appContext.Provider value={{
    app,
    api: Sila,
    handleError,
    updateApp,
    refreshApp,
    resetApp,
    setAuth,
    checkAuth,
    setAppData,
    setNewUser
  }} {...props} />;
};

export const useAppContext = () => useContext(appContext);

export default AppDataProvider;