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
}

class Login extends Component<LoginProps> {

  state = {
    value: 0,
    username: '',
    password: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  };

  handleChange = (event: any, value: number) => {
    this.setState({ value });
  };

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
                    onChange={(e) => { this.setState({ username: e.target.value }) }}
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input 
                    id="password"
                    autoComplete="password"
                    autoFocus 
                    value={this.state.password}
                    onChange={(e) => { this.setState({ password: e.target.value }) }}
                />
              </FormControl>
              <div className="submit">
                <Button
                  onClick={() => {this.props.onSignIn(this.state.username, this.state.password)}}
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
                    onChange={(e) => { this.setState({ newUsername: e.target.value }) }}
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input 
                    id="password"
                    autoComplete="password"
                    autoFocus 
                    value={this.state.newPassword}
                    onChange={(e) => { this.setState({ newPassword: e.target.value }) }}
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Confirm Password</InputLabel>
                <Input 
                    id="password"
                    autoComplete="password"
                    autoFocus 
                    value={this.state.confirmPassword}
                    onChange={(e) => { this.setState({ confirmPassword: e.target.value }) }}
                />
              </FormControl>
              <div className="submit">
                <Button
                  onClick={() => {this.props.onRegister(this.state.username, this.state.password)}}
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
