import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Col, Button, Collapse, Alert, Carousel } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import stickybits from 'stickybits';

import { useAppContext } from '../context/AppDataProvider';
import { default as defaultRoutes } from '../../routes';

import AlertMessage from '../common/AlertMessage';
import Loader from '../common/Loader';
import tipIcon from '../../assets/images/tip.svg';

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

const FeedbackTip = ({clsName}) => {
  return (<p className={`${clsName} text-muted mb-0`}>As you move through the demo, helpful tips will pop up in this space. Have feedback for us? Leave your questions and comments <a href="https://forms.gle/yMifytN38TcUDed3A" target="_blank" rel="noopener noreferrer">here!</a></p>);
};

const Tips = () => {
  const location = useLocation();
  const [tipsList, setTipsList] = useState([]);

  useEffect(() => {
    setTipsList([]);
    defaultRoutes.map((RouteObj) => {
      if (RouteObj.tips && RouteObj.path === location.pathname) {
        return (RouteObj.tips && RouteObj.path === location.pathname) ? setTipsList(RouteObj.tips) : '';
      } else {
        if (RouteObj.routes) {
          return RouteObj.routes.map((RouteObj) => {
            return (RouteObj.tips && RouteObj.path === location.pathname) ? setTipsList(RouteObj.tips) : '';
          })
        } else {
          return null
        }
      }
    })
  }, [location]);

  return (
    <>
      {(tipsList.length > 0) ? <Carousel className="px-4" controls={true} indicators={false}>
        {tipsList && tipsList.map((tipLabel, tipKey) => <Carousel.Item key={tipKey}>
          <div className="d-flex align-items-center pl-5">
            <img className="ml-n5 mr-3 icon" src={tipIcon} alt={tipLabel} />
            <p className="mb-0 text-muted">{tipLabel}</p>
          </div>
        </Carousel.Item>)}
        <Carousel.Item key={tipsList.length + 1}>
          <FeedbackTip />
        </Carousel.Item>
      </Carousel> : <FeedbackTip clsName="mt-4 pt-5" />}
    </>
  );
};

const MainSidebar = () => {
  const [loading, setLoading] = useState(false);
  const { app, setAppData } = useAppContext();

  const clearResponses = (e) => {
    if (e) e.preventDefault();
    setAppData({ responses: [] });
  };

  useEffect(() => {
    stickybits('.main-sidebar .response-header', { useStickyClasses: true });
  }, []);

  return (
    <>
      <Col
        as="section"
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
          {app.responses.length > 39 && <Alert variant="warning" className="mb-4">API responses are stored in local storage and can slow down this application.  You can <Button variant="link" className="p-0 text-reset important" style={{ 'verticalAlign': 'inherit' }} onClick={clearResponses}>clear</Button> these responses to improve the experience.</Alert>}
          {app.responses.length ?
            <ul>
              {app.responses.map((response, index) => <Response response={response} index={index} onLoad={() => setLoading(true)} onLoaded={() => setLoading(false)} key={index} />)}
            </ul> : app.auth.handle ? <p>Submit a request to see the response.</p> : <AlertMessage noHide message="App Credentials are required before using this app." />}
        </div>
      </Col>
      <Col
        as="aside"
        className="tip-container d-none d-md-block px-4 border-top border-light"
        lg={{ span: 4 }}
        md={{ span: 4 }}
      >
        <h2 className="position-absolute mt-4 mb-0">Tips:</h2>
        <Tips />
      </Col>
    </>
  );
}

export default MainSidebar;
