import React, { Component } from 'react';

import Login from './views/login';
import Practice from './views/practice';

class App extends Component {

  state = {
    loggedIn: false,
  };

  handleSignIn = (userName: string, password: string) => {
    this.setState({loggedIn: true})
  }

  handleRegister = (userName: string, password: string) => {
    this.setState({loggedIn: true})
  }


  render() {
    return (
      this.state.loggedIn ?  <Practice/> : <Login onSignIn={this.handleSignIn} onRegister={this.handleRegister}/>
    );
  }
}

export default App;
