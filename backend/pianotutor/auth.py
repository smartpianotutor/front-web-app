import functools
import hashlib

from flask import (
    Blueprint, g, jsonify, request, session
)

from pianotutor.db import get_db
from pianotutor.shared import error_response

bp = Blueprint('auth', __name__, url_prefix='/auth')


def login_required(view):
    """View decorator that redirects anonymous users to the login page."""
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return error_response('Must be logged in')

        return view(**kwargs)

    return wrapped_view


@bp.before_app_request
def load_logged_in_user():
    """If a user id is stored in the session, load the user object from
    the database into ``g.user``."""
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM User WHERE user_id = ?', (user_id,)
        ).fetchone()


@bp.route('/register', methods=('POST',))
def register():
    """Register a new user.
    Ensure username is not already taken. Create a hash of the password to
    provide security in the event of a database leak
    """
    username = request.form['username']
    password = request.form['password']
    db = get_db()

    if not username:
        return error_response('Username is required.')
    elif not password:
        return error_response('Password is required.')
    elif db.execute(
            'SELECT user_id FROM User WHERE username = ?', (username,)
    ).fetchone() is not None:
        return error_response('User {0} is already registered.'.format(username))

    # Store in database
    db.execute(
        'INSERT INTO User (username, password_sha256) VALUES (?, ?)',
        (username, hashlib.sha256(password).hexdigest())
    )
    db.commit()
    return jsonify({'error': None})


@bp.route('/login', methods=('POST',))
def login():
    """Log in a registered user by adding the user id to the session."""
    username = request.form['username']
    password = request.form['password']
    password_sha256 = hashlib.sha256(password).hexdigest()

    db = get_db()
    user = db.execute(
        'SELECT * FROM User WHERE username = ?', (username,)
    ).fetchone()

    if user is None:
        return error_response('Incorrect username.')
    elif password_sha256 != user['password_sha256']:
        return error_response('Incorrect password.')

    # store the user id in a new session
    session.clear()
    session['user_id'] = user['id']
    return jsonify({'error': None})


@bp.route('/logout')
def logout():
    """Clear the current session, including the stored user id."""
    session.clear()
    return jsonify({'error': None})
