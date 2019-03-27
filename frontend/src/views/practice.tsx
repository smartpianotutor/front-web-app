import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import OpenSheetMusicDisplay from './../utils/OpenSheetMusicDisplay';

import './practice.css';

enum PracticePageStatus {
  Welcome,
  ConnectingMIDI,
  MIDIFailed,
  NoMIDI,
  Ready,
  Practicing,
  Finished
}

interface PracticeProps {
  username: string,
  onSignOut: any
}

class Practice extends Component<PracticeProps> {

  state = {
    status: PracticePageStatus.Welcome,
  };

  context: AudioContext = null;
  oscillator: OscillatorNode = null;
  midiAcc: WebMidi.MIDIAccess = null;
  envelope: GainNode = null;

  osmd: OpenSheetMusicDisplay = null;

  componentDidMount() {

  }

  setUpMIDIAccess = () => {
    this.setState({ status: PracticePageStatus.ConnectingMIDI });
    this.context = new AudioContext();
  
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(this.onMidiInit, this.onMidiReject);
    } else {
      alert("Why are you not using Google Chrome?");
    }
  
    // set up the basic oscillator chain, muted to begin with.
    this.oscillator = this.context.createOscillator()
    this.envelope = this.context.createGain()
    
    this.oscillator.frequency.setValueAtTime(110, 0);
    this.oscillator.connect(this.envelope);
    this.envelope.connect(this.context.destination);
    this.envelope.gain.value = 0.0; // Mute the sound
    this.oscillator.start(0); // Go ahead and start up the oscillator

    this.setState({ status: PracticePageStatus.Ready })
  }

  // MIDI system has been started
  onMidiInit = (midi: WebMidi.MIDIAccess) => {
    this.midiAcc = midi;
    this.hookUpMidi();
    this.midiAcc.onstatechange = this.hookUpMidi;
  };

  // MIDI failed to start
  onMidiReject = (err: any) => {
    console.log(err);
    this.setState({ status: PracticePageStatus.MIDIFailed })
  };
    
  //Look for MIDI inputs
  hookUpMidi = () => {
    var haveAtLeastOneDevice = false;
    var inputs = this.midiAcc.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = this.MIDIMessageEventHandler;
      haveAtLeastOneDevice = true;
    }
    if (!haveAtLeastOneDevice) {
      console.log("Connect a MIDI input and refresh!");
      this.setState({ status: PracticePageStatus.NoMIDI })
    }
  }

  MIDIMessageEventHandler = (event: WebMidi.MIDIMessageEvent) => {
    // Mask off the lower nibble (MIDI channel, which we don't care about)
    switch (event.data[0] & 0xf0) {
      case 0x90:
        if (event.data[2] != 0) {
          // if velocity != 0, this is a note-on message
          this.noteOn(event.data[1]);
          return;
        }
  
      // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, ya'll.
      case 0x80:
        this.noteOff(event.data[1]);
        return;
      }
  }

  noteOn = (noteNum: number) => {

    if (this.state.status === PracticePageStatus.Ready) {
      this.setState({ status: PracticePageStatus.Practicing })
    }

    console.log("NOTE ON:", noteNum);
    this.oscillator.frequency.cancelScheduledValues(0);
    this.oscillator.frequency.setTargetAtTime( 250 * Math.pow(2,(noteNum-69)/12), 0, 0.05 );
    this.envelope.gain.cancelScheduledValues(0);
    this.envelope.gain.setTargetAtTime(1.0, 0, 0.05);
  }
    
  noteOff = (noteNum: number) => {
    console.log("NOTE OFF", noteNum);
    this.envelope.gain.cancelScheduledValues(0);
    this.envelope.gain.setTargetAtTime(0.0, 0, 0.05);
  }

  renderPage = () => {
    switch(this.state.status) {
      case PracticePageStatus.Welcome: return (
        <div className="Welcome">
          <Typography variant="h2" gutterBottom>Welcome, {this.props.username}</Typography>
          <Button color="primary" variant="contained" onClick={this.setUpMIDIAccess}>
            Click Here to Start MIDI Initialization
          </Button>
        </div>
      )
      case PracticePageStatus.ConnectingMIDI: return (
        <div className="Welcome">
          <Typography variant="h2">Initializing Audio Context..</Typography>
        </div>
      )
      case PracticePageStatus.MIDIFailed: return (
        <div className="Welcome">
          <Typography variant="h2">Unable to initialize Audio Context, please refresh.</Typography>
        </div>
      )
      case PracticePageStatus.NoMIDI: return (
        <div className="Welcome">
          <Typography variant="h2">No MIDI devices detected, please connect a device and try again.</Typography>
        </div>
      )
      case PracticePageStatus.Practicing:
      case PracticePageStatus.Ready: return (
        <div className="Practice">
          {this.state.status === PracticePageStatus.Ready ? (
            <div className="Practice-Text">
              <Typography variant="h2" color="textPrimary">Press any key on your MIDI device to begin</Typography>
            </div> ) : null
          }
          <OpenSheetMusicDisplay start={this.state.status === PracticePageStatus.Practicing} />
        </div>
      )
    }
  }

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
        {this.renderPage()}
      </div>
    )
  }
}

export default Practice;
