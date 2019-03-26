import React, { Component } from 'react';

import Login from './views/login';
import Practice from './views/practice';

import { register } from './utils/api';

class App extends Component {

  state = {
    loggedIn: false,
  };

  handleSignIn = (userName: string, password: string) => {
    this.setState({loggedIn: true})
  }

  handleRegister = (userName: string, password: string) => {
    register(userName, password).then((response) => {console.log(response); }).catch((error) => { console.log(error); })
    //this.setState({loggedIn: true})
  }

  componentDidMount() {
  }


  render() {
    return (
      this.state.loggedIn ?  <Practice/> : <Login onSignIn={this.handleSignIn} onRegister={this.handleRegister}/>
    );
  }
}

export default App;
