import React from 'react';
import DOMPurify from 'dompurify';
import { Row, Col, Button } from 'react-bootstrap';

import { plaidTutorialSteps } from '../../../constants/plaidGenerateProcessor';

const AccountContextual = ({ step, title, context, isTutorial, onHandleClick, onTabKey }) => {
  const onNext = () => {
    if (plaidTutorialSteps.length === step) onHandleClick('tutorial', step);
    else onHandleClick(undefined, step);
  }

  const onPrev = () => {
    if (step === 1) onHandleClick('goBack');
    else onTabKey(step-2);
  }

  return (<>
    <h2 className="text-primary">{`${step}. ${title}`}</h2>
    {context && context.map((option, index) => <p key={index} className="text-muted mb-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option.link && option.content ? option.content.replace(option.link, `<a href="${option.link}" class="text-break" target="_blank" rel="noopener noreferrer">${option.link}</a>`) : option.content) }}></p>)}
    {isTutorial && <>
      <img src="/video-placeholder.png" className="img-fluid" alt="Placeholder" />
      <div className="mt-2 mb-2 loaded">
        <Row className="mt-2 justify-content-end">
          <Col lg="12" xl="3"><Button block variant="outline-light" className="mb-2" onClick={onPrev}>{step === 1 ? 'Go Back' : 'Previous'}</Button></Col>
          <Col lg="12" xl="3"><Button block className="mb-2" onClick={onNext}>Next Step</Button></Col>
        </Row>
      </div>
    </>}
  </>);
};

export default AccountContextual;
