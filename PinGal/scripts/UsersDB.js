const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/user.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS userprofile
            (id INTEGER PRIMARY KEY, login TEXT, password TEXT, ico BLOB)
    `;
    db.run(sql);
});

class UserProfile {
    static Find(login, cb) {
        db.get('SELECT * FROM userprofile WHERE login = ?', login, cb);
    };

    static FreeLogin(login, cb) {
        db.get('SELECT COUNT(*) as count FROM userprofile WHERE login = ?', login, (err, row) => {
            if (err) return cb(err);

            const isFree = row.count === 0;
            cb(null, isFree);
        });
    };

    static Register(data, cb) {
        const { login, password } = data;

        UserProfile.FreeLogin(login, (err, isFree) => {
            if (err) return cb(err);

            if (!isFree) {
                return cb('Логин уже занят!');
            }

            const sql = 'INSERT INTO userprofile (login, password) VALUES (?, ?)';
            db.run(sql, [login, password], (err) => {
                if (err) return cb(err);
                cb(null);
            });
        });
    };

    static Auth(login, password, cb) {
        db.get('SELECT * FROM userprofile WHERE login = ? AND password = ?', [login, password], (err, data) => {
            if (err) return cb(err);

            cb(null, data);
        });
        
    };

    static Delete(cb, login) {
        db.run('DELETE FROM userprofile WHERE login = ?', login, cb);
    };

    static Get(cb) {
        db.all('SELECT * FROM userprofile', (err, rows) => {
          if (err) return cb(err);
          cb(null, rows);
        });
    };

    static UpdIco(login, ico, cb) {
        const sql = 'UPDATE userprofile SET ico = ? WHERE login = ?';
        db.run(sql, [ico, login], cb);
    };
};

module.exports = UserProfile;
