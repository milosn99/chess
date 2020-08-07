import React from 'react';
import './bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Login from "./components/Login";
import Logic from "./components/Logic";

class App extends React.Component{

  render() {
     return (<Router>

      <div className="App">

          <div className="auth-wrapper">
            <div className="auth-inner">
              <Switch>
                <Route exact path='/' component={Login} />
                <Route path="/game" component={(props) => <Logic {...props}/>} />
              </Switch>
            </div>
          </div>

        </div>

      </Router>
    );
  }
}

export default App;
