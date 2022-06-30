'use strict';

/* Data Access Object (DAO) module for accesing study plan */

const { db } = require('../dbUtility');
/*
- Table `STUDYPLAN` - contains student id, type of study plan 
(as boolean if TRUE full-time else part-time), min and max cfu for the study plan type, 
actual cfu as follows 
- (student, fulltime, minCfu, maxCfu, actualCfu)
- Table `STUDYPLAN_COURSE` - contains student id and course id as follows
- (student, course)"
*/

/**
 * Returns the study plan info of a student.
 * @param {*} studentId 
 * @returns {Promise<Map>} promise that resolves to the study plan of a student
 */
const getStudyPlanInfo = (studentId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM STUDYPLAN WHERE student = ?', [studentId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 404, message: 'Study plan not found' });
            }
            else {
                resolve({
                    student: row.student,
                    studyPlanType: row.fulltime ? 'full-time' : 'part-time',
                    minCfu: row.minCfu,
                    maxCfu: row.maxCfu,
                    actualCfu: row.actualCfu,
                });
            }
        });
    });
};

/**
 * Returns the courses's ids of a student.
 * @param {*} studentId
 * @returns {Promise<Array>} promise that resolves to the courses of a student
 */
const getCourses = (studentId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT course FROM STUDYPLAN_COURSE WHERE student = ?', [studentId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const courses = rows.map((row) => row.course);
                resolve(courses);
            }
        });
    });
};

/**
 * Returns the courses of a student.
 * @param {*} studentId
 * @returns {Promise<Array>} promise that resolves to the courses of a student
 */
 const getCoursesInfo = (studentId) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT id, name, cfu, required, maxS, actualS 
                FROM STUDYPLAN_COURSE AS S JOIN COURSE AS C ON S.course = C.id
                WHERE student = ?
                ORDER BY name`
                , [studentId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * creates a new study plan for a student.
 * @param {*} studentId
 * @param {Boolean} studyplanType
 * @param {*} minCfu
 * @param {*} maxCfu
 * @param {*} actualCfu
 * @returns {Promise<Boolean>} promise that resolves to true if the study plan was created successfully and false otherwise
 */
const createStudyPlan = (studentId, studyplanType, minCfu, maxCfu, actualCfu) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO STUDYPLAN (student, fulltime, minCfu, maxCfu, actualCfu) VALUES (?, ?, ?, ?, ?)';
        db.run(query, [studentId, studyplanType, minCfu, maxCfu, actualCfu], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    resolve({ error: 409, message: 'Study plan already exists' });
                } else {
                    reject(err);
                }
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

/**
 * Updates a student's study plan.
 * @param {*} studentId
 * @param {*} actualCfu
 * @returns {Promise<Boolean>} promise that resolves to true if the study plan was updated successfully and false otherwise
 */
const updateStudyPlan = (studentId, actualCfu) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE STUDYPLAN SET actualCfu = ? WHERE student = ?';
        db.run(query, [actualCfu, studentId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

/**
 * Delete study plan of a student.
 * @param {*} studentId 
 * @returns {Promise<Boolean>} promise that resolves to true if the study plan was deleted successfully and false otherwise
 */
const deleteStudyPlan = (studentId) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM STUDYPLAN WHERE student = ?', [studentId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

/**
 * Adds courses to a student's study plan.
 * @param {*} studentId 
 * @param {*} courses 
 * @returns {Promise<Boolean>} promise that resolves to true if the courses were added successfully and false otherwise
 */
const addCourses = (studentId, courses) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO STUDYPLAN_COURSE (student, course) VALUES (?, ?)';
        let statement = db.prepare(query);

        for (let i = 0; i < courses.length; i++) {
            statement.run([studentId, courses[i]], function (err) {
                if (err) {
                    reject(err);
                }
            });
        }
        statement.finalize();
        resolve(true);
    });
}

/**
 * Removes courses from a student's study plan.
 * @param {*} studentId
 * @param {*} courses
 * @returns {Promise<Boolean>} promise that resolves to true if the courses were removed successfully and false otherwise
 */
const removeCourses = (studentId, courses) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM STUDYPLAN_COURSE WHERE student = ? and course = ?';
        let statement = db.prepare(query);

        for (let i = 0; i < courses.length; i++) {
            statement.run([studentId, courses[i]], function (err) {
                if (err) {
                    reject(err);
                }
            });
        }

        statement.finalize();
        resolve(true);
    });
}


/**
 * Calculate the cfu of a student.
 * @param {*} studentId
 * @returns {Promise<Number>} promise that resolves to the cfu of a student
 */
const calculateCfu = (studentId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT SUM(cfu) as sumCFU FROM COURSE WHERE id IN (SELECT course FROM STUDYPLAN_COURSE WHERE student = ?)';
        db.get(query, [studentId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                resolve(row.sumCFU);
            } else {
                resolve(0);
            }
        });
    });
}

module.exports = {
    getStudyPlanInfo, createStudyPlan, updateStudyPlan, deleteStudyPlan,
    getCourses, getCoursesInfo, addCourses, removeCourses,
    calculateCfu
};