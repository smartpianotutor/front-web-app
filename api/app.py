import music21

# music21.environment.set('musicxmlPath', '/usr/bin/musescore')
# river = music21.converter.parse('river.mxl')
# riverChords = river.chordify()
# riverChords.show('text')

# for n in riverChords.getElementsByClass(music21.stream.Measure):
#     print(n)
# pass
# riverChords.show()

from flask import Flask, session, request
from create_db import create_db
import sqlite3
import hashlib
import os


def create_app(dbname):
    app = Flask(__name__)
    create_db(dbname)

    db_conn = sqlite3.connect(dbname)
    db_cursor = db_conn.cursor()


    @app.route('/api/hello')
    def hello_world():
        return 'Hello, World!'


    @app.route('/api/register', methods=['POST'])
    def register():
        username = request.form['username']
        password1 = request.form['password1']
        password2 = request.form['password2']

        if password1 != password2:
            return '{"success": false}'
        if not username.isalnum():
            return '{"success": false}'

        password_sha256 = hashlib.sha256(password1).hexdigest()
        q = 'insert into User (username, password_sha256) values ({}, {})'
        db_cursor.execute(q.format(username, password_sha256))
        return '{"success": true}'


    @app.route('/api/login', methods=['POST'])
    def login():
        username = request.form['username']
        password1 = request.form['password']

        if not username.isalnum():
            return '{"success": false}'
        password_sha256 = hashlib.sha256(password1).hexdigest()

        q = "select user_id from User where username = '{}' and password_sha256='{}'"
        res = db_cursor.execute(q.format(username, password_sha256))
        if res.rowcount != 1:
            return '{"success": false}'

        userid = res.fetchone()[0]
        session['userid'] = userid
        return '{"success": true}'


    @app.route('/api/logout', methods=['GET'])
    def logout():
        if session.get('userid', None) is not None:
            session.pop('userid', None)
            return '{"success": true}'
        else:
            return '{"success": false}'

    app.run(host='0.0.0.0')


if __name__ == '__main__':
    create_app('database.sqlite')