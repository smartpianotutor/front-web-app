import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import './login.css';

interface LoginProps {
    onSignIn: any;
    onRegister: any;
    regError: string;
    loginError: string;
}

class Login extends Component<LoginProps> {

  state = {
    value: 0,
    username: '',
    password: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
    regError: '',
    loginError: ''
  };

  handleChange = (event: any, value: number) => {
    this.setState({ value });
  };

  handleRegistration = () => {
    if (this.state.newUsername == '') {
      this.setState({regError: "Username cannot be empty."})
    } else if (this.state.newUsername.length < 3) {
      this.setState({loginError: "Your username must be at least 3 characters long."})
    } else if (this.state.newPassword == '') {
      this.setState({regError: "Password cannot be empty."})
    } else if (this.state.newPassword.length < 3) {
      this.setState({loginError: "Your password must be at least 3 characters long."})
    } else if (this.state.newPassword != this.state.confirmPassword) {
      this.setState({regError: "Your passwords do not match, please try again."})
    } else {
      this.props.onRegister(this.state.newUsername, this.state.newPassword);
    }
  }

  handleSignIn = () => {
    if (this.state.username == '') {
      this.setState({loginError: "Username cannot be empty."})
    } else if (this.state.password == '') {
      this.setState({loginError: "Password cannot be empty."})
    } else {
      this.props.onSignIn(this.state.username, this.state.password);
    }
  }

  handleUserInput = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    this.setState({
      [field]: e.target.value,
      regError: '',
      loginError: ''
    });
  }

  render() {
    const { value } = this.state;

    return (
      <div className="Login">
        <Typography variant="h3" className="header" gutterBottom>Smart Piano Tutor</Typography>
        <Paper className="paper">
          <Tabs value={value} variant="fullWidth" onChange={this.handleChange} style={{width: '100%'}} indicatorColor='primary'>
            <Tab label="Sign In" />
            <Tab label="Register" />  
          </Tabs>
          {value === 0 && 
            <form className="form">
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="email">Username</InputLabel>
                <Input 
                    id="username"
                    autoComplete="username"
                    autoFocus 
                    value={this.state.username}
                    onChange={(e) => { this.handleUserInput(e, 'username') }}
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input 
                    id="password"
                    autoComplete="password"
                    autoFocus 
                    value={this.state.password}
                    onChange={(e) => { this.handleUserInput(e, 'password') }}
                />
              </FormControl>
              {this.state.loginError || this.props.loginError ? (
                <Typography color="error" className="err" >
                  {this.state.loginError ? this.state.loginError : this.props.loginError}
                </Typography>
              ) : null}
              <div className="submit">
                <Button
                  onClick={this.handleSignIn}
                  fullWidth
                  variant="contained"
                  color="primary"
                >
                  Sign in
                </Button>
              </div>
            </form>
          }
          {value === 1 &&
            <form className="form">
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="email">Username</InputLabel>
                <Input 
                    id="username"
                    autoComplete="username"
                    autoFocus 
                    value={this.state.newUsername}
                    onChange={(e) => { this.handleUserInput(e, 'newUsername') }}
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input 
                    id="password"
                    autoComplete="password"
                    autoFocus 
                    value={this.state.newPassword}
                    onChange={(e) => { this.handleUserInput(e, 'newPassword') }}
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Confirm Password</InputLabel>
                <Input 
                    id="password"
                    autoComplete="password"
                    autoFocus 
                    value={this.state.confirmPassword}
                    onChange={(e) => { this.handleUserInput(e, 'confirmPassword') }}
                />
              </FormControl>
              {this.state.regError || this.props.regError ? (
                <Typography color="error" className="err" >
                  {this.state.regError ? this.state.regError : this.props.regError}
                </Typography>
              ) : null}
              <div className="submit">
                <Button
                  onClick={this.handleRegistration}
                  fullWidth
                  variant="contained"
                  color="primary"
                >
                  Register
                </Button>
              </div>
            </form>
          }
          
        </Paper>

      </div>
    );
  }
}

export default Login;
