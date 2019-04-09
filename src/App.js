import React, { Component } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import {Button, ButtonGroup} from 'react-bootstrap';
import { Form, FormControl, Col, Table } from 'react-bootstrap';
import PlaidLinkButton from 'react-plaid-link-button';
import { faKey, faCreditCard, faIdCard, faUserCheck, faGlobe, faHandshake, faCog, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Section from './elements/section';

import './App.css';
const sila = require('sila-sdk/lib/index.js');

class App extends Component {
  constructor(props) {
    super(props);
    
    // Initialize Local Storage for persistent user data
    let initUsers = JSON.parse(localStorage.getItem('users')); 
    if ( ! initUsers ) {
      initUsers = {test:{live: [],sandbox:[]},stage:{live:[],sandbox:[]},prod:{live:[],sandbox:[]}};
      localStorage.setItem('users', JSON.stringify(initUsers));
    }

    let initAuth = JSON.parse(localStorage.getItem('auth'));
    if ( ! initAuth ) {
      initAuth = {test: {sandbox: {}, live: {}}, stage: {sandbox: {}, live: {}}, prod: {sandbox: {}, live: {}}};
      localStorage.setItem('auth', JSON.stringify(initAuth));
    }
    
    this.state = {
      auth: initAuth.prod.sandbox,
      handle: '',
      response: 'Submit a request to see the response',
      errors: ['test error'],
      info: ['test info'],
      success: ['test success'],
      responseClass: 'waiting',
      activeUser: false,
      accounts: false,
      transactions: false,
      kyc: null,
      open: false,
      plaidData: [],
      generateWallet: true,
      loaded: false,
      manageSettings: false,
      environment: 'prod',
      sandbox: true,
      users: initUsers.prod.sandbox,
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleError = this.handleError.bind(this);
    this.checkHandle = this.checkHandle.bind(this);
    this.register = this.register.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.addUser = this.addUser.bind(this);
    this.clearUsers = this.clearUsers.bind(this);
    this.setActiveUser = this.setActiveUser.bind(this);
    this.setPrivateKey = this.setPrivateKey.bind(this);
    this.setEnvironment = this.setEnvironment.bind(this);
    this.resetApp = this.resetApp.bind(this);
    this.setAuth = this.setAuth.bind(this);
    this.refreshEnv = this.refreshEnv.bind(this);
    
    // this.refreshEnv();
    
    let auth = initAuth.prod.sandbox;
    if(auth === undefined || auth === {})
      auth = {handle: false, key: false};
    sila.configure(auth);         // Set the API Auth credentials in the SDK
    sila.setEnvironment('prod');     // Update the Environment in the SDK
    sila.enableSandbox();
  }
  
  refreshEnv() {
    const env = this.state.environment;
    const app = this.state.sandbox ? 'sandbox' : 'live';
    const users = JSON.parse(localStorage.getItem('users'));
    this.setState({users: users[env][app]});
    const authKeys = JSON.parse(localStorage.getItem('auth'));
    let auth = authKeys[env][app];
    this.setState({auth: auth});
    if(auth === undefined) {
      // If there is no Auth setting, remove authentication in the SDK and demo app
      auth = {handle: false, key: false};
      this.setState({auth: {}});
    }
    sila.configure(auth);         // Set the API Auth credentials in the SDK
    sila.setEnvironment(env);     // Update the Environment in the SDK
    if(this.state.sandbox) {      // Update the Sandbox setting in the SDK
      sila.enableSandbox();
    } else {
      sila.disableSandbox();
    }
  }
  
  /**
   * 
   * @param {EventObject} event
   * 
   * Update the Auth settings for the current environment 
   */
  setAuth(event) {
    event.preventDefault();
    if (event.target.auth_key.value && event.target.auth_handle.value) {
      sila.configure({
        key: event.target.auth_key.value,
        handle: event.target.auth_handle.value,
      });
      let authKeys = JSON.parse(localStorage.getItem('auth'));
      const envApp = (this.state.sandbox) ? 'sandbox' : 'live';
      authKeys[this.state.environment][envApp] = {handle: event.target.auth_handle.value, key: event.target.auth_key.value};
      localStorage.setItem('auth', JSON.stringify(authKeys));
      this.setState({manageSettings: false}, () => {
        this.refreshEnv();
      });
    } else {
      alert('Please specify an Auth Handle and Auth Key for the current environment.');
    }
  }
  
  // Switch environments (NOTE: only `prod` is publcly available)
  setEnvironment(env) {
    if (env !== this.state.environment)
      this.setState({users: [], activeUser: false, response: `Changed environments to ${env}`, responseClass: 'success'});
      
    this.setState({environment: env}, () => {
      this.refreshEnv();      
    });
  }
  
  // Toggle sandbox on or off (initially set to `true`)
  setSandbox(sandbox) {
    const resp = (sandbox) ? 'Enabled sandbox' : 'Disabled sandbox';
    if (sandbox !== this.state.sandbox)
      this.setState({users: [], activeUser: false, response: resp, responseClass: 'success'});

    this.setState({sandbox: sandbox}, () => {
      this.refreshEnv();      
    });
  }
  // Toggle sandbox on or off (initially set to `true`)
  toggleGenerateWallet() {
    this.setState({generateWallet: !this.state.generateWallet});
  }
  
  // Add a user to the current environment
  addUser(user) {
    let users = JSON.parse(localStorage.getItem('users'));
    const envApp = (this.state.sandbox) ? 'sandbox' : 'live';
    users[this.state.environment][envApp].push(user);
    localStorage.setItem('users', JSON.stringify(users));
    this.setState({activeUser: user, users: users[this.state.environment][envApp]});
  }

  // Clear users in the current environment
  clearUsers() {
    let users = JSON.parse(localStorage.getItem('users'));
    const envApp = (this.state.sandbox) ? 'sandbox' : 'live';
    users[this.state.environment][envApp] = [];
    localStorage.setItem('users', JSON.stringify(users));
    this.setState({activeUser: false, users: []});
  }

  getUsers() {
    let users = JSON.parse(localStorage.getItem('users'));
    const envApp = (this.state.sandbox) ? 'sandbox' : 'live';
    return users[this.state.environment][envApp];
  }
  
  setActiveUser(e) {
    const handle = e.target.value;
    if (handle !== 'Select a user ...') {
      for (let i = 0; i < this.state.users.length + 1; i++) {
        if (this.state.users[i].handle === handle) {
          this.setState({activeUser: this.state.users[i], accounts: false, transactions: false, kyc: null});
          break;
        }
      }
    } else {
      this.setState({activeUser: false, accounts: false, transactions: false});
    }
  }
  
  resetApp(e) {
    e.preventDefault();
    const reset = window.confirm('This will clear all user data from the app. Users will still be registered with sila. Are you sure you want to reset?');
    let users = JSON.parse(localStorage.getItem('users'));
    const envApp = (this.state.sandbox) ? 'sandbox' : 'live';
    users[this.state.environment][envApp] = [];
    if(reset) {
      localStorage.setItem('users', JSON.stringify(users));
      this.setState({kyc: null, responseClass: 'success', response: 'Applciation data cleared', accounts: false, transactions: false, activeUser: false, users: [], private_key: null});
    }
  }
  
  setPrivateKey(e) {
    if (e !== undefined)
      e.preventDefault();
    let user = this.state.activeUser;
    const private_key = e.target.private_key.value;
    const envApp = (this.state.sandbox) ? 'sandbox' : 'live';
    user.private_key = private_key;
    let users = this.state.users;
    for (let i = 0; i < users.length + 1; i++) {
      if (users[i].handle === user.handle) {
        users[i] = user;
        break;
      }
    }
    const allUsers = JSON.parse(localStorage.getItem('users'));
    allUsers[this.state.environment][envApp] = users;
    localStorage.setItem('users', JSON.stringify(allUsers));
    this.setState({activeUser: user, users: users});
  }
    
  handleChange(event) {
    this.setState({handle: event.target.value});
  }
  
  handleError(err) {
    console.log(this);
    this.setState({responseClass: 'danger'});
    let error = err;
    try {
      JSON.parse(err);
      error = JSON.stringify(err, null, '\t');
    } catch (e) {
      this.setState({respProdonse: `Unexpected Response is not a JSON object: \n${err}`});
    }
    this.setState({response: `ERROR:\n\n${error}`});
  }
  checkHandle(event) {
    event.preventDefault();
    
    console.log('\n*** CHECK HANDLE:');
    console.log('  Waking up the API service ...');
    sila.checkHandle(this.state.handle)
      .then((res) => {
        console.log('  ... completed!');
        if(res.status === 'SUCCESS'){
          this.setState({responseClass: 'success'});
        } else {
          this.setState({responseClass: 'error'});
        }
        this.setState({response: JSON.stringify(res, null, '\t')});
      })
      .catch((err) => {
        console.log('  ... looks like we ran into an issue!');
        this.handleError(err);
      });
  }
  
  register(event) {
    console.log('\n*** BEGIN REGISTER USER ***');
    this.setState({response: 'Getting response from the Sila API ...'});
    event.preventDefault();
    const wallet = (this.state.generateWallet) ? sila.generateWallet() : false;
    console.log(wallet);
    
    console.log('   Waking up the API service ...');
    const user = {
      first_name: event.target.first_name.value,
      last_name: event.target.last_name.value,
      handle: event.target.handle.value,
      address: event.target.address.value,
      city: event.target.city.value,
      state: event.target.state.value,
      zip: event.target.zip.value,
      ssn: event.target.ssn.value,
      dob: event.target.dob.value,
      email: event.target.email.value,
      phone: event.target.phone.value,
      crypto: (this.state.generateWallet) ? wallet.address : event.target.crypto.value,
    };
    
    sila.register(user)
      .then(res => {
        console.log('  ... completed.');
        if(res.status === 'SUCCESS'){
          this.addUser(user);
          // this.setActiveUser(user);
          this.setState({responseClass: 'success'});
          // Add the user to the local user array
          
          this.setState({response: JSON.stringify(res, null, '\t')}, () => {
            this.refreshEnv();
            
            let user = this.state.activeUser;
            const private_key = wallet.privateKey;
            const envApp = (this.state.sandbox) ? 'sandbox' : 'live';
            user.private_key = private_key;
            let users = this.state.users;
            for (let i = 0; i < users.length + 1; i++) {
              if (users[i].handle === user.handle) {
                users[i] = user;
                break;
              }
            }
            const allUsers = JSON.parse(localStorage.getItem('users'));
            allUsers[this.state.environment][envApp] = users;
            localStorage.setItem('users', JSON.stringify(allUsers));
            this.setState({activeUser: user, users: users});
          });
        } else {
          this.setState({responseClass: 'error'});    
          this.setState({response: JSON.stringify(res, null, '\t')});
        }
      })
      .catch(err => {
        console.log('  ... FAILED\n\n*** END REGISTER USER ***\n');
        this.handleError(err);
      });
  }
  
  updateAuth(event) {
    event.preventDefault();
      
  }
    
  render() {
    
    return (
      <div className="App">
        <div className="row">
          <div className="col">
          
            <h1>Sila SDK Demo</h1>
            <Button
              className="float-right"
              size="sm"
              variant="info"
              onClick={() => {
                this.setState({manageSettings: true})
              }}
            >
              <FontAwesomeIcon icon={faCog} />
              &nbsp;Settings
            </Button>
            <span className="float-right text-muted">App is set to {this.state.sandbox ? 'SANDBOX' : 'LIVE API'} in {this.state.environment.toUpperCase()}: {(this.state.auth.handle === undefined) ? 'No Auth' : this.state.auth.handle}&nbsp;</span>
          </div>
        </div>
        <hr></hr>
        <div className="row">
          <div className="col">
            <Section sectionTitle="Check Handle" icon={<FontAwesomeIcon icon={faUserCheck} />}>
              <Form autoComplete="off" onSubmit={this.checkHandle}>
                <Form.Group controlId="formGroupHandle"> 
                  <InputGroup className="mb-3">
                    <FormControl
                      placeholder='handle'
                      aria-label='handle'
                      aria-describedby="handle-ext"
                      onChange={this.handleChange}
                    />
                    <InputGroup.Append>
                      <InputGroup.Text id="handle-ext">.silamoney.eth</InputGroup.Text>
                    </InputGroup.Append>
                  </InputGroup>
                </Form.Group>
                <button className="btn btn-primary btn-block btn-small" disabled={!this.state.handle}>Check {this.state.handle}.silamoney.eth</button>
              </Form>
            </Section>

            <Section sectionTitle="Register" icon={<FontAwesomeIcon icon={faIdCard} />}>
              <Form autoComplete="off" onSubmit={this.register}>
                <Form.Row>
                  <Form.Group as={Col} controlId="registerFirstName">
                    <Form.Control placeholder="First Name" name="first_name" />
                  </Form.Group>

                  <Form.Group as={Col} controlId="registerLastName">
                    <Form.Control placeholder="Last Name" name="last_name" />
                  </Form.Group>
                </Form.Row>
                <Form.Group controlId="registerHandle"> 
                  <InputGroup className="mb-3">
                    <FormControl
                      placeholder='handle'
                      aria-label='handle'
                      aria-describedby="handle-ext"
                      onChange={this.handleChange}
                      name="handle"
                    />
                    <InputGroup.Append>
                      <InputGroup.Text id="handle-ext">.silamoney.eth</InputGroup.Text>
                    </InputGroup.Append>
                  </InputGroup>
                </Form.Group>
                <Form.Group controlId="registerAddress">
                  <Form.Control placeholder="Street Address" name="address" />
                </Form.Group>
                <Form.Row>
                  <Form.Group as={Col} controlId="registerCity">
                    <Form.Control placeholder="City" name="city" />
                  </Form.Group>

                  <Form.Group as={Col} controlId="registerState">
                    <Form.Control placeholder="State" name="state" />
                  </Form.Group>

                  <Form.Group as={Col} controlId="registerZip">
                    <Form.Control placeholder="Zip" name="zip" />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} controlId="registerSSN">
                    <Form.Control placeholder="SSN" name="ssn" />
                  </Form.Group>

                  <Form.Group as={Col} controlId="registerDOB">
                    <Form.Control type="date" placeholder="DOB (mm/dd/yyyy)" name="dob" />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} controlId="registerEmail">
                    <Form.Control type="email" placeholder="Email" name="email" />
                  </Form.Group>

                  <Form.Group as={Col} controlId="registerPhone">
                    <Form.Control type="phone" placeholder="Phone" name="phone" />
                  </Form.Group>
                </Form.Row>
                
                {this.state.generateWallet ? (
                <FontAwesomeIcon className="text-success" icon={faCheck} />
                ) : (
                <FontAwesomeIcon className="text-danger" icon={faTimes} />              
                )}
                <span className="btn btn-default" onClick={() => {this.toggleGenerateWallet()}}> Generate Ethereum Wallet</span>
                
                {!this.state.generateWallet ? (
                <Form.Group controlId="registerETH">
                  <Form.Control placeholder="Ethereum Address (public key)" name="crypto" />
                </Form.Group>
                ):(
                  <p>A new wallet will be automatically created for this user</p>
                )}
                <button className="btn btn-primary btn-block btn-small" disabled={!this.state.handle}>Register {this.state.handle}.silamoney.eth</button>
              </Form>
            </Section>
            
            {this.state.activeUser && this.state.activeUser.private_key &&
            <>
            <Section sectionTitle="Accounts" icon={<FontAwesomeIcon icon={faCreditCard} />}>
                <div>
                  <button className="btn btn-sm text-success float-right" onClick={() => {
                    console.log('Refreshing accounts ...');
                    sila.getAccounts(this.state.activeUser.handle, this.state.activeUser.private_key).then(res => {
                      console.log('  ... completed!');
                      console.log(Array.isArray(res));
                      if(Array.isArray(res)){
                        this.setState({responseClass: 'success', accounts: res});
                      } else {
                        this.setState({responseClass: 'error'});          
                      }
                      this.setState({response: JSON.stringify(res, null, '\t')});
                    }
                  )}
                  }>Refresh Accounts</button>
                  <PlaidLinkButton
                    buttonProps={{ className: 'btn btn-primary btn-block' }}
                    plaidLinkProps={{
                      clientName: 'Plaid Walkthrough Demo',
                      key: 'fa9dd19eb40982275785b09760ab79',
                      env: 'production',
                      product: ['auth'],
                      webhook: 'https://requestb.in',
                      onSuccess: (token, meta) => {
                        console.log('Plaid Success');
                        sila.linkAccount(this.state.activeUser.handle, this.state.activeUser.private_key, token)
                          .then(res => {
                            console.log('  ... completed!');
                              if(res.status === 'SUCCESS'){
                                this.setState({responseClass: 'success'});
                                let user = this.state.activeUser;
                                user.public_token = token;
                                let envUsers = this.state.users;
                                
                                let users = JSON.parse(localStorage.getItem('users'));
                                for (let i = 0; i < envUsers.length + 1; i++) {
                                  if (envUsers[i].handle === user.handle) {
                                    envUsers[i] = user;
                                    break;
                                  }
                                }
                                const envApp = (this.state.sandbox) ? 'sandbox' : 'live';                                
                                users[this.state.environment][envApp] = envUsers;
                                localStorage.setItem('users', JSON.stringify(users));
                                this.setState({activeUser: user, users: envUsers});
                              } else {
                                this.setState({responseClass: 'error', response: res.message});          
                              }
                              this.setState({response: JSON.stringify(res, null, '\t')});
                          }).catch((err) => {
                            console.log('  ... looks like we ran into an issue!');
                            this.handleError(err);
                          });
                      },
                    }}
                  >
                    Link an Account
                  </PlaidLinkButton>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Acct #</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.accounts ? (
                        <>
                          {this.state.accounts.length ? (
                            <>
                          {this.state.accounts.map((acct, index) => {
                            return <tr key={index}><td>{acct.account_number}</td><td>{acct.account_name}</td><td>{acct.account_type}</td><td>{acct.account_status}</td></tr>
                          })}
                            </>
                          ): (
                            <tr><td colSpan="4">No accounts found</td></tr>
                          )}
                        </>
                      ) : (
                        <tr><td colSpan="4">Refresh accounts to view</td></tr>
                      )}
                    </tbody>
                  </Table>
                </div>              
            </Section>
            
            {this.state.activeUser.public_token &&
            <Section sectionTitle="Transactions" icon={<FontAwesomeIcon icon={faHandshake} />}>
              <div>
              
              <button className="btn btn-sm text-success float-right" onClick={() => {
                  console.log('Refreshing transactions ...');
                  sila.getTransactions(this.state.activeUser.handle, this.state.activeUser.private_key).then(res => {
                    console.log('  ... completed!');
                    if(res.success){
                      this.setState({responseClass: 'success', transactions: res.transactions});
                    } else {
                      this.setState({responseClass: 'error'});          
                    }
                    this.setState({response: JSON.stringify(res, null, '\t')});
                  }
                )}
              }>
              Refresh Transactions
              </button>
              <Form autoComplete="off" onSubmit={(e) => {
                e.preventDefault();
                const amount = parseFloat(e.target.amount.value);
                if (isNaN(amount) || amount < 1000) {
                  alert('Please enter a whole number amount at least 1000');
                } else {
                  if(window.confirm(`Please confirm that you would like to convert $${amount/100} USD fom your primary linked account to ${amount} sila in your linked wallet.`)) {
                    console.log(`Issuing ${amount} sila ...`);
                    sila.issueSila(amount, this.state.activeUser.handle, this.state.activeUser.private_key).then(res => {
                      console.log('  ... completed!');
                      if (res.status === 'SUCCESS'){
                        this.setState({responseClass: 'success', transactions: res});
                      } else {
                        this.setState({responseClass: 'error'});          
                      }
                      this.setState({response: JSON.stringify(res, null, '\t')});
                    }
                    )};
                  }
                }}>
                <InputGroup className="mb-3">
                  <InputGroup.Prepend>
                    <InputGroup.Text>ISSUE</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl aria-label="Amount (to the nearest dollar)" name="amount"/>
                  <InputGroup.Append>
                    <button className="btn btn-success btn-sm">GO</button>
                  </InputGroup.Append>
                </InputGroup>
              </Form>
              
              
              <Form autoComplete="off" onSubmit={(e) => {
                e.preventDefault();
                const amount = parseFloat(e.target.amount.value);
                if (isNaN(amount) || amount < 1000) {
                  alert('Please enter a whole number amount at least 1000');
                } else {
                  if(window.confirm(`Please confirm that you would like to convert ${amount} sila from your linked wallet to $${amount/100} USD in your primary linked account`)) {
                    console.log(`Redeeming ${amount} sila ...`);
                    sila.redeemSila(amount, this.state.activeUser.handle, this.state.activeUser.private_key).then(res => {
                      console.log('  ... completed!');
                      if (res.status === 'SUCCESS'){
                        this.setState({responseClass: 'success', transactions: res});
                      } else {
                        this.setState({responseClass: 'error'});          
                      }
                      this.setState({response: JSON.stringify(res, null, '\t')});
                    }
                    )};
                  }
                }}>
                <InputGroup className="mb-3">
                  <InputGroup.Prepend>
                    <InputGroup.Text>REDEEM</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl aria-label="Amount in sila" name="amount" />
                  <InputGroup.Append>
                    <button className="btn btn-success btn-sm">GO</button>
                  </InputGroup.Append>
                </InputGroup>
              </Form>
              
              
              <Form autoComplete="off" onSubmit={(e) => {
                e.preventDefault();
                console.log('transfering ...')
                const amount = parseFloat(e.target.amount.value);
                if (isNaN(amount)) {
                  alert('Please enter a whole number');
                } else {
                  if(window.confirm(`Please confirm that you would like to transfer ${amount} sila from your linked wallet to ${e.target.destination.value}`)) {
                    console.log(`Redeeming ${amount} sila ...`);
                    sila.transferSila(amount, this.state.activeUser.handle, this.state.activeUser.private_key, e.target.destination.value)
                    .then(res => {
                      console.log('  ... completed!');
                      if (res.status === 'SUCCESS'){
                        this.setState({responseClass: 'success', transactions: res});
                      } else {
                        this.setState({responseClass: 'error'});          
                      }
                      this.setState({response: JSON.stringify(res, null, '\t')});
                    }
                    )
                  .catch(err => console.log(err))};
                  }
                }}>
                <InputGroup className="mb-3">
                  <InputGroup.Prepend>
                    <InputGroup.Text>TRANSFER</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl aria-label="Destination Handle" placeholder="destination" name="destination" />
                  <FormControl aria-label="Amount in sila" placeholder="amount" name="amount" />
                  <InputGroup.Append>
                    <button className="btn btn-success btn-sm">GO</button>
                  </InputGroup.Append>
                </InputGroup>
              </Form>
              
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.transactions ? (
                    <>
                      {this.state.transactions.length ? (
                        <>
                      {this.state.transactions.map((transaction, index) => {
                        return <tr key={index}><td>{transaction.transaction_type}</td><td>{transaction.sila_amount}</td><td>{transaction.status}</td><td>{transaction.created_epoch}</td></tr>
                      })}
                        </>
                      ): (
                        <tr><td colSpan="4">No accounts found</td></tr>
                      )}
                    </>
                  ) : (
                    <tr><td colSpan="4">Refresh accounts to view</td></tr>
                  )}
                </tbody>
              </Table>
              </div>
            </Section>
            }
            </>
            }
            
          </div>
          <div className="col">
            <Form.Group controlId="exampleForm.ControlSelect1">
              <Form.Label>Select User</Form.Label>
              <button className="btn btn-sm text-danger float-right" onClick={this.resetApp} disabled={this.state.users.length === 0}>Reset App</button>
              <Form.Control as="select" onChange={this.setActiveUser}>
                <option>Select a user ...</option>
                {this.state.users.map((user, index) => {
                  return <option key={user.handle} value={user.handle} selected={this.activeUser && user.handle === this.activeUser.handle}>{user.handle}.silamoney.eth ({user.first_name} {user.last_name})</option>
                })}
              </Form.Control>
            </Form.Group>
            {this.state.activeUser &&
              <div>
                <address>
                  <strong>{this.state.activeUser.first_name} {this.state.activeUser.last_name}</strong><br />
                  {this.state.activeUser.address}<br />
                  {this.state.activeUser.city}, {this.state.activeUser.state} {this.state.activeUser.zip}<br /><br />
                  <FontAwesomeIcon icon={faGlobe} className="text-info" /> {this.state.activeUser.crypto}<br />
                  {this.state.activeUser.private_key ? (
                    <p className="text-muted"><FontAwesomeIcon icon={faKey} className="text-info" /> Private key has been set locally</p>
                  ) : (
                    <Form onSubmit={this.setPrivateKey}>
                      <Form.Control size="sm" placeholder="Private Key" name="private_key" />
                      <button type="submit" className="btn btn-sm text-primary">Set Key</button>
                    </Form>
                  )}
                  
                  {this.state.activeUser.private_key &&
                  <>
                  <button className="btn btn-sm btn-info float-right" onClick={() => {
                   console.log('Checking Balance ...');
                   sila.getBalance(this.state.activeUser.crypto).then(res => {
                     console.log('  ... completed!');
                     if(res.status === 'SUCCESS'){
                       this.setState({responseClass: 'success', kyc: res.message});
                     } else {
                       this.setState({responseClass: 'error', kyc: res.message});          
                     }
                     this.setState({response: JSON.stringify(res, null, '\t')});
                   })
                   .catch((err) => {
                     console.log('  ... looks like we ran into an issue!');
                     this.handleError(err);
                   });
                  }
                  }>
                  Get Account Balance</button>
                  <br /><br />
                  <button className="btn btn-sm btn-info float-right" onClick={() => {
                    console.log('Requesting KYC ...');
                    sila.requestKYC(this.state.activeUser, this.state.activeUser.private_key).then(res => {
                      console.log('  ... completed!');
                      if(res.status === 'SUCCESS'){
                        this.setState({responseClass: 'success', kyc: res.message});
                      } else {
                        this.setState({responseClass: 'error', kyc: res.message});          
                      }
                      this.setState({response: JSON.stringify(res, null, '\t')});
                    })
                    .catch((err) => {
                      console.log('  ... looks like we ran into an issue!');
                      this.handleError(err);
                    });
                  }
                  }>Request KYC</button>
                  <button className="btn btn-sm btn-info float-right" onClick={() => {
                    console.log('Checking KYC ...');
                    sila.checkKYC(this.state.activeUser.handle, this.state.activeUser.private_key).then(res => {
                      console.log('  ... completed!');
                      if(res.status === 'SUCCESS'){
                        this.setState({responseClass: 'success', kyc: res.message});
                      } else {
                        this.setState({responseClass: 'error', kyc: res.message});          
                      }
                      this.setState({response: JSON.stringify(res, null, '\t')});
                    })
                    .catch((err) => {
                      console.log('  ... looks like we ran into an issue!');
                      this.handleError(err);
                    });
                  }
                  }>Check KYC</button>
                  <strong>KYC Status:</strong> {this.state.kyc}<br />
                  </>
                  }
                </address>
              </div>
            }
            <hr />
            <h2>Response</h2>
            <div className="server-response">
              <div className={this.state.responseClass}>
                <pre>{this.state.response}</pre>
              </div>
            </div>
          </div>
        </div>
        <Modal
          show={this.state.manageSettings}
          size="lg"
          aria-labelledby="manage-settings-modal-title"
          onHide={() => {this.setState({manageSettings: false})}}
        >
          <Modal.Header closeButton>
            <Modal.Title id="manage-settings-modal-title">
              Manage Settings
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              This section allows you to configure the demo app's settings:
            </p>
            {this.state.sandbox ? (
            <FontAwesomeIcon className="text-success" icon={faCheck} />
            ) : (
            <FontAwesomeIcon className="text-danger" icon={faTimes} />              
            )}
            <span className="btn btn-default" onClick={() => {this.setSandbox(!this.state.sandbox)}}> Sandbox</span>
            <hr />
            <ButtonGroup aria-label="Basic example">
              <Button
                variant={this.state.environment==="test" ? "primary" : "light"}
                onClick={() => {
                  this.setEnvironment('test')
                }}
              >
                Test
              </Button>
              <Button
                variant={this.state.environment==="stage" ? "primary" : "light"}
                onClick={() => {
                  this.setEnvironment('stage')
                }}
              >
                Stage
              </Button>
              <Button
                variant={this.state.environment==="prod" ? "primary" : "light"}
                onClick={() => {
                  this.setEnvironment('prod')
                }}
              >
                Prod
              </Button>
            </ButtonGroup>
            
            <hr></hr>
            <h4>App Credentials</h4>
            <Form autoComplete="off" onSubmit={this.setAuth}>
                <Form.Group controlId="formGroupHandle"> 
                  <InputGroup className="mb-3">
                    <FormControl
                      placeholder={this.state.auth.handle ? this.state.auth.handle : 'Auth Handle'}
                      aria-label='auth_handle'
                      name="auth_handle"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group controlId="formGroupHandle"> 
                  <InputGroup className="mb-3">
                    <FormControl
                      placeholder={this.state.auth.key ? this.state.auth.key : 'Auth Key'}
                      aria-label='auth_key'
                      name="auth_key"
                    />
                  </InputGroup>
                </Form.Group>
                <button className="btn btn-primary btn-block btn-small">Update App Authentication</button>
              </Form>
            
            
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="primary" onClick={() => {this.setState({manageSettings: false})}}>
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default App;
