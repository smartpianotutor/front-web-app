import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CardMedia from '@material-ui/core/CardMedia';

import OpenSheetMusicDisplay from './../utils/OpenSheetMusicDisplay';
import Logo from '../images/logo.png';
import './practice.css';

interface PracticeProps {
  username: string,
  onSignOut: any
}

class Practice extends Component<PracticeProps> {

  render() {
    return (
      <div>
        <AppBar position="absolute" color="primary">
          <Toolbar>
            <CardMedia image={Logo} title="Smart Piano Tutor" className="Header-Logo"/>
            <Typography variant="h6" style={{flexGrow: 1, color: '#fff', marginLeft: '15px' }}>
              Smart Piano Tutor
            </Typography>
            <Button variant="outlined" color='inherit' style={{color: '#fff'}} onClick={this.props.onSignOut}> Sign Out </Button>
          </Toolbar>
        </AppBar>
        <OpenSheetMusicDisplay username={this.props.username}/>
      </div>
    )
  }
}

export default Practice;
