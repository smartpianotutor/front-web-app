import React, { Component, RefObject } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { OpenSheetMusicDisplay as OSMD, Cursor, VoiceEntry, Note } from 'opensheetmusicdisplay';
import Soundfont from 'soundfont-player';

import { updateAbilities } from './api';
import AbilityDisplay from './AbilitiyDisplay';

import './osmd.css';

interface OpenSheetMusicDisplayProps {
    username: string
}

class MIDIActiveKey {
  MIDIid: number;
  Timestamp: number;
  Length: number;
}

class Ability {
  midiId: number;
  ability: number;
  confidence: number;
  delta: number;
}

enum PracticePageStatus {
  Welcome,
  ConnectingMIDI,
  MIDIFailed,
  NoMIDI,
  Ready,
  Starting,
  Practicing,
  Finished
}

interface IMIDI_To_Note {
  [key: number]: string;
}

class OpenSheetMusicDisplay extends Component<OpenSheetMusicDisplayProps> {

    BPS: number = 1;
    TIME_THRESHOLD_IN_SEC: number = 0.25;

    midi_to_note: IMIDI_To_Note = {
      55: 'G3',
      57: 'A3',
      59: 'B3',
      60: 'C4',
      62: 'D4',
      64: 'E4',
      65: 'F4',
      67: 'G4',
      69: 'A4',
      71: 'B4',
      72: 'C5',
      74: 'D5',
      76: 'E5'
    };

    osmd: OSMD;
    cursor: Cursor;
    divRef: RefObject<HTMLDivElement>;

    currentNoteTimeStamp: number[];
    currentNoteDuration: number = 0;
    currentSheetMusicStartTime: number = 0;

    startMetronomeTime: number = 0;
    metronomeCount: number = 0;
    metronome: HTMLAudioElement = null;

    performance: boolean[] = [];
    snippetId: number;

    context: AudioContext;
    midiAcc: WebMidi.MIDIAccess;
    piano: Soundfont.Player;
  
    activeNotes: MIDIActiveKey[] = [];
    firstNote: number;

    state = {
      status: PracticePageStatus.Welcome,
      performance: [] as Ability[],
    }

    constructor(props: any) {
      super(props);
      this.osmd = undefined;
      this.divRef = React.createRef<HTMLDivElement>();
    }
  
    setupOsmd = () => {
      if (!this.osmd) {
        const options = {
          autoResize: true,
          drawCredits: false,
          drawPartNames: false,
          drawFingerings: false,
          coloringEnabled: true
        }
        console.log("SET UP OSMD");
        this.osmd = new OSMD(this.divRef.current, options);
        this.cursor = this.osmd.cursor;
        this.osmd.load('./api/get_sheet_music').then(() => {
          this.osmd.render();
          this.cursor.show();
          this.firstNote = this.cursor.Iterator.CurrentVoiceEntries[0].Notes[0].halfTone;
          this.snippetId = parseInt(this.osmd.Sheet.TitleString);
        });
      }
    }

    onComplete = () => {
      this.setState({ status: PracticePageStatus.Finished })
      updateAbilities(this.performance, this.snippetId)
      .then((response) => {
        if (!response.data.error) {
          this.osmd.load('./api/get_sheet_music').then(() => {
            this.osmd.render();
            this.cursor.show();
            this.firstNote = this.cursor.Iterator.CurrentVoiceEntries[0].Notes[0].halfTone;
            this.snippetId = parseInt(this.osmd.Sheet.TitleString);
            this.performance = [];
            this.metronomeCount = 0;
            this.startMetronomeTime = 0;
            this.currentNoteTimeStamp = null;
            this.setState({ 
              status: PracticePageStatus.Ready, 
              performance: Object.keys(response.data).map(k => 
                { return {
                  midiId: k, 
                  ability: response.data[k].ability,
                  confidence: response.data[k].confidence,
                  delta: response.data[k].delta
                }}
              ) 
            });
          });
        } else {
          this.setState({loginError: response.data.error});
        }
      })
      .catch((error) => { 
        console.log(error); 
      })
    }

