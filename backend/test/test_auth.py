import pytest
from flask import g, session
from pianotutor.db import get_db


def test_register(client, app):
    # test that successful registration redirects to the login page
    response = client.post(
        '/auth/register', data={'username': 'a', 'password': 'a'}
    )

    # test that the user was inserted into the database
    with app.app_context():
        assert get_db().execute(
            "select * from User where username = 'a'",
        ).fetchone() is not None


@pytest.mark.parametrize(('username', 'password', 'message'), (
    ('', '', b'Username is required.'),
    ('a', '', b'Password is required.'),
    ('test', 'test', b'already registered'),
))
def test_register_validate_input(client, username, password, message):
    response = client.post(
        '/auth/register',
        data={'username': username, 'password': password}
    )
    assert message in response.data


def test_login(client, auth):
    auth.login()

    # login request set the user_id in the session
    # check that the user is loaded from the session
    with client:
        client.get('/hello')  # start session
        assert session['user_id'] == 1
        assert g.user['username'] == 'test'


@pytest.mark.parametrize(('username', 'password', 'message'), (
    ('a', 'test', b'Incorrect username.'),
    ('test', 'a', b'Incorrect password.'),
))
def test_login_validate_input(auth, username, password, message):
    response = auth.login(username, password)
    assert message in response.data


def test_logout(client, auth):
    auth.login()

    with client:
        auth.logout()
        assert 'user_id' not in session