import React, { Component, RefObject } from 'react';
import { OpenSheetMusicDisplay as OSMD, Cursor, VoiceEntry, Note } from 'opensheetmusicdisplay';

interface OpenSheetMusicDisplayProps {
    autoResize?: boolean,
    drawTitle?: boolean,
    file: string
}

class OpenSheetMusicDisplay extends Component<OpenSheetMusicDisplayProps> {

    osmd: OSMD;
    cursor: Cursor;
    divRef: RefObject<HTMLDivElement>;

    currentNoteTimeStamp: number = null;
    currentNoteDuration: number = 0;
    currentSheetMusicStartTime: number = 0;

    constructor(props: any) {
      super(props);
      this.osmd = undefined;
      this.divRef = React.createRef<HTMLDivElement>();
    }
  
    setupOsmd() {
      const options = {
        autoResize: this.props.autoResize ? this.props.autoResize : true,
        drawTitle: this.props.drawTitle ? this.props.drawTitle : true,
      }
      this.osmd = new OSMD(this.divRef.current, options);
      this.cursor = this.osmd.cursor;
      this.osmd.load(this.props.file).then(() => {
        this.osmd.render();
        this.cursor.show();
        window.requestAnimationFrame(this.update);
      });
    }

      /* Runs approx 60 times a second */
    update = (timestamp: number) => {
        if (!this.currentSheetMusicStartTime) this.currentSheetMusicStartTime = timestamp;
        if (!this.currentNoteTimeStamp) this.currentNoteTimeStamp = timestamp;
        var timeSinceLastNote = timestamp - this.currentNoteTimeStamp;

        if (timeSinceLastNote >= this.currentNoteDuration * 1000) {

            if (this.currentNoteDuration) this.cursor.next();

            if (this.cursor.Iterator.CurrentVoiceEntries) {
                const cursorVoiceEntry: VoiceEntry = this.cursor.Iterator.CurrentVoiceEntries[0];
                const baseNote: Note = cursorVoiceEntry.Notes[0];
                const currentNoteLength: number = baseNote.Length.RealValue;
        
                this.currentNoteDuration = (currentNoteLength * 4) / (2);
        
                console.log(baseNote.Pitch ? baseNote.Pitch.ToString() : "No Note");
                console.log("MIDI ID:", baseNote.halfTone);
                console.log("Note duration in time:", this.currentNoteDuration);
                console.log(
                  "Note timestamp in song",
                  ((timestamp - currentNoteLength) / 1000).toPrecision(4) + "s"
                );
        
                this.currentNoteTimeStamp = timestamp;
            }
        }

        window.requestAnimationFrame(this.update);
    }
  
    resize() {
      this.forceUpdate();
    }
  
    componentWillUnmount() {
      window.removeEventListener('resize', this.resize)
    }
  
    componentDidUpdate(prevProps: OpenSheetMusicDisplayProps) {
      if (this.props.drawTitle !== prevProps.drawTitle) {
        this.setupOsmd();
      } else {
        this.osmd.load(this.props.file).then(() => this.osmd.render());
      }
      window.addEventListener('resize', this.resize)
    }
  
    // Called after render
    componentDidMount() {
      this.setupOsmd();
    }
  
    render() {
      return (<div style={{width: '100vw'}} ref={this.divRef} />);
    }
  }

  export default OpenSheetMusicDisplay;