import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';

import './login.css';
import Logo from '../images/icon.png';

import { verifySignInRequirements } from './../requirements/login';
import { verifyRegistrationRequirements } from './../requirements/signUp';

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
    const err = verifyRegistrationRequirements(this.state.newUsername, this.state.newPassword, this.state.confirmPassword);
    if (err) { this.setState({ regError: err }) } else { this.props.onRegister(this.state.newUsername, this.state.newPassword) }
  }

  handleSignIn = () => {
    const err = verifySignInRequirements(this.state.username, this.state.password);
    if (err) { this.setState({ loginError: err }) } else { this.props.onSignIn(this.state.username, this.state.password) }
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
      <div className="Login" >
        <CardMedia image={Logo} title="Smart Piano Tutor" className="Media"/>
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
                    type="password"
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
                    type="password"
                    autoFocus 
                    value={this.state.newPassword}
                    onChange={(e) => { this.handleUserInput(e, 'newPassword') }}
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Confirm Password</InputLabel>
                <Input 
                    id="completePassword"
                    autoComplete="password"
                    type="password"
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
