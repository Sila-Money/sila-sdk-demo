import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

import AccountContextual from './AccountContextual';

import { COMMON_CONTENT_AND_LINKS } from '../../../constants/plaidGenerateProcessor';

const LinkProcessorToken = ({ step, title, context, isTutorial, isDemoLinkProcessorPage, allPlaidTokens, onHandleClick, linkAccount, onTabKey }) => {
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(false);

  const linkProcessorToken = async (e) => {
    console.log('linkAccount ... ');
    e.preventDefault();
    if (isDemoLinkProcessorPage) {
      linkAccount(allPlaidTokens.processorToken, {
        account_name: e.target.accountName.value.trim(),
        account_id: allPlaidTokens.accountId
      }, 'demo');
    } else {
      let isValidated = true;
      let validationErrors = {};
      if (!allPlaidTokens.processorToken) {
        isValidated = false;
        validationErrors = { ...validationErrors, processorToken: "This field may not be blank." };
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
    }
    setValidated(true);
  };

  return (<>
    <AccountContextual step={step} title={isTutorial && isDemoLinkProcessorPage ? 'Processor Token Created!' : title} context={isTutorial && isDemoLinkProcessorPage ? COMMON_CONTENT_AND_LINKS[0]['tutorialProcessorTokenCreated'] : context} isTutorial={isTutorial && isDemoLinkProcessorPage ? false : isTutorial} onHandleClick={onHandleClick} />

    {!isTutorial && !isDemoLinkProcessorPage && <Form noValidate validated={validated} autoComplete="off" onSubmit={linkProcessorToken}>
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
    </Form>}

    {isTutorial && isDemoLinkProcessorPage && <Form noValidate validated={validated} autoComplete="off" onSubmit={linkProcessorToken}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="accountName">Account Name</Form.Label>
        <Form.Control id="accountName" placeholder="Optional" aria-label="Optional" name="accountName" defaultValue="Bank Account 1" />
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="processorToken">Processor Token</Form.Label>
        <Form.Control required readOnly id="processorToken" placeholder="Processor Token" aria-label="Processor Token" name="processorToken" defaultValue="processor-123-456" />
      </Form.Group>

      <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
        <div className="ml-auto">
          <Row className="mt-2">
          <Col><Button block className="mb-2" type="submit">Link bank account</Button></Col>
          </Row>
        </div>
      </div>
    </Form>}
  </>);
};

export default LinkProcessorToken;