      /* Runs approx 60 times a second */
    update = (timestamp: number) => {
      if (!this.startMetronomeTime) this.startMetronomeTime = timestamp;
      if (timestamp - this.startMetronomeTime > this.BPS*1000) {
        this.metronome.play();
        this.startMetronomeTime = timestamp;
        if (this.state.status === PracticePageStatus.Starting) {
          this.metronomeCount++;
          if (this.metronomeCount === 5) {
            
            const cursorVoiceEntry: VoiceEntry = this.cursor.Iterator.CurrentVoiceEntries[0];
            const currentNoteLength: number = cursorVoiceEntry.Notes[0].Length.RealValue;
            this.currentNoteDuration = (currentNoteLength * 4) / (this.BPS);

            this.setState({ status: PracticePageStatus.Practicing });

            if (this.props.username === 'demo') this.piano.play(cursorVoiceEntry.Notes[0].halfTone);
          }
        }
      }
      if (this.state.status === PracticePageStatus.Practicing) {
        if (!this.currentNoteTimeStamp) this.currentNoteTimeStamp = [timestamp, Date.now()];
        var timeSinceLastNote = timestamp - this.currentNoteTimeStamp[0];

        if (timeSinceLastNote >= this.currentNoteDuration * 1000) {

          if (this.currentNoteDuration) {
            const prevVoiceEntry: VoiceEntry = this.cursor.Iterator.CurrentVoiceEntries ? this.cursor.Iterator.CurrentVoiceEntries[0] : null;
            if (prevVoiceEntry) {

              if (this.props.username === 'demo') {
                this.performance.push(true);
              } else {
                const prevNote: Note = prevVoiceEntry.Notes[0];
                const prevNoteTimeStamp = (this.currentNoteTimeStamp[1] - this.currentSheetMusicStartTime)/1000;

                const hitNote: MIDIActiveKey = this.activeNotes ? this.activeNotes.find((n) => 
                  n.MIDIid === prevNote.halfTone &&
                  n.Timestamp >= (prevNoteTimeStamp - this.TIME_THRESHOLD_IN_SEC) &&
                  n.Timestamp <= (prevNoteTimeStamp + this.TIME_THRESHOLD_IN_SEC)
                ) : null;

                //Check if user hit or miss
                if (hitNote) {
                  console.log("YOU HIT IT", hitNote);
                  this.performance.push(true);
                } else {
                  console.log("YOU MISSED", {
                    midiId: prevNote.halfTone,
                    timeStamp: prevNoteTimeStamp
                  })
                  prevVoiceEntry.StemColor = "#FF0000";
                  prevVoiceEntry.Notes[0].NoteheadColor = "#FF0000";
                  this.performance.push(false);
                  this.osmd.render();
                }
              }
            }
            this.cursor.next();
          }

          if (this.cursor.Iterator.CurrentVoiceEntries) {
              const cursorVoiceEntry: VoiceEntry = this.cursor.Iterator.CurrentVoiceEntries[0];
              const baseNote: Note = cursorVoiceEntry.Notes[0];
              const currentNoteLength: number = baseNote.Length.RealValue;
      
              this.currentNoteDuration = (currentNoteLength * 4) / (this.BPS);      
              this.currentNoteTimeStamp = [timestamp, Date.now()];
              if (this.props.username === 'demo') this.piano.play(baseNote.halfTone);
          } else {
            this.onComplete();
          }
        }
      }
      if (this.state.status === PracticePageStatus.Starting || this.state.status === PracticePageStatus.Practicing) window.requestAnimationFrame(this.update);
    }

    // WEBMIDI FUNCTIONS //
    setUpMIDIAccess = () => {
      this.setState({ status: PracticePageStatus.ConnectingMIDI });
      this.context = new AudioContext();
      Soundfont.instrument(this.context, 'acoustic_grand_piano').then((p) => this.piano = p);
      this.metronome = new Audio("/metronome.wav");
    
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(this.onMidiInit, this.onMidiReject);
      } else {
        alert("Why are you not using Google Chrome?");
      }
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
        this.setState({ status: PracticePageStatus.Ready }, this.setupOsmd );
      }
      if (!haveAtLeastOneDevice) {
        console.log("Connect a MIDI input and refresh!");
        this.setState({ status: PracticePageStatus.NoMIDI });
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
      if (this.state.status === PracticePageStatus.Ready && noteNum === this.firstNote) {
        window.requestAnimationFrame(this.update);
        this.setState({ status: PracticePageStatus.Starting });
      } else if (this.state.status === PracticePageStatus.Practicing) {
        this.piano.play(noteNum);
        const time = ((Date.now() - this.currentSheetMusicStartTime) / 1000);
        this.activeNotes.push({MIDIid: noteNum, Timestamp: time, Length: 0});
        console.log("NOTE ON:", noteNum);
      }
    }
      
    noteOff = (noteNum: number) => {
      console.log("NOTE OFF", noteNum);
  
      var pressedNote = this.activeNotes.find((n) => n.MIDIid === noteNum && n.Length === 0);
      if (pressedNote) pressedNote.Length = ((Date.now() - this.currentSheetMusicStartTime) / 1000) - pressedNote.Timestamp;
    }

    render() {
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
        case PracticePageStatus.Starting:
        case PracticePageStatus.Practicing:
        case PracticePageStatus.Finished:
        case PracticePageStatus.Ready: return (
          <div className="Practice">
            <div className="Practice-Text">
              <Typography variant="h2" color="textPrimary">{
                this.state.status === PracticePageStatus.Ready ?
                "Press the first note on your MIDI device to begin" :
                this.state.status === PracticePageStatus.Starting ?
                "Get Ready.." : 
                "Keep playing.."
                }
              </Typography>
            </div>
            <div style={{ marginBottom: '10vh', paddingLeft: '12vw'}} ref={this.divRef} />
            {this.state.performance.length ? (
            <div>
              <div>
                <Typography variant='h6' align='center' gutterBottom>Notes Played In Last Snippet</Typography>
              </div>
              <div className="Scores">
                {this.state.performance.map((a) => <AbilityDisplay key={a.midiId} note={this.midi_to_note[a.midiId]} ability={a.ability} confidence={a.confidence} delta={a.delta} /> )}
              </div>
            </div>
            ) : null}
          </div>
        )
      }
    }
  }

  export default OpenSheetMusicDisplay;