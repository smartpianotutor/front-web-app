import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import OpenSheetMusicDisplay from './../utils/OpenSheetMusicDisplay';

interface PracticeProps {
  username: string,
  onSignOut: any
}

class Practice extends Component<PracticeProps> {

  render() {
    return (
      <div>
        <AppBar position="absolute" style={{ backgroundColor: '#364352'}}>
          <Toolbar>
          <Typography variant="h6" style={{flexGrow: 1, color: '#fff'}}>
            Smart Piano Tutor
          </Typography>
            <Button style={{color: '#fff'}} variant="outlined" onClick={this.props.onSignOut}> Sign Out </Button>
          </Toolbar>
        </AppBar>
        <OpenSheetMusicDisplay username={this.props.username}/>
      </div>
    )
  }
}

export default Practice;
