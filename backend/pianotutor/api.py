from flask import (
    Blueprint, Response
)
from music21 import *
import random

from pianotutor.auth import login_required
from pianotutor.db import get_db


bp = Blueprint('api', __name__, url_prefix='/api')

ability_to_pattern = {
    0: ['even_division_f()', 'whole_beat_a()'],
    1: ['even_division_b()', 'whole_beat_c()', 'even_division_a()'],
    2: ['even_division_d()', 'even_division_c()'],
    3: ['even_division_g()', 'whole_beat_b()'],
    4: ['whole_beat_d()'],
    5: ['even_division_e()', 'multi_beat_a()'],
    6: ['multi_beat_b()']
}

def whole_beat_a():
    return note.Note('C4', quarterLength=1)

def whole_beat_b():
    return note.Note('C4', quarterLength=3)

def whole_beat_c():
    return note.Note('C4', quarterLength=2)

def whole_beat_d():
    return note.Note('C4', quarterLength=4)

def multi_beat_a():
    n1 = note.Note('C4', quarterLength=1.5)
    n2 = note.Note('B3', type='eighth')
    return [n1,n2]

def multi_beat_b():
    n1 = note.Note('C4', type='eighth')
    n2 = note.Note('B3', quarterLength=1)
    n3 = note.Note('A3', type='eighth')
    return [n1,n2,n3]

def even_division_a():
    n1 = note.Note('C4', type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note('C4', type='eighth')
    n2.beams.fill(1, 'stop')
    return [n1,n2]

def even_division_b():
    n1 = note.Note('C4', type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note('C4', type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note('C4', type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note('C4', type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_c():
    n1 = note.Note('C4', type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note('B3', type='eighth')
    n2.beams.fill(1, 'stop')
    return [n1,n2]

def even_division_d():
    n1 = note.Note('C4', type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note('C4', type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note('E4', type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note('E4', type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_e():
    n1 = note.Note('C4', type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note('C4', type='eighth')
    n2.beams.fill(1, 'continue')
    n3 = note.Note('C4', type='eighth')
    n3.beams.fill(1, 'stop')
    return [n1,n2,n3]

def even_division_f():
    n1 = note.Note('C4', type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note('D4', type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note('E4', type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note('F4', type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_g():
    n1 = note.Note('C4', type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note('B3', type='eighth')
    n2.beams.fill(1, 'continue')
    n3 = note.Note('A3', type='eighth')
    n3.beams.fill(1, 'stop')
    return [n1,n2,n3]

def even_uneven_division_a():
    n1 = note.Note('C4', type='eighth')
    n1.beams.append('start')
    n2 = note.Note('C4', type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note('C4', type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_b():
    n1 = note.Note('C4', type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note('C4', type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note('C4', type='eighth')
    n3.beams.append('stop')
    return [n1,n2, n3]

def even_uneven_division_c():
    n1 = note.Note('C4', type='eighth')
    n1.beams.append('start')
    n2 = note.Note('B3', type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note('B3', type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_d():
    n1 = note.Note('C4', type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note('C4', type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note('B3', type='eighth')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_e():
    n1 = note.Note('C4', type='eighth')
    n1.beams.append('start')
    n2 = note.Note('D4', type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note('E4', type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_f():
    n1 = note.Note('C4', type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note('D4', type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note('E4', type='eighth')
    n3.beams.append('stop')
    return [n1,n2,n3]

def uneven_division_a():
    n1 = note.Note('C4', quarterLength=0.75)
    n1.beams.append('start')
    n2 = note.Note('C4', type='16th')
    n2.beams.append('stop')
    n2.beams.append('partial', 'left')
    return [n1,n2]

def uneven_division_b():
    n1 = note.Note('C4', type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note('C4', quarterLength=0.75)
    n2.beams.append('stop')
    return [n1,n2]

def uneven_division_c():
    n1 = note.Note('C4', quarterLength=0.75)
    n1.beams.append('start')
    n2 = note.Note('D4', type='16th')
    n2.beams.append('stop')
    n2.beams.append('partial', 'left')
    return [n1,n2]

def uneven_division_d():
    n1 = note.Note('C4', type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note('D4', quarterLength=0.75)
    n2.beams.append('stop')
    return [n1,n2]

def uneven_uneven_division_a():
    n1 = note.Note('C4', type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note('C4', type='eighth')
    n2.beams.append('continue')
    n3 = note.Note('C4', type='16th')
    n3.beams.append('stop')
    n3.beams.append('partial', 'left')
    return [n1,n2,n3]

def uneven_uneven_division_b():
    n1 = note.Note('C4', type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note('D4', type='eighth')
    n2.beams.append('continue')
    n3 = note.Note('E4', type='16th')
    n3.beams.append('stop')
    n3.beams.append('partial', 'left')
    return [n1,n2,n3]

@bp.route('/get_sheet_music', methods=('GET',))
@login_required
def get_sheet_music():
    """Create a new post for the current user."""
    db = get_db()
    s = stream.Stream()
    # TODO get real ability from DB
    pattern_list = ability_to_pattern[0]
    pattern_func = random.SystemRandom().choice(pattern_list)
    # TODO transpose pattern to desired note
    pattern = eval(pattern_func)
    s.append(pattern)
    # TODO finish measures alternatively (hard, easy)
    GEX = musicxml.m21ToXml.GeneralObjectExporter(s)
    out = GEX.parse()
    outStr = out.decode('utf-8').strip()
    return Response(outStr, mimetype='text/xml')
