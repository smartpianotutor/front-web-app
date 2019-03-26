import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';

import OpenSheetMusicDisplay from './../utils/OpenSheetMusicDisplay';

import './practice.css';

class Practice extends Component {

  state = {
    value: 0,
  };

  context: AudioContext = null;
  oscillator: OscillatorNode = null;
  midiAcc: WebMidi.MIDIAccess = null;
  envelope: GainNode = null;

  osmd: OpenSheetMusicDisplay = null;

  componentDidMount() {
    alert("YAY YOU SIGNED IN, now press ok so we can initialize midi thanks");
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

  }

  handleChange = (event: any, value: number) => {
    this.setState({ value });
  };

  // MIDI system has been started
  onMidiInit = (midi: WebMidi.MIDIAccess) => {
    this.midiAcc = midi;
    this.hookUpMidi();
    this.midiAcc.onstatechange = this.hookUpMidi;
  };

  // MIDI failed to start
  onMidiReject = (err: any) => {
    alert("The MIDI system failed to start.  You're gonna have a bad time.");
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
      alert("Connect a MIDI input and refresh!");
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

  render() {
    const { value } = this.state;

    return (
      <div className="Practice">
        <OpenSheetMusicDisplay file={"SampleMusic.xml"} />
      </div>
    );
  }
}

export default Practice;
