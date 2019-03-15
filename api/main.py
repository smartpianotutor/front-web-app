import music21

music21.environment.set('musicxmlPath', '/usr/bin/musescore')
river = music21.converter.parse('river.mxl')
riverChords = river.chordify()
riverChords.show('text')

# for n in riverChords.getElementsByClass(music21.stream.Measure):
#     print(n)
# pass
# riverChords.show()