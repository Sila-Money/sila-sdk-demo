import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { usePlaidLink } from 'react-plaid-link';

import { useAppContext } from '../context/AppDataProvider';
import plaidApi from '../../api/plaid';

export const PlaidSilaAccount = ({ step, title, onHandleClick }) => {
  return (<>
    <h2 className="text-primary">{`${step}. ${title}`}</h2>
    <p className="text-muted mb-3">In order to use the Plaid + Sila integration, a user must have accounts at both Plaid and Sila. If you already have your Plaid account and have enabled it for integration, click the "I have a Plaid Account" option. If you do not have your own account with sandbox credentials, click "Create Plaid Account".</p>
    <div className="mb-2 loaded">
      <div className="">
        <Row className="mt-2 justify-content-end">
          <Col lg="12" xl="4"><Button onClick={() => onHandleClick('signup')} block className="mb-2">Create Plaid Account</Button></Col>
          <Col lg="12" xl="4"><Button onClick={() => onHandleClick('havePlaidAccount')} block className="mb-2">I have a Plaid Account</Button></Col>
          <Col lg="12" xl="2"><Button variant="outline-light" block onClick={() => onHandleClick('accounts')}>Cancel</Button></Col>
        </Row>
      </div>
    </div>
  </>);
};

export const AccountContextual = ({ step, title, context, onHandleClick, isTutorial=true }) => {
  return (<>
    <h2 className="text-primary">{`${step}. ${title}`}</h2>
    {context && context.map((option, index) => <p key={index} className="text-muted mb-3" dangerouslySetInnerHTML={{ __html: option.link && option.content ? option.content.replace(option.link, `<a href="${option.link}" class="text-break" target="_blank" rel="noopener noreferrer">${option.link}</a>`) : option.content }}></p>)}
    {isTutorial && <>
      <img src="/video-placeholder.png" className="img-fluid" alt="Placeholder" />
      <div className="mt-2 mb-2 loaded">
        <div className="">
          <Row className="mt-2 justify-content-end">
            <Col lg="12" xl="3"><Button block className="mb-2" onClick={() => onHandleClick(undefined, step)}>Next Step</Button></Col>
            {step === 1 && <Col lg="12" xl="3"><Button block variant="outline-light" className="mb-2" onClick={() => onHandleClick('goBack')}>Go Back</Button></Col>}
          </Row>
        </div>
      </div>
    </>}
  </>);
};

