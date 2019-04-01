import React, { Component, RefObject } from 'react';
import { OpenSheetMusicDisplay as OSMD, Cursor, VoiceEntry, Note } from 'opensheetmusicdisplay';

import { updateAbilities } from './api';

interface OpenSheetMusicDisplayProps {
    start: boolean,
    userPressedNotes: MIDIActiveKey[]
}

class MIDIActiveKey {
  MIDIid: number;
  Timestamp: number;
  Length: number;
}

class OpenSheetMusicDisplay extends Component<OpenSheetMusicDisplayProps> {

    osmd: OSMD;
    cursor: Cursor;
    divRef: RefObject<HTMLDivElement>;

    currentNoteTimeStamp: number[];
    currentNoteDuration: number = 0;
    currentSheetMusicStartTime: number = 0;

    performance: boolean[] = [];
    snippetId: number;

    state = {
      practicing: false
    }

    constructor(props: any) {
      super(props);
      this.osmd = undefined;
      this.divRef = React.createRef<HTMLDivElement>();
    }
  
    setupOsmd() {
      const options = {
        autoResize: true,
        drawCredits: false,
        drawPartNames: false,
        drawFingerings: false,
        coloringEnabled: true
      }
      this.osmd = new OSMD(this.divRef.current, options);
      this.cursor = this.osmd.cursor;
      this.osmd.load('./api/get_sheet_music').then(() => {
        this.osmd.render();
        this.cursor.show();
        this.snippetId = parseInt(this.osmd.Sheet.TitleString);
      });
    }

    onComplete = () => {
      this.setState({practicing: false})
      updateAbilities(this.performance, this.snippetId)
      .then((response) => {
        if (!response.data.error) {
          console.log(response);
          this.osmd.load('./api/get_sheet_music').then(() => {
            this.osmd.render();
            this.cursor.show();
            this.snippetId = parseInt(this.osmd.Sheet.TitleString);
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
      if (this.state.practicing) {
        if (!this.currentNoteTimeStamp) this.currentNoteTimeStamp = [timestamp, Date.now()];
        var timeSinceLastNote = timestamp - this.currentNoteTimeStamp[0];

        if (timeSinceLastNote >= this.currentNoteDuration * 1000) {

          if (this.currentNoteDuration) {
            const prevVoiceEntry: VoiceEntry = this.cursor.Iterator.CurrentVoiceEntries ? this.cursor.Iterator.CurrentVoiceEntries[0] : null;
            if (prevVoiceEntry) {

              const prevNote: Note = prevVoiceEntry.Notes[0];
              const prevNoteTimeStamp = (this.currentNoteTimeStamp[1] - this.currentSheetMusicStartTime)/1000;

              //conditions for a hit:
              // - midiId matches
              // - hit within 0.25 sec of note
              // - held for within 0.25 sec of length

              const hitNote: MIDIActiveKey = this.props.userPressedNotes ? this.props.userPressedNotes.find((n) => 
                n.MIDIid === prevNote.halfTone &&
                n.Timestamp >= (prevNoteTimeStamp - 0.25) &&
                n.Timestamp <= (prevNoteTimeStamp + 0.25)
              ) : null;

              //Check if user hit or miss
              if (hitNote) {
                console.log("YOU HIT IT", hitNote);
                this.performance.push(true);
              } else {
                prevVoiceEntry.StemColor = "#FF0000";
                prevVoiceEntry.Notes[0].NoteheadColor = "#FF0000";
                this.performance.push(false);
                this.osmd.render();
              }
            }
            this.cursor.next();
          }

          if (this.cursor.Iterator.CurrentVoiceEntries) {
              const cursorVoiceEntry: VoiceEntry = this.cursor.Iterator.CurrentVoiceEntries[0];
              const baseNote: Note = cursorVoiceEntry.Notes[0];
              const currentNoteLength: number = baseNote.Length.RealValue;
      
              this.currentNoteDuration = (currentNoteLength * 4) / (1.4);      
              this.currentNoteTimeStamp = [timestamp, Date.now()];
          } else {
            this.onComplete();
          }
        }
        window.requestAnimationFrame(this.update);
      }
    }

    // Called after render
    componentDidMount() {
      this.setupOsmd();
    }
  
    render() {
      return (<div style={{marginTop: '10vh'}} ref={this.divRef} />);
    }
  }

  export default OpenSheetMusicDisplay;