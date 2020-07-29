import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { enableAllPlugins } from 'immer';

enableAllPlugins();

ReactDOM.render(<App />, document.getElementById('root'));
