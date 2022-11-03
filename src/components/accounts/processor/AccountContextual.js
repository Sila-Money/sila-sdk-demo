import React from 'react';
import DOMPurify from 'dompurify';
import { Button } from 'react-bootstrap';

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
    {context && context.map((option, index) => <p key={index} className="text-info mb-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option.link && option.content ? option.content.replace(option.link, `<a href="${option.link}" class="text-break" target="_blank" rel="noopener noreferrer">${option.link}</a>`) : option.content) }}></p>)}
    {isTutorial && <>
      <img src="/video-placeholder.png" className="img-fluid loaded" alt="Placeholder" />
      <div className="mt-auto loaded d-flex justify-content-end">
        <Button variant="outline-light" className="mb-2 mb-md-0" onClick={onPrev}>{step === 1 ? 'Go Back' : 'Previous'}</Button>
        <Button className="ml-0 ml-md-4" onClick={onNext}>Next Step</Button>
      </div>
    </>}
  </>);
};

export default AccountContextual;
