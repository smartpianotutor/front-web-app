import music21

music21.environment.set('musicxmlPath', '/usr/bin/musescore')
river = music21.converter.parse('river.mxl')
riverChords = river.chordify()
riverChords.show()