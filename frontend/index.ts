import { OpenSheetMusicDisplay, Cursor, VoiceEntry, Note, StemDirectionType } from "opensheetmusicdisplay";
// import { parseOpenSheetMusicDisplayVexflowNotes } from "./resources/utils.js";


let osmd: OpenSheetMusicDisplay;

/*
 * Create a container element for OpenSheetMusicDisplay...
 */
let container: HTMLElement = <HTMLElement>document.createElement("div");
/*
 * ... and attach it to our HTML document's body. The document itself is a HTML5
 * stub created by Webpack, so you won't find any actual .html sources.
 */
document.body.appendChild(container);
container.onclick = handleSVGClick;
/*
 * Create a new instance of OpenSheetMusicDisplay and tell it to draw inside
 * the container we've created in the steps before.
 * The second parameter is an IOSMDOptions object.
 * autoResize tells OSMD not to redraw on resize.
 */
osmd = new OpenSheetMusicDisplay(container, {autoResize: false});
osmd.setLogLevel('info');
let cursor: Cursor = osmd.cursor;

/*
 * Load our MusicXMl and display it. The file is renamed by Webpack during bundling, it's
 * Muzio Clementi's Sonatina Opus 36 No 1, Part 1, which you can find next to this file.
 */
loadMusicXML("musicXmlSample.xml");

function handleSVGClick() {
	console.log("CLICKED");
	cursor.next();
	const cursorVoiceEntry: VoiceEntry = cursor.Iterator.CurrentVoiceEntries[0];
	const baseNote: Note = cursorVoiceEntry.Notes[0];
	console.log("Stem direction of VoiceEntry under Cursor: " + StemDirectionType[cursorVoiceEntry.StemDirection]);
	console.log("base note of Voice Entry at second cursor position: " + baseNote.Pitch.ToString());
}

/** Some example code to use OSMD classes after rendering a score. */
function afterRender() {
	osmd.setOptions( { autoResize: true });
	cursor.show();

	// for (var i=0; i < 10; i++ ) {
	// 	setTimeout(() => {
	// 		cursor.next();
	// 		const cursorVoiceEntry: VoiceEntry = cursor.Iterator.CurrentVoiceEntries[0];
	// 		const baseNote: Note = cursorVoiceEntry.Notes[0];
	// 		console.log(cursorVoiceEntry);
	// 		console.log("Stem direction of VoiceEntry under Cursor: " + StemDirectionType[cursorVoiceEntry.StemDirection]);
	// 		console.log("base note of Voice Entry at second cursor position: " + baseNote.Pitch.ToString());
	// 	}, 1000*i);
	// }
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
