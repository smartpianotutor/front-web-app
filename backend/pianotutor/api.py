from flask import (
    Blueprint, Response
)
from music21 import *

from pianotutor.auth import login_required
from pianotutor.db import get_db


bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/get_sheet_music', methods=('GET',))
#@login_required
def get_sheet_music():
    """Create a new post for the current user."""
    db = get_db()
    s = stream.Stream()
    s.append(note.Note('C', quarterLength=0.25))
    s.append(note.Note('C', quarterLength=0.25))
    s.append(note.Note('C', quarterLength=0.25))
    s.append(note.Note('C', quarterLength=0.25))
    GEX = musicxml.m21ToXml.GeneralObjectExporter(s)
    out = GEX.parse()
    outStr = out.decode('utf-8').strip()
    return Response(outStr, mimetype='text/xml')
