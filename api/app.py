import music21

# music21.environment.set('musicxmlPath', '/usr/bin/musescore')
# river = music21.converter.parse('river.mxl')
# riverChords = river.chordify()
# riverChords.show('text')

# for n in riverChords.getElementsByClass(music21.stream.Measure):
#     print(n)
# pass
# riverChords.show()

from flask import Flask
from create_db import create_db

create_db()
app = Flask(__name__)


@app.route('/api/')
def hello_world():
    return 'Hello, World!!!'


app.run(host='0.0.0.0')