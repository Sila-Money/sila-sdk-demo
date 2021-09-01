import React from 'react';

// Route Views
import Home from '../views/Home';
import CheckHandle from '../views/CheckHandle';
import RegisterUser from '../views/kyc/RegisterUser';
import RequestKYC from '../views/RequestKYC';
import BusinessType from '../views/kyb/BusinessType';
import RegisterBusiness from '../views/kyb/RegisterBusiness';
import BusinessMembers from '../views/kyb/BusinessMembers';
import RegisterMember from '../views/kyb/RegisterMember';
import CertifyBusiness from '../views/kyb/CertifyBusiness';
import MemberDetails from '../views/kyb/MemberDetails';

import Wallets from '../views/Wallets';
import Accounts from '../views/Accounts';
import Transact from '../views/Transact';
import Errors from '../views/Errors';

import indvidualIcon from '../assets/images/indvidual.svg';
import businessIcon from '../assets/images/business.svg';

export const flows = {
  kyc: {
    name: 'Individual Onboarding (KYC)',
    icon: indvidualIcon,
    permissions: (app) => 
      !app.activeUser || 
      (app.activeUser && !app.activeUser.business && !app.activeUser.business_handle),
    routes: [
      '/check_handle', 
      '/register_user', 
      '/request_kyc', 
      '/wallets', 
      '/accounts', 
      '/transact'
    ]
  },
  kyb: {
    name: 'Business Onboarding (KYB)',
    icon: businessIcon,
    permissions: (app) => 
      !app.activeUser || 
      (app.activeUser && app.activeUser.business) || 
      (app.activeUser && typeof app.activeUser.business_handle === 'string') ||
      (app.activeUser && typeof app.settings.kybHandle === 'string'),
    routes: [
      '/business/type',
      '/business/handle', 
      '/business/register', 
      '/members',
      '/request_kyc',
      '/certify', 
      '/wallets', 
      '/accounts', 
      '/transact'
    ]
  }
};

export default [
  {
    all: true,
    title: 'Home',
    path: '/',
    exact: true,
    component: Home
  },
  {
    all: true,
    restricted: false,
    title: 'Check Handle',
    path: '/check_handle',
    component: CheckHandle
  },
  {
    all: true,
    restricted: false,
    title: 'Register User',
    path: '/register_user',
    component: RegisterUser,
    tips: [
      "Look for a text message to the number provided in order to opt-in for SMS notifications!"
    ]
  },
  {
    restricted: true,
    admin: true,
    title: 'Request KYC',
    path: '/request_kyc',
    component: RequestKYC
  },
  {
    restricted: true,
    title: 'Wallets',
    path: '/wallets',
    component: Wallets
  },
  {
    restricted: true,
    title: 'Link Account',
    path: '/accounts',
    component: Accounts
  },
  {
    restricted: true,
    title: 'Transact',
    path: '/transact',
    component: Transact
  },
  {
    all: true,
    kyb: true,
    placeholder: true,
    title: 'Register Business',
    path: '/business',
    routes: [{
      all: true,
      title: 'Business Type',
      path: '/business/type',
      component: BusinessType
    },
    {
      all: true,
      title: 'Check Handle',
      path: '/business/handle',
      component: CheckHandle
    }, {
      all: true,
      title: 'Business Info',
      path: '/business/register',
      component: RegisterBusiness
    }]
  },
  {
    restricted: true,
    admin: true,
    title: 'Business Members',
    path: '/members',
    component: BusinessMembers,
    routes: [{
      disabled: true,
      restricted: true,
      title: 'Register Business Member',
      path: '/members/register',
      component: RegisterMember
    },
    {
      disabled: true,
      restricted: true,
      admin: true,
      title: 'Business Member',
      path: '/members/:handle',
      component: MemberDetails
    }]
  },
  {
    restricted: true,
    admin: true,
    title: 'Certify Business',
    path: '/certify',
    component: CertifyBusiness,
    routes: [{
      disabled: true,
      restricted: true,
      admin: true,
      title: 'Certify Member',
      path: '/certify/:handle',
      component: MemberDetails
    }]
  },
  {
    all: true,
    path: '*',
    component: () => <Errors status={404} />
  }
];
