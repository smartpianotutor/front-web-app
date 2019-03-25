import {
    OpenSheetMusicDisplay,
    Cursor,
  } from "opensheetmusicdisplay";
  
  export module SnippetRenderer {
    // Current Sheet Constants
    export const beatsPerSecond: number = 120 / 60;
    export var cursor: Cursor = null;

    export function initOSMD(container: HTMLElement) {
        const osmd = new OpenSheetMusicDisplay(container, { autoResize: false });
        cursor = osmd.cursor;

        osmd.setLogLevel("info");
        return osmd;
    }

    /**
    * Load a MusicXml file via xhttp request, and display its contents.
    */
   export function initSnippet(osmd: OpenSheetMusicDisplay, url: string, update) {
     var xhttp = new XMLHttpRequest();
     xhttp.onreadystatechange = function() {
       switch (xhttp.readyState) {
         case 0: // UNINITIALIZED
         case 1: // LOADING
         case 2: // LOADED
         case 3: // INTERACTIVE
           break;
         case 4: // COMPLETED
           osmd.load(xhttp.responseXML).then(
             () => {
               osmd.render();
               cursor.show();
               osmd.setOptions({ autoResize: true });
               window.requestAnimationFrame(update);
             },
             err => console.log(err)
           );
           break;
         default:
           throw "Error loading MusicXML file.";
       }
     };
     xhttp.open("GET", url, true);
     xhttp.send();
   }
   
}