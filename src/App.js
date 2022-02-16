import React, { Fragment } from 'react';
import './App.css';
import * as Material from '@material-ui/core';
import * as Router from 'react-router-dom';
import Bytel from './bytel/Bytel';
import Pgsql from './Pgsql/Pgsql';
import Plugin from './Plugin/Plugin'
// import './Styles/dx.common.css'
// import './Styles/dx.light.css'
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
// import 'devextreme/dist/js/dx.all.js'

const utf8 = require('utf8');

const App = () => {
  //const BytelComp = Bytel(React,Router,Material, {})
  const Plg = Plugin(React,Router,Material, {})
  return (
    <Fragment>
      <Plg></Plg>
    </Fragment>
  );
}

export default App;
