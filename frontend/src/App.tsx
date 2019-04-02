import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Login from './views/login';
import Practice from './views/practice';

import { register, signIn, signOut } from './utils/api';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#cdf9e2',
    }
  }
})

class App extends Component {

  Cookies = new Cookies();

  state = {
    loggedIn: false,
    sessionId: '',
    userName: '',
    regError: '',
    loginError: '',
    signOutError: ''
  };

  handleSignIn = (userName: string, password: string) => {
    signIn(userName, password)
      .then((response) => {
        if (!response.data.error) {
          this.Cookies.set('username', userName);
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
          this.Cookies.set('username', userName);
          this.setState({userName: userName, loggedIn: true, sessionId: this.Cookies.get('session')});
        } else {
          this.setState({regError: response.data.error});
        }
      })
      .catch((error) => { 
        console.log(error); 
      })
  }

  hnadleSignOut = () => {
    signOut()
    .then((response) => {
      if (!response.data.error) {
        this.Cookies.remove('username');
        this.setState({userName: '', loggedIn: false, sessionId: ''});
      } else {
        this.setState({ signOutError: response.data.error});
      }
    })
  }

  componentDidMount() {
    const sessionId: string = this.Cookies.get('session');
    const userName: string = this.Cookies.get('username');
    this.setState({ 
      sessionId: sessionId, 
      loggedIn: sessionId ? true : false,
      userName: userName
    });
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        {this.state.loggedIn ?  
          <Practice
            username={this.state.userName}
            onSignOut={this.hnadleSignOut}    
          /> : 
          <Login 
            onSignIn={this.handleSignIn} 
            onRegister={this.handleRegister} 
            regError={this.state.regError} 
            loginError={this.state.loginError}
          />
        }
      </MuiThemeProvider>
    );
  }
}

export default App;
