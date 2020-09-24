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

export const flows = {
  kyc: [
    '/check_handle', 
    '/register_user', 
    '/request_kyc', 
    '/wallets', 
    '/accounts', 
    '/transact'
  ],
  kyb: [
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
};

export default [
  {
    title: 'Home',
    path: '/',
    exact: true,
    component: Home
  },
  {
    restricted: false,
    title: 'Check Handle',
    path: '/check_handle',
    component: CheckHandle
  },
  {
    restricted: false,
    title: 'Register User',
    path: '/register_user',
    component: RegisterUser
  },
  {
    restricted: true,
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
    kyb: true,
    placeholder: true,
    restricted: false,
    title: 'Register Business',
    path: '/business',
    routes: [{
      restricted: false,
      title: 'Business Type',
      path: '/business/type',
      component: BusinessType
    },
    {
      restricted: false,
      title: 'Check Handle',
      path: '/business/handle',
      component: CheckHandle
    }, {
      restricted: false,
      title: 'Company Info',
      path: '/business/register',
      component: RegisterBusiness
    }]
  },
  {
    restricted: true,
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
      title: 'Business Member',
      path: '/members/:handle',
      component: MemberDetails
    }]
  },
  {
    restricted: true,
    title: 'Certify Business',
    path: '/certify',
    component: CertifyBusiness,
    routes: [{
      disabled: true,
      restricted: true,
      title: 'Certify Member',
      path: '/certify/:handle',
      component: MemberDetails
    }]
  },
  {
    path: '*',
    component: () => <Errors status={404} />
  }
];
