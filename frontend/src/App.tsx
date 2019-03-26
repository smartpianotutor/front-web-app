import React, { Component } from 'react';
import Cookies from 'universal-cookie';

import Login from './views/login';
import Practice from './views/practice';

import { register, signIn } from './utils/api';

class App extends Component {

  Cookies = new Cookies();

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
          this.Cookies.set('loggedIn', true, { expires: new Date(new Date().getTime() + 60 * 60000) })
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
          this.Cookies.set('loggedIn', true, { expires: new Date(new Date().getTime() + 60 * 60000) })
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
    this.setState({ loggedIn: this.Cookies.get('loggedIn') });
  }

  render() {
    return (
      this.state.loggedIn ?  <Practice/> : <Login onSignIn={this.handleSignIn} onRegister={this.handleRegister} regError={this.state.regError} loginError={this.state.loginError} />
    );
  }
}

export default App;
