import pathlib

from flask import (
    Blueprint, Response, g, request, jsonify
)
from music21 import *
import random
import collections
import sys
import json
import time
import math

from pianotutor.shared import error_response
from pianotutor.auth import login_required
from pianotutor.db import get_db

bp = Blueprint('api', __name__, url_prefix='/api')

NUM_BARS = 4
NUM_QUARTERS_IN_BAR = 4
CONFIDENCE_THRESHOLD = 20

ability_to_pattern = {
    0: ['whole_beat_a', 'whole_beat_c'],
    1: ['even_division_a', 'even_uneven_division_a'],
    2: ['even_uneven_division_f'],
    3: ['even_division_d', 'even_uneven_division_e', 'uneven_division_a', 'even_uneven_division_d', 'even_division_c', 'even_uneven_division_c'],
    4: ['even_uneven_division_b','even_division_g', 'whole_beat_b', 'uneven_division_c', 'even_division_b', 'even_division_f'],
    5: ['uneven_division_b', 'uneven_uneven_division_a', 'whole_beat_d'],
    6: ['even_division_e', 'multi_beat_a', 'uneven_division_d'],
    7: ['multi_beat_b', 'uneven_uneven_division_b']
}

note_ability_data = {}

def reverse_ability_lookup(func_name):
    for k,v in ability_to_pattern.items():
        if func_name in v:
            return k

midi_to_note = collections.OrderedDict([(55, 'G3'), (57, 'A3'), (59, 'B3'), (60, 'C4'), (62, 'D4'), (64, 'E4'), (65, 'F4'), (67, 'G4'), (69, 'A4'), (71, 'B4'), (72, 'C5'), (74, 'D5'), (76, 'E5')])

note_difficulties = []

def update_note_difficulties(midi_ids, difficulty):
    for midi_id in midi_ids:
        note_difficulties.append([midi_id, difficulty])

