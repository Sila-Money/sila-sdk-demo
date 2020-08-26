import React from 'react';

import { Redirect } from 'react-router-dom';

// Route Views
import CheckHandle from '../views/CheckHandle';
import Register from '../views/Register/Register';
import CompanyInfo from '../views/Register/CompanyInfo';
import BusinessMembers from '../views/Register/BusinessMembers';
import RequestKYC from '../views/RequestKYC';
import Wallets from '../views/Wallets';
import Accounts from '../views/Accounts';
import Transact from '../views/Transact';
import Errors from '../views/Errors';

export default [
  {
    active: true,
    page: 'handle',
    title: 'Check Handle',
    path: '/check_handle',
    component: CheckHandle
  },
  {
    active: true,
    page: 'register',
    title: 'Register User',
    path: '/register',
    component: Register,
    routes: [{
      active: true,
      page: 'registerCompany',
      title: 'Company Info',
      path: '/register/company',
      component: CompanyInfo
    }, {
      active: true,
      page: 'registerMembers',
      title: 'Business Members',
      path: '/register/members',
      component: BusinessMembers
    }]
  },
  {
    active: true,
    restricted: true,
    page: 'request_kyc',
    title: 'Request KYC',
    path: '/request_kyc',
    component: RequestKYC
  },
  {
    active: true,
    restricted: true,
    page: 'wallets',
    title: 'Wallets',
    path: '/wallets',
    component: Wallets
  },
  {
    active: true,
    restricted: true,
    page: 'accounts',
    title: 'Link Account',
    path: '/accounts',
    component: Accounts
  },
  {
    active: true,
    restricted: true,
    page: 'transact',
    title: 'Transact',
    path: '/transact',
    component: Transact
  },
  {
    exact: true,
    path: '/',
    component: () => <Redirect to="/check_handle" />
  },
  {
    path: '*',
    component: () => <Errors status={404} />
  }
];
