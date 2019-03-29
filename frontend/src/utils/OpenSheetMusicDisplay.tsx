import React, { Component, RefObject } from 'react';
import { OpenSheetMusicDisplay as OSMD, Cursor, VoiceEntry, Note } from 'opensheetmusicdisplay';

interface OpenSheetMusicDisplayProps {
    start: boolean
}

class OpenSheetMusicDisplay extends Component<OpenSheetMusicDisplayProps> {

    osmd: OSMD;
    cursor: Cursor;
    divRef: RefObject<HTMLDivElement>;

    currentNoteTimeStamp: number = null;
    currentNoteDuration: number = 0;
    currentSheetMusicStartTime: number = 0;

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
      });
    }

      /* Runs approx 60 times a second */
    update = (timestamp: number) => {
      if (this.state.practicing) {
        if (!this.currentSheetMusicStartTime) this.currentSheetMusicStartTime = timestamp;
        if (!this.currentNoteTimeStamp) this.currentNoteTimeStamp = timestamp;
        var timeSinceLastNote = timestamp - this.currentNoteTimeStamp;

        if (timeSinceLastNote >= this.currentNoteDuration * 1000) {

          if (this.currentNoteDuration) {
            const prevVoiceEntry: VoiceEntry = this.cursor.Iterator.CurrentVoiceEntries ? this.cursor.Iterator.CurrentVoiceEntries[0] : null;
            if (prevVoiceEntry) {
              prevVoiceEntry.StemColor = "#FF0000";
              prevVoiceEntry.Notes[0].NoteheadColor = "#FF0000";
              this.osmd.render();
            }
            this.cursor.next();
          }

          if (this.cursor.Iterator.CurrentVoiceEntries) {
              const cursorVoiceEntry: VoiceEntry = this.cursor.Iterator.CurrentVoiceEntries[0];
              const baseNote: Note = cursorVoiceEntry.Notes[0];
              const currentNoteLength: number = baseNote.Length.RealValue;
      
              this.currentNoteDuration = (currentNoteLength * 4) / (1.4);

              const noteData = {
                midiId: baseNote.halfTone,
                noteDuration: this.currentNoteDuration,
                noteLength: currentNoteLength,
                noteTimestamp: ((this.currentNoteTimeStamp - this.currentSheetMusicStartTime) / 1000).toPrecision(4) + "s"
              }

              console.log(noteData);
      
              this.currentNoteTimeStamp = timestamp;
          }
        }
        window.requestAnimationFrame(this.update);
      }
    }

    shouldComponentUpdate(nextProps: OpenSheetMusicDisplayProps, nextState: any) {
      if (nextProps.start && nextProps.start != this.props.start) {
        this.setState({ practicing: true });
        window.requestAnimationFrame(this.update);
      }
      return true;
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