import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import AppDataProvider from './components/context/AppDataProvider';
import * as serviceWorker from './serviceWorker';

import './assets/styles/demo.scss';

ReactDOM.render((
  <AppDataProvider>
    <Router>
      <App />
    </Router>
  </AppDataProvider>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
