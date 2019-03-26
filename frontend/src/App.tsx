import React, { Component } from 'react';

import Login from './views/login';
import Practice from './views/practice';

import { register, signIn } from './utils/api';

class App extends Component {

  state = {
    loggedIn: false,
    userName: '',
    regError: '',
    loginError: ''
  };

  handleSignIn = (userName: string, password: string) => {
    signIn(userName, password)
      .then((response) => {
        if (!response.data.error) {
          this.setState({loggedIn: true, userName: userName});
        } else {
          this.setState({loginError: response.data.error});
        }
      })
      .catch((error) => { 
        console.log(error); 
      })
  }

  handleRegister = (userName: string, password: string) => {
    register(userName, password)
      .then((response) => {
        if (!response.data.error) {
          this.setState({loggedIn: true, userName: userName});
        } else {
          this.setState({regError: response.data.error});
        }
      })
      .catch((error) => { 
        console.log(error); 
      })
  }

  componentDidMount() {
  }


  render() {
    return (
      this.state.loggedIn ?  <Practice/> : <Login onSignIn={this.handleSignIn} onRegister={this.handleRegister} regError={this.state.regError} loginError={this.state.loginError} />
    );
  }
}

export default App;
