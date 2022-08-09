import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Col, Button, Collapse, Alert, Carousel } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import stickybits from 'stickybits';

import { useAppContext } from '../context/AppDataProvider';
import { default as defaultRoutes } from '../../routes';
import useCurrentDimensions from '../../utils/hooks/useCurrentDimensions';

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

  useEffect(() => {
    let timer;
    onLoad();
    timer = setTimeout(() => {
      onLoaded();
    }, 500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <li className={classNames(
      'position-relative',
      response.alert ? 'response-alert' : 'response',
      open && 'open',
      index !== 0 && 'mt-2'
    )}>
      {response.endpoint && <Button variant="link" onClick={() => setOpen(!open)} className={classNames('mb-1 endpoint font-weight-bold p-0 no-underline loaded', open ? 'text-primary' : 'text-info-link')}><i class={`fas fa-arrow-alt-circle-${open ? 'up' : 'down'} mr-2`}></i> From endpoint {response.endpoint}:</Button>}
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

const FeedbackTip = () => {
  return (<p className="text-info mb-0">As you move through the demo, helpful tips will pop up in this space. Have feedback for us? Leave your questions and comments <a href="https://forms.gle/yMifytN38TcUDed3A" target="_blank" rel="noopener noreferrer">here!</a></p>);
};

const Tips = () => {
  const location = useLocation();
  const [tipsList, setTipsList] = useState([]);
  const [height, setHeight] = useState(false);
  const itemsRef = useRef([]);
  const currentWidth = useCurrentDimensions().width;

  useEffect(() => {
    const arrayList = [];
    const lists = itemsRef.current;
    if (lists.length) {
      for (let i = 0; i < lists.length; i++) {
        if (lists[i]) {
          var eachList = lists[i].clientHeight;
          arrayList.push(eachList);
          setHeight(Math.max.apply(null, arrayList) + 50);
        }
      }
    }
  }, [currentWidth, itemsRef]);

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
      {(tipsList.length > 0) ? <Carousel style={height ? { height } : undefined} controls={true} indicators={false} interval={null}>
        {tipsList && tipsList.map((tipLabel, tipKey) => <Carousel.Item key={tipKey} ref={(el) => itemsRef.current.splice(0, 1, el)}>
          <div className="d-flex align-items-center pl-5">
            <img className="ml-n5 mr-3 icon" src={tipIcon} alt={tipLabel} />
            <p className="mb-0 text-info">{tipLabel}</p>
          </div>
        </Carousel.Item>)}
        <Carousel.Item key={tipsList.length + 1} ref={(el) => itemsRef.current.splice(0, 1, el)}>
          <FeedbackTip />
        </Carousel.Item>
      </Carousel> : <FeedbackTip />}
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
        className="main-sidebar col-12 d-none d-md-flex flex-column overflow-auto custom-scrollbar border-left"
        lg={{ span: 4 }}
        md={{ span: 4 }}
      >
        {loading && <Loader />}
        <div className="response-header d-flex justify-content-between align-items-top p-4">
          <h2 className="m-0">Response</h2>
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
        className="tip-container d-none d-md-block px-4 border-top border-left"
        lg={{ span: 4 }}
        md={{ span: 4 }}
      >
        <h2 className="mt-4 mb-4">Tips:</h2>
        <Tips />
      </Col>
    </>
  );
}

export default MainSidebar;