export const CreateLinkToken = ({ step, title, context, onHandleClick, onLinkToken, onLoaded }) => {
  const { app, setAppData, updateApp } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(false);
  const [authCredentials, setAuthCredentials] = useState({
    clientId: Cookies.get('sila_demo_clientId') || undefined,
    secretKey: Cookies.get('sila_demo_secretKey') || undefined
  });

  const linkTokenCreate = async (e) => {
    console.log('createlinkToken ... ');
    e.preventDefault();
    let isValidated = true;
    let validationErrors = {};
    if (e.target.clientId && e.target.clientId.value) e.target.clientId.value = e.target.clientId.value.trim();
    if (e.target.secretKey && e.target.secretKey.value) e.target.secretKey.value = e.target.secretKey.value.trim();
    if (e.target.clientId && !e.target.clientId.value) {
      isValidated = false;
      validationErrors = Object.assign({clientId: "This field may not be blank."}, validationErrors);
    }
    if (e.target.secretKey && !e.target.secretKey.value) {
      isValidated = false;
      validationErrors = Object.assign({secretKey: "This field may not be blank."}, validationErrors);
    }
    if (!isValidated) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    setAuthCredentials({ ...authCredentials, clientId: e.target.clientId.value, secretKey: e.target.secretKey.value });
    Cookies.set('sila_demo_clientId', e.target.clientId.value);
    Cookies.set('sila_demo_secretKey', e.target.secretKey.value);

    try {
      onLoaded(false);
      let result = {};
      const response = await plaidApi.createLinkToken({
        'client_name': 'Sila Demo',
        'country_codes': ['US'],
        'language': 'en',
        'user': {
          'client_user_id': app.activeUser.handle
        },
        'products': ['auth']
      });

      if (response && response.status === 200 && response.data && response.data.link_token) {
        result.alert = {};
        onLinkToken(response.data.link_token);
        onHandleClick(undefined, step);
      } else {
        result.alert = { message: response.data ? response.data.error_message : 'Something wrong!', type: 'danger' };
      }

      setAppData({
        responses: [{
          endpoint: '/link/token/create',
          result: JSON.stringify(response, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (error) {
      console.log(error);
    }
    setValidated(true);
    onLoaded(true);
  };

  return (<>
    <AccountContextual step={step} title={title} context={context} onHandleClick={onHandleClick} isTutorial={false} />
    <Form noValidate validated={validated} autoComplete="off" onSubmit={linkTokenCreate}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="clientId">Client ID</Form.Label>
        <Form.Control autoFocus required id="clientId" placeholder="client_id" aria-label="Client ID" name="clientId" defaultValue={authCredentials.clientId ? authCredentials.clientId : undefined} isInvalid={Boolean(errors && errors.clientId)} />
        {errors && errors.clientId && <Form.Control.Feedback type="invalid">{errors.clientId}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="secretKey">Secret Key</Form.Label>
        <Form.Control required id="secretKey" placeholder="secret_key" aria-label="Secret Key" name="secretKey" defaultValue={authCredentials.secretKey ? authCredentials.secretKey : undefined} isInvalid={Boolean(errors && errors.secretKey)} />
        {errors && errors.secretKey && <Form.Control.Feedback type="invalid">{errors.secretKey}</Form.Control.Feedback>}
      </Form.Group>

      <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
        <div className="ml-auto">
          <Row className="mt-2">
            <Col><Button block className="mb-2" type="submit">Generate Link Token</Button></Col>
          </Row>
        </div>
      </div>
    </Form>
  </>);
};

const PlaidButton = ({ linkToken, onSuccess }) => {
  const { app, updateApp } = useAppContext();
  const activeUser = app.settings.flow === 'kyb' ? app.users.find(user => app.settings.kybHandle === user.handle) : app.activeUser;
  const { open, ready, error } = usePlaidLink({
    clientName: 'Plaid Walkthrough Demo',
    env: 'sandbox',
    product: ['auth'],
    language: 'en',
    userLegalName: app.settings.kybHandle ? app.settings.kybHandle : `${activeUser.firstName} ${activeUser.lastName}`,
    userEmailAddress: activeUser.email,
    token: linkToken,
    onSuccess: (token, metadata) => onSuccess(token, metadata)
  });

  const onOpen = () => {
    if (activeUser && !activeUser.email) {
      updateApp({ alert: { message: 'Email address is required to Launch Plaid Link. please add your email from the Registered User page.', type: 'warning' } });
      return;
    }
    open();
  }

  useEffect(() => {
    if (error) updateApp({ alert: { message: error, type: 'danger' } });
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Button block className="mb-2 text-nowrap" onClick={onOpen} disabled={!ready}>Launch Plaid Link</Button>;
};

export const GeneratePublicToken = ({ step, title, context, allPlaidTokens, onHandleClick, onPublicToken }) => {
  const publicToken = (pubToken, metadata) => {
    onPublicToken(pubToken, metadata.account.name, metadata.account_id);
    onHandleClick(undefined, step);
  };

  return (<>
    <AccountContextual step={step} title={title} context={context} onHandleClick={onHandleClick} isTutorial={false} />
    <Form noValidate validated={false} autoComplete="off">
      <Form.Group className="mb-3">
        <Form.Label htmlFor="linkToken">Link Token</Form.Label>
        <Form.Control readOnly id="linkToken" placeholder="Link Token" aria-label="Link Token" name="linkToken" defaultValue={allPlaidTokens.linkToken ? allPlaidTokens.linkToken : undefined} />
      </Form.Group>
    </Form>
    
    <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
      <div className="ml-auto">
        <Row className="mt-2">
          <Col><PlaidButton linkToken={allPlaidTokens.linkToken} onSuccess={publicToken} /></Col>
        </Row>
      </div>
    </div>
  </>);
};

export const GenerateAccessToken = ({ step, title, context, allPlaidTokens, onHandleClick, onAccessToken, onLoaded }) => {
  const { app, setAppData, updateApp } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(false);

  const createAccessToken = async (e) => {
    console.log('exchangeToken ... ');
    e.preventDefault();
    let isValidated = true;
    let validationErrors = {};
    if (!allPlaidTokens.publicToken) {
      isValidated = false;
      validationErrors = Object.assign({publicToken: "This field may not be blank."}, validationErrors);
    }
    if (!isValidated) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    try {
      onLoaded(false);
      let result = {};
      const response = await plaidApi.exchangeToken({'public_token': allPlaidTokens.publicToken});

      if (response && response.status === 200 && response.data && response.data.access_token) {
        result.alert = {};
        onAccessToken(response.data.access_token);
        onHandleClick(undefined, step);
      } else {
        result.alert = { message: response.data ? response.data.error_message : 'Something wrong!', type: 'danger' };
      }

      setAppData({
        responses: [{
          endpoint: '/item/public_token/exchange',
          result: JSON.stringify(response, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (error) {
      console.log(error);
    }
    setValidated(true);
    onLoaded(true);
  };

  return (<>
    <AccountContextual step={step} title={title} context={context} onHandleClick={onHandleClick} isTutorial={false} />
    <Form noValidate validated={validated} autoComplete="off" onSubmit={createAccessToken}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="publicToken">Public Token</Form.Label>
        <Form.Control readOnly id="publicToken" placeholder="Public Token" aria-label="Public Token" name="publicToken" defaultValue={allPlaidTokens.publicToken ? allPlaidTokens.publicToken : undefined} isInvalid={Boolean(errors && errors.publicToken)} />
        {errors && errors.publicToken && <Form.Control.Feedback type="invalid">{errors.publicToken}</Form.Control.Feedback>}
      </Form.Group>
    
      <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
        <div className="ml-auto">
          <Row className="mt-2">
          <Col><Button block className="mb-2" type="submit">Generate an Access Token</Button></Col>
          </Row>
        </div>
      </div>
    </Form>
  </>);
};

export const RetrieveAccountCredentials = ({ step, title, context, allPlaidTokens, onHandleClick, onProcessorToken, onLoaded }) => {
  const { app, setAppData, updateApp } = useAppContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(false);
  const DEFAULT_PROCESSOR_NAME = 'sila_money';

  const createProcessorToken = async (e) => {
    console.log('createProcessorToken ... ');
    e.preventDefault();
    let isValidated = true;
    let validationErrors = {};
    if (!allPlaidTokens.accessToken) {
      isValidated = false;
      validationErrors = Object.assign({accessToken: "This field may not be blank."}, validationErrors);
    }
    if (!allPlaidTokens.accountId) {
      isValidated = false;
      validationErrors = Object.assign({accountId: "This field may not be blank."}, validationErrors);
    }
    if (e.target.processorName && e.target.processorName.value) e.target.processorName.value = e.target.processorName.value.trim();
    if (e.target.processorName && !e.target.processorName.value) {
      isValidated = false;
      validationErrors = Object.assign({processorName: "This field may not be blank."}, validationErrors);
    }
    if (!isValidated) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    try {
      onLoaded(false);
      let result = {};
      const response = await plaidApi.createProcessorToken({
        'accessToken': allPlaidTokens.accessToken,
        'accountID': allPlaidTokens.accountId,
        'processor': e.target.processorName.value
      });

      if (response && response.status === 200 && response.data && response.data.processor_token) {
        result.alert = {};
        onProcessorToken(response.data.processor_token);
        onHandleClick(undefined, step);
      } else {
        result.alert = { message: response.data ? response.data.error_message : 'Something wrong!', type: 'danger' };
      }

      setAppData({
        responses: [{
          endpoint: '/processor/token/create',
          result: JSON.stringify(response, null, '\t')
        }, ...app.responses]
      }, () => {
        updateApp({ ...result });
      });
    } catch (error) {
      console.log(error);
    }
    setValidated(true);
    onLoaded(true);
  };

  return (<>
    <AccountContextual step={step} title={title} context={context} onHandleClick={onHandleClick} isTutorial={false} />
    <Form noValidate validated={validated} autoComplete="off" onSubmit={createProcessorToken}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="accessToken">Access Token</Form.Label>
        <Form.Control readOnly id="accessToken" placeholder="Access Token" aria-label="Access Token" name="accessToken" defaultValue={allPlaidTokens.accessToken ? allPlaidTokens.accessToken : undefined} isInvalid={Boolean(errors && errors.accessToken)} />
        {errors && errors.accessToken && <Form.Control.Feedback type="invalid">{errors.accessToken}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="accountId">Account ID</Form.Label>
        <Form.Control required id="accountId" placeholder="Account ID" aria-label="Account ID" name="accountId" defaultValue={allPlaidTokens.accountId ? allPlaidTokens.accountId : undefined} isInvalid={Boolean(errors && errors.accountId)} />
        {errors && errors.accountId && <Form.Control.Feedback type="invalid">{errors.accountId}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="processorName">Processor</Form.Label>
        <Form.Control required id="processorName" placeholder="Processor" aria-label="Processor" name="processorName" defaultValue={DEFAULT_PROCESSOR_NAME} isInvalid={Boolean(errors && errors.processorName)} />
        {errors && errors.processorName && <Form.Control.Feedback type="invalid">{errors.processorName}</Form.Control.Feedback>}
      </Form.Group>
    
      <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
        <div className="ml-auto">
          <Row className="mt-2">
          <Col><Button block className="mb-2" type="submit">Retrieve Credentials</Button></Col>
          </Row>
        </div>
      </div>
    </Form>
  </>);
};

export const LinkProcessorToken = ({ step, title, context, allPlaidTokens, onHandleClick, linkAccount }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(false);

  const linkProcessorToken = async (e) => {
    console.log('linkAccount ... ');
    e.preventDefault();
    let isValidated = true;
    let validationErrors = {};
    if (!allPlaidTokens.processorToken) {
      isValidated = false;
      validationErrors = Object.assign({processorToken: "This field may not be blank."}, validationErrors);
    }
    if (!isValidated) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    linkAccount(allPlaidTokens.processorToken, {
      account_name: e.target.accountName.value.trim(),
      account_id: allPlaidTokens.accountId
    }, 'processor');
    setValidated(true);
  };

  return (<>
    <AccountContextual step={step} title={title} context={context} onHandleClick={onHandleClick} isTutorial={false} />
    <Form noValidate validated={validated} autoComplete="off" onSubmit={linkProcessorToken}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="accountName">Account Name</Form.Label>
        <Form.Control id="accountName" placeholder="Optional" aria-label="Optional" name="accountName" />
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="processorToken">Processor Token</Form.Label>
        <Form.Control required readOnly id="processorToken" placeholder="Processor Token" aria-label="Processor Token" name="processorToken" defaultValue={allPlaidTokens.processorToken ? allPlaidTokens.processorToken : undefined} isInvalid={Boolean(errors && errors.processorToken)} />
        {errors && errors.processorToken && <Form.Control.Feedback type="invalid">{errors.processorToken}</Form.Control.Feedback>}
      </Form.Group>
    
      <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
        <div className="ml-auto">
          <Row className="mt-2">
          <Col><Button block className="mb-2" type="submit">Link bank account</Button></Col>
          </Row>
        </div>
      </div>
    </Form>
  </>);
};

const COMMON_CONTENT_AND_LINKS = [{
  'plaidSila' : [{
        content: 'In order to use the Plaid + Sila integration, a user must have accounts at both Plaid and Sila. You may follow the links below to begin this process. You may also watch a tutorial below on how to accomplish both tasks. When both tasks are complete, you may go to the next step.',
      },
      {
        link: 'https://dashboard.plaid.com/signup',
        content: 'To open an account with Plaid, go here: https://dashboard.plaid.com/signup',
      },
      {
        link: 'https://console.silamoney.com/register',
        content: 'To open an account with Sila, go here: https://console.silamoney.com/register',
    }
  ],
  'linkToken' : [{
        content: 'A link_token is a short-lived, one-time use token that is used to authenitcate your app with Plaid Link. You will need to form the request with your client_id, secret, and a few other required parameters from your Plaid sandbox environment. Please input your client_id and secret below to authenticate the API request and generate a link token. These credentials are held locally and are completely secure.',
      },
      {
        link: 'https://plaid.com/docs/api/tokens/#linktoken',
        content: 'To learn more about link tokens, go here: https://plaid.com/docs/api/tokens/#linktoken',
      },
      {
      link: 'https://dashboard.plaid.com/team/keys',
      content: 'To see your client ID and secret, go here: https://dashboard.plaid.com/team/keys',
    }
  ],
  'publicToken' : [{
        content: 'To generate a public token, you must integrate with Plaid Link. Initialize Link by passing in the link_token you just generated. When the Link flow is completed, Link will pass back a public_token via the onSuccess callback.',
      },
      {
        link: 'https://plaid.com/docs/link/',
        content: 'For more information on initializing and receiving data back from Link, see the Link documentation here: https://plaid.com/docs/link/',
    }
  ],
  'accesssToken': [{
      content: "The public token, which you can see in the response body, was generated by Plaid Link. To call Plaid's Exchange Token endpoint, also known as the Access Token, you must pass through the public token and account ID to generate an Access Token.",
    },
    {
      link: 'https://plaid.com/docs/api/tokens/#itempublic_tokenexchange',
      content: 'Learn more about exchanging pubic tokens for access tokens here: https://plaid.com/docs/api/tokens/#itempublic_tokenexchange',
    }
  ],
  'retrieveAccountCredentials': [{
      content: "In addition to a public_token, Plaid Link will also return an accounts array. The accounts array will contain information about bank accounts associated with the credentials entered by the user. In order to create a processor token, you will need to pass in the access token you just generated, along with the account ID. A processor is also needed, which is provided below.",
    },
    {
      link: 'https://dashboard.plaid.com/link/account-select',
      content: 'Learn more about the accounts array here: https://dashboard.plaid.com/link/account-select',
    }
  ],
  'processorToken': [{
      content: "Congratulations! You have successfully generated your processor token, which has been returned by the Plaid API. All that's left to do is provide a name, and link the bank account!",
    },
    {
      link: 'https://plaid.com/docs/api/processors/#processortokencreate',
      content: 'Learn more about this process here: https://plaid.com/docs/api/processors/#processortokencreate',
    }
  ]
}];

export const plaidSignUpSteps = [{
    title: 'Plaid + Sila Account',
    disabled: false,
    context: COMMON_CONTENT_AND_LINKS[0]['plaidSila'],
    component: AccountContextual
  },
  {
    title: 'Enable Plaid account for integration',
    disabled: true,
    context: [{
        link: 'https://dashboard.plaid.com/team/integrations',
        content: 'You must enable your Plaid account for the integration, to do this you must go to https://dashboard.plaid.com/team/integrations',
      },
      {
        content: 'If the Sila integration is off, simply click the “Enable” button for Sila to enable to the partner integration. You may watch the tutorial below to see how to accomplish this task.',
    }],
    component: AccountContextual
  },
  {
    title: 'Complete Plaid Application Profile',
    disabled: true,
    context: [{
        content: 'Before you are able to link any bank accounts, you will need to provide Plaid with some basic information about your app, such as your company name and website. Some banks require this information before you can connect to them. This step also helps your end-users learn more about how your product uses their banking information. You may follow the link below to begin this process. You may also watch the tutorial on how to accomplish this task.',
      },
      {
        link: 'https://dashboard.plaid.com/team/application',
        content: 'To complete the Plaid Application Profile, go here: https://dashboard.plaid.com/team/application.',
    }],
    component: AccountContextual
  },
  {
    title: 'Create a Link Token',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['linkToken'],
    component: CreateLinkToken
  },
  {
    title: 'Generate a Public Token',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['publicToken'],
    component: GeneratePublicToken,
  },
  {
    title: 'Generate an Accesss Token',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['accesssToken'],
    component: GenerateAccessToken,
  },
  {
    title: 'Retrieve Account ID and credentials',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['retrieveAccountCredentials'],
    component: RetrieveAccountCredentials,
  },
  {
    title: 'Link via Processor Token',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['processorToken'],
    component: LinkProcessorToken,
  }
];

export const havePlaidAccountSteps = [{
    title: 'Plaid + Sila Account',
    disabled: false,
    context: COMMON_CONTENT_AND_LINKS[0]['plaidSila'],
    component: AccountContextual
  },
  {
    title: 'Create a Link Token',
    disabled: false,
    context: COMMON_CONTENT_AND_LINKS[0]['linkToken'],
    component: CreateLinkToken
  },
  {
    title: 'Generate a Public Token',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['publicToken'],
    component: GeneratePublicToken,
  },
  {
    title: 'Generate an Accesss Token',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['accesssToken'],
    component: GenerateAccessToken,
  },
  {
    title: 'Retrieve Account ID and credentials',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['retrieveAccountCredentials'],
    component: RetrieveAccountCredentials,
  },
  {
    title: 'Link via Processor Token',
    disabled: true,
    context: COMMON_CONTENT_AND_LINKS[0]['processorToken'],
    component: LinkProcessorToken,
  }
];
