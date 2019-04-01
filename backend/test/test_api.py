import pytest
from flask import g, session
from pianotutor.db import get_db
import re
import json


def test_update_abilities(app, client, auth):
    auth.login()  # login as username=test

    with client, app.app_context():
        db = get_db()
        res = client.get('/api/get_sheet_music')
        matches = re.search('<work-title>(\d+)</work-title>', res.data.decode("utf-8"))
        snippet_id = int(matches.group(1))

        res = db.execute("select * from Snippet where snippet_id = ?", (snippet_id,))
        snippet_metadata = json.loads(res.fetchone()[1])

        # We don't track every note, so find the ones we track
        res = db.execute("select midi_id from UserAbility where user_id = ?", (g.user[0],))
        tracked_midi_ids = {int(m[0]) for m in res.fetchall()}

        # simulate the frontend returning a perfect play
        result = json.dumps([True]*len(snippet_metadata))

        res = client.post(
            '/api/update_abilities',
            data={
                'snippet_id': str(snippet_id),
                'performance': result
            })

        new_abilities = json.loads(res.data.decode("utf-8"))

        unique_notes_in_snippet = set(map(lambda x: x[0], snippet_metadata))
        assert len(new_abilities) == len(unique_notes_in_snippet.intersection(tracked_midi_ids))

        # assert the user improved
        for midi_id, new_value in new_abilities.items():
            assert new_value['delta'] > 0
