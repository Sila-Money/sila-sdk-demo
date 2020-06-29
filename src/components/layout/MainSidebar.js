import React, { useState } from 'react';
import classNames from 'classnames';
import { Col, Button, Collapse } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import SimpleBar from 'simplebar-react';

import { useAppContext } from '../context/AppDataProvider';

import AlertMessage from '../common/AlertMessage';

import 'simplebar/dist/simplebar.min.css';

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

const Response = ({ response, index }) => {
  const [open, setOpen] = useState(index === 0 ? true : false);
  const classes = classNames(
    response.alert ? 'response-alert' : 'response',
    open && 'open',
    index !== 0 && 'mt-2'
  );
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
  const { app, setAppData } = useAppContext();
  const classes = classNames(
    'main-sidebar',
    'p-4',
    'col-12',
    'd-none',
    'd-md-flex',
    'flex-column'
  );

  const clearResponses = () => setAppData({ responses: [] });

  return (
    <Col
      as="aside"
      className={classes}
      lg={{ span: 4 }}
      md={{ span: 4 }}
    >
      <div className="d-flex justify-content-between align-items-top mb-4">
        <h1 className="m-0">Response</h1>
        {app.responses.length !== 0 && <Button variant="link" className="p-0" onClick={clearResponses}>Clear</Button>}
      </div>
      <SimpleBar className="response-container" style={{ height: 0 }}>
        {app.responses.length ?
          <ul className="responses">
            {app.responses.map((el, i) => app.responses[app.responses.length - i - 1]).map((response, index) => <Response response={response} index={index} key={index} />)}
          </ul> : app.auth.handle ? <p>Submit a request to see the response.</p> : <AlertMessage noHide message="App Credentials are required before using this app." />}
      </SimpleBar>
    </Col>
  );
}

export default MainSidebar;
