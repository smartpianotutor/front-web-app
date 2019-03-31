CREATE TABLE IF NOT EXISTS User (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password_sha256 TEXT
);

CREATE TABLE IF NOT EXISTS Snippet (
    snippet_id INTEGER PRIMARY KEY,
    note_metadata TEXT,
    time_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PracticeSession (
    timestamp DATETIME PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
    snippet_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (snippet_id) REFERENCES Snippet (snippet_id),
    FOREIGN KEY (user_id) REFERENCES User (user_id)
);

CREATE TABLE IF NOT EXISTS Note (
    midi_id INTEGER PRIMARY KEY
);

INSERT INTO Note(midi_id) VALUES 
	(60), (62), (64), (65), (67), (69), (71);

CREATE TABLE IF NOT EXISTS AuthToken (
    token TEXT PRIMARY KEY,
    expire_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES User (user_id)
);

CREATE TABLE IF NOT EXISTS PlayedNote(
    snippet_time_played DATETIME NOT NULL,
    midi_id INTEGER NOT NULL,
    snippet_finished_time DATETIME NOT NULL,
    FOREIGN KEY (midi_id) REFERENCES Note(midi_id),
    FOREIGN KEY (snippet_finished_time) REFERENCES PracticeSession(timestamp),
    UNIQUE (snippet_time_played, midi_id, snippet_finished_time)
);

CREATE TABLE IF NOT EXISTS UserAbility(
    user_id INTEGER NOT NULL,
    midi_id INTEGER NOT NULL,
    ability INTEGER DEFAULT 0,
    confidence INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (midi_id) REFERENCES Note(midi_id),
    UNIQUE (user_id, midi_id)
);

CREATE TRIGGER create_abilities_for_user AFTER INSERT
	ON User
    BEGIN
        INSERT INTO UserAbility(user_id, midi_id) 
        SELECT u.user_id, n.midi_id 
        FROM User u, Note n 
        WHERE u.user_id = NEW.user_id;
	END;