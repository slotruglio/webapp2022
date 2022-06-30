'use strict';

const sqlite = require('sqlite3');

const db = new sqlite.Database('./db.sqlite', (err) => {
    if (err) {

        // debug stuff
        console.error(err.message);

        throw err;
    }
});

// this function enables the foreign key constraint
db.get("PRAGMA foreign_keys=ON");

module.exports = { db };