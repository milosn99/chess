import React from 'react';
import './bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Login from "./components/Login";

function App() {
  return (<Router>
    <div className="App">

      <div className="auth-wrapper">
        <div className="auth-inner">
          <Switch>
            <Route exact path='/' component={Login} />
            <Route path="/sign-in" component={Login} />
          </Switch>
        </div>
      </div>
    </div></Router>
  );
}

export default App;
