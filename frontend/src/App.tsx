import React, { Component } from 'react';
import Cookies from 'universal-cookie';

import Login from './views/login';
import Practice from './views/practice';

import { register, signIn } from './utils/api';

class App extends Component {

  Cookies = new Cookies();

  state = {
    loggedIn: false,
    sessionId: '',
    userName: '',
    regError: '',
    loginError: ''
  };

  handleSignIn = (userName: string, password: string) => {
    signIn(userName, password)
      .then((response) => {
        if (!response.data.error) {
          this.setState({userName: userName, loggedIn: true, sessionId: this.Cookies.get('session')});
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
          this.setState({userName: userName, loggedIn: true, sessionId: this.Cookies.get('session')});
        } else {
          this.setState({regError: response.data.error});
        }
      })
      .catch((error) => { 
        console.log(error); 
      })
  }

  componentDidMount() {
    const sessionId: string = this.Cookies.get('session');
    this.setState({ sessionId: sessionId, loggedIn: sessionId ? true : false });
  }

  render() {
    return (
      this.state.loggedIn ?  <Practice/> : <Login onSignIn={this.handleSignIn} onRegister={this.handleRegister} regError={this.state.regError} loginError={this.state.loginError} />
    );
  }
}

export default App;