def whole_beat_a(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    return [note.Note(base_n, quarterLength=1)]

def whole_beat_b(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    return [note.Note(base_n, quarterLength=3)]

def whole_beat_c(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    return [note.Note(base_n, quarterLength=2)]

def whole_beat_d(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    return [note.Note(base_n, quarterLength=4)]

def multi_beat_a(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, quarterLength=1.5)
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='eighth')
    return [n1,n2]

def multi_beat_b(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, type='eighth')
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], quarterLength=1)
    n3 = note.Note(list(midi_to_note.items())[base_n_index - 2][1], type='eighth')
    return [n1,n2,n3]

def even_division_a(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note(base_n, type='eighth')
    n2.beams.fill(1, 'stop')
    return [n1,n2]

def even_division_b(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note(base_n, type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note(base_n, type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_c(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='eighth')
    n2.beams.fill(1, 'stop')
    return [n1,n2]

def even_division_d(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_e(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note(base_n, type='eighth')
    n2.beams.fill(1, 'continue')
    n3 = note.Note(base_n, type='eighth')
    n3.beams.fill(1, 'stop')
    return [n1,n2,n3]

def even_division_f(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.fill(2, 'start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='16th')
    n2.beams.fill(2, 'continue')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n3.beams.fill(2, 'continue')
    n4 = note.Note(list(midi_to_note.items())[base_n_index + 3][1], type='16th')
    n4.beams.fill(2, 'stop')
    return [n1,n2,n3,n4]

def even_division_g(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='eighth')
    n1.beams.fill(1, 'start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='eighth')
    n2.beams.fill(1, 'continue')
    n3 = note.Note(list(midi_to_note.items())[base_n_index - 2][1], type='eighth')
    n3.beams.fill(1, 'stop')
    return [n1,n2,n3]

def even_uneven_division_a(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, type='eighth')
    n1.beams.append('start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note(base_n, type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_b(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note(base_n, type='eighth')
    n3.beams.append('stop')
    return [n1,n2, n3]

def even_uneven_division_c(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='eighth')
    n1.beams.append('start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_d(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note(list(midi_to_note.items())[base_n_index - 1][1], type='eighth')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_e(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='eighth')
    n1.beams.append('start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='16th')
    n2.beams.append('continue')
    n2.beams.append('start')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n3.beams.append('stop')
    n3.beams.append('stop')
    return [n1,n2,n3]

def even_uneven_division_f(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='16th')
    n2.beams.append('continue')
    n2.beams.append('stop')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='eighth')
    n3.beams.append('stop')
    return [n1,n2,n3]

def uneven_division_a(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, quarterLength=0.75)
    n1.beams.append('start')
    n2 = note.Note(base_n, type='16th')
    n2.beams.append('stop')
    n2.beams.append('partial', 'left')
    return [n1,n2]

def uneven_division_b(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note(base_n, quarterLength=0.75)
    n2.beams.append('stop')
    return [n1,n2]

def uneven_division_c(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, quarterLength=0.75)
    n1.beams.append('start')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='16th')
    n2.beams.append('stop')
    n2.beams.append('partial', 'left')
    return [n1,n2]

def uneven_division_d(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], quarterLength=0.75)
    n2.beams.append('stop')
    return [n1,n2]

def uneven_uneven_division_a(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note(base_n, type='eighth')
    n2.beams.append('continue')
    n3 = note.Note(base_n, type='16th')
    n3.beams.append('stop')
    n3.beams.append('partial', 'left')
    return [n1,n2,n3]


def uneven_uneven_division_b(base_midi_id):
    base_n = midi_to_note[base_midi_id]
    base_n_index = list(midi_to_note.keys()).index(base_midi_id)
    n1 = note.Note(base_n, type='16th')
    n1.beams.append('start')
    n1.beams.append('partial', 'right')
    n2 = note.Note(list(midi_to_note.items())[base_n_index + 1][1], type='eighth')
    n2.beams.append('continue')
    n3 = note.Note(list(midi_to_note.items())[base_n_index + 2][1], type='16th')
    n3.beams.append('stop')
    n3.beams.append('partial', 'left')
    return [n1,n2,n3]

def does_include_ties(p, focus_pattern):
    quarterLength_so_far = p.duration.quarterLength
    for note in focus_pattern:
        if quarterLength_so_far % 4 != 0: #not full
            old_num_measures = math.ceil(quarterLength_so_far/4)
            quarterLength_so_far += note.quarterLength
            new_num_measures = math.ceil(quarterLength_so_far/4)
            if new_num_measures > old_num_measures:
                return True
    return False

@bp.route('/get_sheet_music', methods=('GET',))
@login_required
def get_sheet_music():
    """Get next sheet music for user."""
    note_difficulties.clear()
    db = get_db()
    user = g.user[0]
    results = db.execute('SELECT midi_id, ability FROM UserAbility WHERE user_id = ? ;', (user, )).fetchall()
    for result in results:
        note_ability_data[result[0]] = result[1]

    sc = stream.Score()
    p = stream.Part()

    #find the focus note
    first_min = min(note_ability_data, key=note_ability_data.get)
    focus_note_list = [key for key in note_ability_data.keys() if note_ability_data[key]==note_ability_data[first_min]]
    focus_note = random.SystemRandom().choice(focus_note_list)

    #find the passive note pool
    first_max = max(note_ability_data, key=note_ability_data.get)
    passive_note_list = [key for key in note_ability_data.keys() if note_ability_data[key]==note_ability_data[first_max]]
    if focus_note in passive_note_list: passive_note_list.remove(focus_note)

    # add initial half focus note
    p.append(whole_beat_c(focus_note))
    update_note_difficulties([focus_note], reverse_ability_lookup("whole_beat_c"))
    
    while(p.duration.quarterLength < (NUM_BARS * NUM_QUARTERS_IN_BAR)):
        # find focus pattern pool
        focus_pattern_list = ability_to_pattern[note_ability_data[focus_note]]
        # find focus pattern that fits
        focus_pattern_iterations = 0
        while True:
            focus_pattern_func = random.SystemRandom().choice(focus_pattern_list)
            focus_ability = reverse_ability_lookup(focus_pattern_func)
            focus_pattern = eval(focus_pattern_func)(focus_note)
            if not does_include_ties(p, focus_pattern):
                p.append(focus_pattern)
                break
            focus_pattern_iterations += 1
            if focus_pattern_iterations == 100:
                focus_pattern = [note.Note(midi_to_note[focus_note], quarterLength = 0.5)]
                p.append(focus_pattern)
                break
        update_note_difficulties(map(lambda note: note.pitch.midi, focus_pattern), focus_ability)

        # find passive pattern pool
        passive_note = random.SystemRandom().choice(passive_note_list)
        passive_pattern_list = []
        for ability in range(0, note_ability_data[passive_note]+1):
            passive_pattern_list.extend(ability_to_pattern[ability])
        # find passive pattern that fits
        passive_pattern_iterations = 0
        while True:
            passive_pattern_func = random.SystemRandom().choice(passive_pattern_list)
            passive_ability = reverse_ability_lookup(passive_pattern_func)
            passive_pattern = eval(passive_pattern_func)(passive_note)
            if not does_include_ties(p, passive_pattern):
                p.append(passive_pattern)
                break
            passive_pattern_iterations += 1
            if passive_pattern_iterations == 100:
                passive_pattern = [note.Note(midi_to_note[passive_note], quarterLength = 0.5)]
                p.append(passive_pattern)
                break
        update_note_difficulties(map(lambda note: note.pitch.midi, passive_pattern), passive_ability)

    
    while(p.quarterLength > (NUM_BARS * NUM_QUARTERS_IN_BAR)):
        p.pop(len(p) - 1)
        note_difficulties.pop(-1)
    
    sc.append(p)
    sc.insert(0, metadata.Metadata())
    note_difficulties_json = json.dumps(note_difficulties)
    db.execute(
       'INSERT INTO Snippet (note_metadata) VALUES (?);', (note_difficulties_json, )
    )
    snippet_id = db.execute('SELECT snippet_id FROM Snippet ORDER BY snippet_id DESC LIMIT 1;').fetchone()[0]
    sc.metadata.title = snippet_id
    db.commit()

    GEX = musicxml.m21ToXml.GeneralObjectExporter(sc)
    out = GEX.parse()
    outStr = out.decode('utf-8').strip()

    # difficulty = note_ability_data[first_min]
    # f = open(str(pathlib.Path(__file__).parent)+"/out/%d-%.20f.xml" % (difficulty, time.time()),'w')
    # f.write(outStr)
    # f.close()

    return Response(outStr, mimetype='text/xml')


@bp.route('/update_abilities', methods=('POST',))
@login_required
def update_abilities():
    """Update the user's abilities given a snippet_id and performance vector."""
    db = get_db()
    user = g.user[0]
    snippet_id = int(request.form['snippet_id'])
    print(request.form["performance"])
    performance = json.loads(request.form['performance'])

    res = db.execute("select * from Snippet where snippet_id = ?", (snippet_id,))
    snippet_metadata = json.loads(res.fetchone()[1])
    res = db.execute('select midi_id, ability, confidence from UserAbility where user_id = ?',
                     (user,)).fetchall()

    # map of midi_id => (ability, confidence)
    prev_user_abilities = {}
    next_user_abilities = {}
    for r in res:
        prev_user_abilities[r[0]] = (r[1], r[2])
        next_user_abilities[r[0]] = [r[1], r[2]]

    assert len(snippet_metadata) == len(performance)
    for i in range(len(performance)):
        midi_id, difficulty = snippet_metadata[i]
        if midi_id not in prev_user_abilities: continue  # TODO: check with Riya if we can ignore this
        prev_ability = next_user_abilities[midi_id][0]
        prev_confidence = next_user_abilities[midi_id][1]
        hit_note = performance[i]

        # reset confidence if they miss a note
        if not hit_note and difficulty <= prev_ability:
            next_user_abilities[midi_id][1] = 0
            continue

        # They are already at the max level, nothing to do
        if prev_ability >= 7:
            continue

        if hit_note and difficulty >= prev_ability:
            # If they hit the note and are at confidence = 10 for that note,
            # then "level up" their ability level and reset confidence
            if prev_confidence == CONFIDENCE_THRESHOLD-1:
                next_user_abilities[midi_id][0] += 1
                next_user_abilities[midi_id][1] = 0
            # Otherwise just increase their confidence by 1
            else:
                next_user_abilities[midi_id][1] += 1

    unique_notes_in_snippet = set(map(lambda x: x[0], snippet_metadata))
    output = {}
    for midi_id in unique_notes_in_snippet:
        if midi_id not in prev_user_abilities: continue  # TODO: check with Riya if we can ignore this
        prev_score = prev_user_abilities[midi_id][0]*CONFIDENCE_THRESHOLD + prev_user_abilities[midi_id][1]
        next_score = next_user_abilities[midi_id][0]*CONFIDENCE_THRESHOLD + next_user_abilities[midi_id][1]
        delta = next_score - prev_score

        output[midi_id] = {
            'ability': next_user_abilities[midi_id][0],
            'confidence': next_user_abilities[midi_id][1],
            'delta': delta,
        }

    for midi_id, new_value in output.items():
        db.execute("update UserAbility set ability=?, confidence=? where user_id = ? and midi_id=?",
                   (new_value['ability'], new_value['confidence'], user, midi_id))
    db.commit()
    return jsonify(output)
