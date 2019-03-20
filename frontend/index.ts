import { OpenSheetMusicDisplay, Cursor, VoiceEntry, Note, StemDirectionType } from "opensheetmusicdisplay";

const container: HTMLElement = <HTMLElement>document.createElement("div");
document.body.appendChild(container);
container.onclick = handleSVGClick;

const osmd = new OpenSheetMusicDisplay(container, {autoResize: false});
osmd.setLogLevel('info');
let cursor: Cursor = osmd.cursor;

// Current Sheet Constants
const beatsPerSecond: number = 120 / 60;


startUp();

function startUp() {
	loadMusicXML("musicXmlSample.xml");
}

function handleSVGClick() {
	console.log("CLICKED");
}

function afterRender() {
	osmd.setOptions( { autoResize: true });
	cursor.show();
	window.requestAnimationFrame(update);
}

var noteTimeStamp: number = null;
var noteDuration: number = 0;

/* Runs approx 60 times a second */
function update(timestamp: number) {
	if (!noteTimeStamp) noteTimeStamp = timestamp;
	var timeSinceLastNote = timestamp - noteTimeStamp;

	if (timeSinceLastNote >= noteDuration * 1000) {

		if (noteDuration) cursor.next();

		const cursorVoiceEntry: VoiceEntry = cursor.Iterator.CurrentVoiceEntries[0];
		const baseNote: Note = cursorVoiceEntry.Notes[0];
		const currentNoteLength: number = baseNote.Length.RealValue;

		noteDuration = (currentNoteLength * 4) / beatsPerSecond;

		console.log(baseNote.Pitch ? baseNote.Pitch.ToString(): "No Note");
		console.log("MIDI ID:", baseNote.halfTone);
		console.log("Note duration in time:", noteDuration);
		console.log("Note timestamp", timestamp);

		noteTimeStamp = timestamp;
	}

	if (cursor.Iterator.CurrentVoiceEntries[0].Notes[0]) {
	  window.requestAnimationFrame(update);
	}
}

/**
 * Load a MusicXml file via xhttp request, and display its contents.
 */
function loadMusicXML(url: string) {
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function () {
	   switch (xhttp.readyState) {
	      case 0 : // UNINITIALIZED
	      case 1 : // LOADING
	      case 2 : // LOADED
	      case 3 : // INTERACTIVE
	      break;
	      case 4 : // COMPLETED
	      	osmd
				.load(xhttp.responseXML)
				.then(
					() => {
						osmd.render();
						afterRender();
					},
					(err) => console.log(err)
				);
	      	break;
	      default:
	      	throw("Error loading MusicXML file.");
	   }
	}
   xhttp.open("GET", url, true);
   xhttp.send();
 }
