import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Col, Button, Collapse } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import stickybits from 'stickybits';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from '../common/AlertMessage';
import Loader from '../common/Loader';

const syntaxTheme = {
  "code[class*=\"language-\"]": {
    "direction": "ltr",
    "textAlign": "left",
    "wordSpacing": "normal",
    "wordBreak": "normal",
    "fontSize": "0.95em",
    "lineHeight": "1.2em",
    "MozTabSize": "2",
    "OTabSize": "2",
    "tabSize": "2",
    "WebkitHyphens": "none",
    "MozHyphens": "none",
    "msHyphens": "none",
    "hyphens": "none"
  },
  "punctuation": {
    "color": "#898989"
  },
  "property": {
    "color": "#898989"
  },
  "string": {
    "color": "#3F63F7"
  },
  "boolean": {
    "color": "#1F3178"
  },
  "number": {
    "color": "#1F3178"
  }
};

const Response = ({ response, index, onLoad, onLoaded }) => {
  const [open, setOpen] = useState(index === 0 ? true : false);
  const classes = classNames(
    response.alert ? 'response-alert' : 'response',
    open && 'open',
    index !== 0 && 'mt-2'
  );

  useEffect(() => {
    let timer;
    onLoad();
    timer = setTimeout(() => {
      onLoaded();
    }, 500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <li className={classes}>
      {response.endpoint && <p onClick={() => setOpen(!open)} className="mb-1 endpoint font-weight-bold loaded">From endpoint {response.endpoint}:</p>}
      <Collapse in={open}>
      {response.alert ? <AlertMessage noHide message={response.message} style={response.style} /> : response.result ?
        <SyntaxHighlighter
          className="result loaded"
          language="json"
          style={syntaxTheme}
          customStyle={{ background: 'transparent', padding: 0, whiteSpace: 'pre-wrap' }}
          wrapLines={true}>
          {response.result}
        </SyntaxHighlighter> : <span>{response}</span>}
      </Collapse>
    </li>
  );
};

const MainSidebar = () => {
  const [loading, setLoading] = useState(false);
  const { app, setAppData } = useAppContext();

  const clearResponses = () => setAppData({ responses: [] });

  useEffect(() => {
    stickybits('.main-sidebar .response-header', { useStickyClasses: true });
  }, []);

  return (
    <Col
      as="aside"
      className="main-sidebar col-12 d-none d-md-flex flex-column overflow-auto"
      lg={{ span: 4 }}
      md={{ span: 4 }}
    >
      {loading && <Loader />}
      <div className="response-header d-flex justify-content-between align-items-top p-4">
        <h1 className="m-0">Response</h1>
        {app.responses.length !== 0 && <Button variant="link" className="p-0" onClick={clearResponses}>Clear</Button>}
      </div>
      <div className="response-results pb-4 px-4">
        {app.responses.length ?
          <ul>
            {app.responses.map((response, index) => <Response response={response} index={index} onLoad={() => setLoading(true)} onLoaded={() => setLoading(false)} key={index} />)}
          </ul> : app.auth.handle ? <p>Submit a request to see the response.</p> : <AlertMessage noHide message="App Credentials are required before using this app." />}
      </div>
    </Col>
  );
}

export default MainSidebar;
