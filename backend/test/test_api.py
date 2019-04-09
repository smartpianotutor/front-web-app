import pytest
from flask import g, session
from pianotutor.db import get_db
import re
import json
import sys
from music21 import *
from xml.etree import ElementTree as ET

def test_get_sheet_music(app, client, auth):
    auth.login()
    with client, app.app_context():
        db = get_db()
        res = client.get('/api/get_sheet_music')
        # check if generated music is valid musicxml
        valid_xml = 1
        try:
            ET.fromstring(res.data.decode("utf-8"))
        except ET.ParseError:
            valid_xml = 0
        assert valid_xml == 1, "Invalid XML Format"
        sc = converter.parseData(res.data.decode("utf-8"))
        note_list = []
        for note in sc.flat.notes:
            note_list.append(note)
        assert len(note_list) != 0, "Invalid MusicXML: no notes contained"

        # Test if generated music is playable
        octave_list = map(lambda note: note.octave, note_list)
        playable = 0
        if all(octave == 2 or octave == 4 or octave == 5 for octave in octave_list):
            playable = 1
        assert playable == 1, "Music is not playable for training, more than 3 octaves apart"

        # Test if note difficulties are populated
        matches = re.search('<work-title>(\d+)</work-title>', res.data.decode("utf-8"))
        snippet_id = int(matches.group(1))
        res = db.execute("select * from Snippet where snippet_id = ?", (snippet_id,))
        snippet_metadata = json.loads(res.fetchone()[1])
        print("note_list: ", note_list)
        assert len(snippet_metadata) == len(note_list), "Snippet note difficulties was not populated correctly"
        
        # Test note indicator exists
        assert note_list[0].quarterLength == 2, "Incorrect focus note indicator"
        
        # Test correct focus note choice (least ability note)
        res = db.execute("select midi_id, ability from UserAbility where user_id = ?", (g.user[0],))
        note_ability_data = {int(m[0]): int(m[1]) for m in res.fetchall()}
        first_min = min(note_ability_data, key=note_ability_data.get)
        lowest_ability_midis = [key for key in note_ability_data.keys() if note_ability_data[key]==note_ability_data[first_min]]
        assert note_list[0].pitch.midi in lowest_ability_midis, "Incorrect focus note: not the lowest ability"


def test_update_abilities(app, client, auth):
    """Simulate perfect play up until the user stops improving.
       At that point, the user should have level 7 for every note."""
    auth.login()  # login as username=test

    with client, app.app_context():
        db = get_db()
        i = 0

        # Practice loop. Exist when user stops improving their ability scores
        while True:
            res = client.get('/api/get_sheet_music')
            matches = re.search('<work-title>(\d+)</work-title>', res.data.decode("utf-8"))
            snippet_id = int(matches.group(1))

            res = db.execute("select * from Snippet where snippet_id = ?", (snippet_id,))
            snippet_metadata = json.loads(res.fetchone()[1])

            res = db.execute("select midi_id, ability, confidence from UserAbility where user_id = ?", (g.user[0],))
            abilities = {int(m[0]): (int(m[1]), int(m[2])) for m in res.fetchall()}

            # simulate the frontend returning a perfect play
            result = json.dumps([True]*len(snippet_metadata))

            res = client.post(
                '/api/update_abilities',
                data={
                    'snippet_id': str(snippet_id),
                    'performance': result
                })

            new_abilities = json.loads(res.data.decode("utf-8"))
            new_abilities = {int(k): v for k, v in new_abilities.items()}

            focus_notes = {n[0] for n in snippet_metadata if n[0] in abilities and n[1] >= abilities[n[0]][0]}

            # assert the user improved on each focus note present in the sheet music
            total_change = 0
            for midi_id, new_ability in new_abilities.items():
                # if it's a focus note then we should improve our ability (unless we max our level at 7)
                if midi_id in focus_notes and not (new_ability['delta'] > 0 or new_ability['ability'] == 7):
                    assert False

                # if it's not a focus not, we should not improve
                if midi_id not in focus_notes and new_ability['delta'] != 0:
                    assert False

                total_change += abs(new_ability['delta'])

            # check if user stopped improving
            if total_change == 0: break
            i += 1
            # print(i, total_change, abilities)

        for midi_id, new_value in new_abilities.items():
            assert new_value['ability'] == 7

