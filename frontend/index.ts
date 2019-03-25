import {
  OpenSheetMusicDisplay,
  VoiceEntry,
  Note
} from "opensheetmusicdisplay";

import { MidiInput } from "./modules/input_handler";
import { SnippetRenderer } from "./modules/snippet_render";

startUp();

var osmd: OpenSheetMusicDisplay = null;

function startUp() {
  MidiInput.setUpMIDIAccess();

  const container: HTMLElement = <HTMLElement>document.createElement("div");
  document.body.appendChild(container);
  container.onclick = handleSVGClick;

  osmd = SnippetRenderer.initOSMD(container);

  SnippetRenderer.initSnippet(osmd, "musicXmlSample.xml", update);
}

function handleSVGClick() {
  console.log("CLICKED");
}

var noteTimeStamp: number = null;
var noteDuration: number = 0;
var currentSheetMusicStartTime: number = 0;

/* Runs approx 60 times a second */
function update(timestamp: number) {
  if (!currentSheetMusicStartTime) currentSheetMusicStartTime = timestamp;
  if (!noteTimeStamp) noteTimeStamp = timestamp;
  var timeSinceLastNote = timestamp - noteTimeStamp;

  if (timeSinceLastNote >= noteDuration * 1000) {
    if (noteDuration) SnippetRenderer.cursor.next();

    const cursorVoiceEntry: VoiceEntry = SnippetRenderer.cursor.Iterator.CurrentVoiceEntries[0];
    const baseNote: Note = cursorVoiceEntry.Notes[0];
    const currentNoteLength: number = baseNote.Length.RealValue;

    noteDuration = (currentNoteLength * 4) / SnippetRenderer.beatsPerSecond;

    // console.log(baseNote.Pitch ? baseNote.Pitch.ToString() : "No Note");
    // console.log("MIDI ID:", baseNote.halfTone);
    // console.log("Note duration in time:", noteDuration);
    // console.log(
    //   "Note timestamp in song",
    //   ((timestamp - currentNoteLength) / 1000).toPrecision(4) + "s"
    // );

    noteTimeStamp = timestamp;
  }

  if (SnippetRenderer.cursor.Iterator.CurrentVoiceEntries[0].Notes[0]) {
    window.requestAnimationFrame(update);
  }
}