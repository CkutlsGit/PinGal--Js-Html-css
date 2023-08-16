const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/comments.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS comm
            (id INTEGER PRIMARY KEY, description TEXT, author TEXT, ico BLOB, postid INTEGER)
    `;
    db.run(sql);
});

class PostComment {
    static All(cb) {
        db.all('SELECT * FROM comm', cb);
    };
    
    static Add(data, cb) {
        const { description, author, ico, postid } = data;
        const sql = 'INSERT INTO comm (description, author, ico, postid) VALUES (?, ?, ?, ?)';
        db.run(sql, [description, author, ico, postid], cb);
    }

    static Delete(id, cb) {
        db.run('DELETE FROM comm WHERE id = ?', id, cb);
    };

    static UpdateUserIcon(login, ico, cb) {
        const sql = 'UPDATE comm SET ico = ? WHERE author = ?';
        db.run(sql, [ico, login], cb);
    };
};

module.exports = PostComment;