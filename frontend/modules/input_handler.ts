
export module MidiInput {

    var context: AudioContext = null;
    var midiAcc: WebMidi.MIDIAccess = null;
    var oscillator: OscillatorNode = null;
    var envelope: GainNode = null;

    export function setUpMIDIAccess() {
        alert("Press ok so we can initialize midi thanks");
        context = new AudioContext();
      
        if (navigator.requestMIDIAccess) {
          navigator.requestMIDIAccess().then(onMidiInit, onMidiReject);
        } else {
          alert("Why are you not using Google Chrome?");
        }
      
        // set up the basic oscillator chain, muted to begin with.
        oscillator = context.createOscillator();
        envelope = context.createGain();
        oscillator.frequency.setValueAtTime(110, 0);
        oscillator.connect(envelope);
        envelope.connect(context.destination);
        envelope.gain.value = 0.0; // Mute the sound
        oscillator.start(0); // Go ahead and start up the oscillator
    }

    // MIDI system has been started
    function onMidiInit(midi: WebMidi.MIDIAccess) {
        midiAcc = midi;
        
        hookUpMidi();
        midiAcc.onstatechange = hookUpMidi;
    }
      
    // MIDI failed to start
    function onMidiReject(err) {
        alert("The MIDI system failed to start.  You're gonna have a bad time.");
    }
    
    //Look for MIDI inputs
    function hookUpMidi() {
        var haveAtLeastOneDevice = false;
        var inputs = midiAcc.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            console.log(input);
            input.value.onmidimessage = MIDIMessageEventHandler;
            haveAtLeastOneDevice = true;
        }
        if (!haveAtLeastOneDevice) {
            alert("Connect a MIDI input and refresh!");
        }
    }

    function MIDIMessageEventHandler(event: WebMidi.MIDIMessageEvent) {
        // Mask off the lower nibble (MIDI channel, which we don't care about)
        switch (event.data[0] & 0xf0) {
            case 0x90:
            if (event.data[2] != 0) {
                // if velocity != 0, this is a note-on message
                noteOn(event.data[1]);
                return;
            }
            // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, ya'll.
            case 0x80:
            noteOff(event.data[1]);
            return;
        }
    }

    function noteOn(noteNum: number) {
        console.log("NOTE ON:", noteNum);
        oscillator.frequency.cancelScheduledValues(0);
        oscillator.frequency.setTargetAtTime( 250 * Math.pow(2,(noteNum-69)/12), 0, 0.05 );
        envelope.gain.cancelScheduledValues(0);
        envelope.gain.setTargetAtTime(1.0, 0, 0.05);
    }
    
    function noteOff(noteNum: number) {
        console.log("NOTE OFF", noteNum);
        envelope.gain.cancelScheduledValues(0);
        envelope.gain.setTargetAtTime(0.0, 0, 0.05);
    }
}