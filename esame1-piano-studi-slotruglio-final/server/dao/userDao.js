'use strict';

/* Data Access Object (DAO) module for accesing users */

const crypto = require('crypto');
const {db} = require('../dbUtility');

/**
 * Return user info for a given user.
 * @param {*} userId
 * @returns {Promise<Map>} user info for a given user
 */
const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id, name, surname, email FROM USER WHERE id= ?', [userId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 404, message: 'User not found' });
            } else {
                resolve({
                    id: row.id,
                    name: row.name,
                    surname: row.surname,
                    email: row.email
                });
            }
        });
    });
}

/**
 * Return user info for a given user if exist and password is correct.
 * @param {*} email user email
 * @param {*} password user password
 * @returns {Promise<Map>} user info for a given user
 */
const getUserByEmail = (email, pwd) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM USER WHERE email= ?', [email], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve(false);
            } else {

                // check if password is correct
                crypto.scrypt(pwd, row.salt, 64, (err, hashedPwd) => {
                    if (err) reject(err);

                    const hashFromDb = Buffer.from(row.hash, 'hex');

                    if (!crypto.timingSafeEqual(hashFromDb, hashedPwd)) {
                        resolve(false);
                    } else resolve({
                        id: row.id,
                        name: row.name,
                        surname: row.surname,
                        email: row.email
                    });
                })
            }
        });
    });
}

module.exports = { getUserById, getUserByEmail };