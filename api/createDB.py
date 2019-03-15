
import sqlite3
import time

start = time.time()
conn = sqlite3.connect('test.db')
c = conn.cursor()

c.executescript('''
    DROP TABLE IF EXISTS User;
    DROP TABLE IF EXISTS PracticeSession;
    DROP TABLE IF EXISTS Snippet;
    DROP TABLE IF EXISTS Note;
    DROP TABLE IF EXISTS AuthToken;
    DROP TABLE IF EXISTS UserAbility;
    DROP TABLE IF EXISTS PlayedNote;
    
    CREATE TABLE User (
        user_id INTEGER PRIMARY KEY,
        username TEXT,
        password_sha256 TEXT
    );
    
    CREATE TABLE Snippet (
    snippet_id INTEGER PRIMARY KEY,
    musicxml TEXT,
    time_created DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE PracticeSession (
        timestamp DATETIME PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
        snippet_id INTEGER,
        user_id INTEGER,
        FOREIGN KEY (snippet_id) REFERENCES Snippet (snippet_id)
        FOREIGN KEY (user_id) REFERENCES User (user_id)
    );
    
    CREATE TABLE Note (
        midi_id INTEGER PRIMARY KEY
    );
    
    CREATE TABLE AuthToken (
        token TEXT PRIMARY KEY,
        expire_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES User (user_id)
    );
    
    CREATE TABLE PlayedNote(
        snippet_time_played DATETIME NOT NULL,
        midi_id INTEGER NOT NULL,
        snippet_finished_time DATETIME NOT NULL,
        FOREIGN KEY (midi_id) REFERENCES Note(midi_id),
        FOREIGN KEY (snippet_finished_time) REFERENCES PracticeSession(timestamp),
        UNIQUE (snippet_time_played, midi_id, snippet_finished_time)
    );
    
    CREATE TABLE UserAbility(
        user_id INTEGER NOT NULL,
        midi_id INTEGER NOT NULL,
        variance_ability FLOAT,
        variance_confidence FLOAT,
        speed_ability FLOAT,
        speed_confidence FLOAT,
        FOREIGN KEY (user_id) REFERENCES User(user_id),
        FOREIGN KEY (midi_id) REFERENCES Note(midi_id),
        UNIQUE (user_id, midi_id)
    );
''')

conn.commit()
conn.close()
end = time.time()
#print((end - start)/60.0)



