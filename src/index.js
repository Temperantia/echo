import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app.jsx';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.render(pug`
  BrowserRouter
    App
`, document.getElementById('root'));
