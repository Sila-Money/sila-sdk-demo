import React from 'react';
import DOMPurify from 'dompurify';
import { Row, Col, Button } from 'react-bootstrap';

const AccountContextual = ({ step, title, context, onHandleClick, isTutorial=true }) => {
  return (<>
    <h2 className="text-primary">{`${step}. ${title}`}</h2>
    {context && context.map((option, index) => <p key={index} className="text-muted mb-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option.link && option.content ? option.content.replace(option.link, `<a href="${option.link}" target="_blank" rel="noopener noreferrer">${option.link}</a>`) : option.content) }}></p>)}
    {isTutorial && <>
      <img src="/video-placeholder.png" className="img-fluid" alt="Placeholder" />
      <div className="d-block d-xl-flex align-items-center mt-2 mb-2 loaded">
        <div className="ml-auto">
          <Row className="mt-2">
            <Col><Button block className="mb-2" onClick={() => onHandleClick(undefined, step)}>Next Step</Button></Col>
          </Row>
        </div>
      </div>
    </>}
  </>);
};

export default AccountContextual;