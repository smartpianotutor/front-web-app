from flask import (
    Blueprint, Response
)
from music21 import *
import random

from pianotutor.auth import login_required
from pianotutor.db import get_db


bp = Blueprint('api', __name__, url_prefix='/api')

NUM_BARS = 4
NUM_QUARTERS_IN_BAR = 4

ability_to_pattern = {
    0: ['even_division_f', 'whole_beat_a', 'even_division_b'],
    1: ['whole_beat_c', 'even_division_a', 'even_uneven_division_a'],
    2: ['even_uneven_division_f'],
    3: ['even_division_d', 'even_uneven_division_e', 'uneven_division_a', 'even_uneven_division_d', 'even_division_c', 'even_uneven_division_c'],
    4: ['even_uneven_division_b','even_division_g', 'whole_beat_b', 'uneven_division_c'],
    5: ['uneven_division_b', 'uneven_uneven_division_a', 'whole_beat_d'],
    6: ['even_division_e', 'multi_beat_a', 'uneven_division_d'],
    7: ['multi_beat_b', 'uneven_uneven_division_b']
}

fake_note_ability_data = {
    60: 0,
    62: 0,
    64: 0,
    65: 0,
    67: 0,
    69: 0,
    71: 0
}

midi_to_note = collections.OrderedDict([(55, 'G3'), (57, 'A3'), (59, 'B3'), (60, 'C4'), (62, 'D4'), (64, 'E4'), (65, 'F4'), (67, 'G4'), (69, 'A4'), (71, 'B4'), (72, 'C5'), (74, 'D5'), (76, 'E5')])

def whole_beat_a(midi_id):
    base_n = midi_to_note[midi_id]
    return note.Note(base_n, quarterLength=1)

def whole_beat_b(midi_id):
    base_n = midi_to_note[midi_id]
    return note.Note(base_n, quarterLength=3)

def whole_beat_c(midi_id):
    base_n = midi_to_note[midi_id]
    return note.Note(base_n, quarterLength=2)

def whole_beat_d(midi_id):
    base_n = midi_to_note[midi_id]
    return note.Note(base_n, quarterLength=4)

def multi_beat_a(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, quarterLength=1.5)
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='eighth')
    return [n1,n2]

def multi_beat_b(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='eighth')
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], quarterLength=1)
    n3 = note.Note(list(midi_to_note.items())[base_n_index - 2][1], type='eighth')
    return [n1,n2,n3]

def even_division_a(midi_id):
    base_n = midi_to_note[midi_id]
    n1 = note.Note(base_n, type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note(base_n, type='eighth')
    n2.beams.fill(1, 'stop')
    return [n1,n2]

def even_division_b(midi_id):
    base_n = midi_to_note[midi_id]
    n1 = note.Note(base_n, type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note(base_n, type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note(base_n, type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_c(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='eighth')
    n2.beams.fill(1, 'stop')
    return [n1,n2]

def even_division_d(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_e(midi_id):
    base_n = midi_to_note[midi_id]
    n1 = note.Note(base_n, type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note(base_n, type='eighth')
    n2.beams.fill(1, 'continue')
    n3 = note.Note(base_n, type='eighth')
    n3.beams.fill(1, 'stop')
    return [n1,n2,n3]

def even_division_f(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note(list(midi_to_note.items())[base_n_index + 3][1], type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_g(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='eighth')
    n2.beams.fill(1, 'continue')
    n3 = note.Note(list(midi_to_note.items())[base_n_index - 2][1], type='eighth')
    n3.beams.fill(1, 'stop')
    return [n1,n2,n3]

def even_uneven_division_a(midi_id):
    base_n = midi_to_note[midi_id]
    n1 = note.Note(base_n, type='eighth')
    n1.beams.append('start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note(base_n, type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_b(midi_id):
    base_n = midi_to_note[midi_id]
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note(base_n, type='eighth')
    n3.beams.append('stop')
    return [n1,n2, n3]

def even_uneven_division_c(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='eighth')
    n1.beams.append('start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_d(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='eighth')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_e(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='eighth')
    n1.beams.append('start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_f(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='eighth')
    n3.beams.append('stop')
    return [n1,n2,n3]

def uneven_division_a(midi_id):
    base_n = midi_to_note[midi_id]
    n1 = note.Note(base_n, quarterLength=0.75)
    n1.beams.append('start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.append('stop')
    n2.beams.append('partial', 'left')
    return [n1,n2]

def uneven_division_b(midi_id):
    base_n = midi_to_note[midi_id]
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note(base_n, quarterLength=0.75)
    n2.beams.append('stop')
    return [n1,n2]

def uneven_division_c(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, quarterLength=0.75)
    n1.beams.append('start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='16th')
    n2.beams.append('stop')
    n2.beams.append('partial', 'left')
    return [n1,n2]

def uneven_division_d(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], quarterLength=0.75)
    n2.beams.append('stop')
    return [n1,n2]

def uneven_uneven_division_a(midi_id):
    base_n = midi_to_note[midi_id]
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note(base_n, type='eighth')
    n2.beams.append('continue')
    n3 = note.Note(base_n, type='16th')
    n3.beams.append('stop')
    n3.beams.append('partial', 'left')
    return [n1,n2,n3]

def uneven_uneven_division_b(midi_id):
    base_n = midi_to_note[midi_id]
    base_n_index = list(midi_to_note.keys()).index(midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='eighth')
    n2.beams.append('continue')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n3.beams.append('stop')
    n3.beams.append('partial', 'left')
    return [n1,n2,n3]

@bp.route('/get_sheet_music', methods=('GET',))
@login_required
def get_sheet_music():
    """Create a new post for the current user."""
    db = get_db()
    s = stream.Stream()

    #find the focus note
    first_min = min(fake_note_ability_data, key=fake_note_ability_data.get)
    focus_note_list = [key for key in fake_note_ability_data.keys() if fake_note_ability_data[key]==fake_note_ability_data[first_min]]
    focus_note = random.SystemRandom().choice(focus_note_list)

    #find the passive note pool
    first_max = max(fake_note_ability_data, key=fake_note_ability_data.get)
    passive_note_list = [key for key in fake_note_ability_data.keys() if fake_note_ability_data[key]==fake_note_ability_data[first_max]]
    if focus_note in passive_note_list: passive_note_list.remove(focus_note)

    # add initial half focus note
    s.append(note.Note(midi_to_note[focus_note], quarterLength=2))
    
    while(s.duration.quarterLength < (NUM_BARS * NUM_QUARTERS_IN_BAR)):
        # add focus note
        focus_pattern_list = ability_to_pattern[fake_note_ability_data[focus_note]]
        focus_pattern_func = random.SystemRandom().choice(focus_pattern_list)
        focus_pattern = eval(focus_pattern_func)(focus_note)
        s.append(focus_pattern)

        # add passive note
        passive_note = random.SystemRandom().choice(passive_note_list)
        passive_pattern_list = ability_to_pattern[fake_note_ability_data[passive_note]]
        passive_pattern_func = random.SystemRandom().choice(passive_pattern_list)
        passive_pattern = eval(passive_pattern_func)(passive_note)
        s.append(passive_pattern)
    
    while(s.quarterLength > (NUM_BARS * NUM_QUARTERS_IN_BAR)):
    s.pop(len(s) - 1)

    GEX = musicxml.m21ToXml.GeneralObjectExporter(s)
    out = GEX.parse()
    outStr = out.decode('utf-8').strip()
    return Response(outStr, mimetype='text/xml')
