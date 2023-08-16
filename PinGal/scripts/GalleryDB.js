const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/gallery.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS gallery
            (id INTEGER PRIMARY KEY, title TEXT, description TEXT, image BLOB, author TEXT)
    `;
    db.run(sql);
});

/*

Class Gallery - All, Find, Add, Delete

*/


class Gallery {
    static All(cb) {
        db.all('SELECT * FROM gallery', cb);
    };

    static Find(id, cb) {
        db.get('SELECT * FROM gallery WHERE id = ?', id, cb);
    };

    static Add(data, cb) {
        const { title, description, image, author } = data;
        const sql = 'INSERT INTO gallery (title, description, image, author) VALUES (?, ?, ?, ?)';
        db.run(sql, [title, description, image, author], cb);
      };      

    static Delete(id, cb) {
        db.run('DELETE FROM gallery WHERE id = ?', id, cb);
    };
};

module.exports = Gallery;