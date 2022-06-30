'use strict';

/* Data Access Object (DAO) module for accesing courses */

const { db } = require('../dbUtility');

/**
   * Returns a list of all courses.
   * @returns {Promise<Array>} promise that resolves to an array of courses
*/
const getAllCourses = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM COURSE ORDER BY name', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map((row) => {
                    let course = {}
                    course.id = row.id
                    course.name = row.name
                    course.cfu = row.cfu
                    course.actualS = row.actualS
                    if (row.maxS) course.maxS = row.maxS
                    if (row.required) course.required = row.required

                    return course;
                }));
            }
        });
    });
}

/**
 * Get course info for a given course.
 * @param {*} courseId
 * @returns {Promise<Map>} course info for a given course
 */
const getCourseById = (courseId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM COURSE WHERE id = ?', [courseId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 404, message: `Course ${courseId} not found` })
            }
            else {
                let course = {}
                course.id = row.id
                course.name = row.name
                course.cfu = row.cfu
                course.actualS = row.actualS
                if (row.maxS) course.maxS = row.maxS
                if (row.required) course.required = row.required

                resolve(course);
            }
        });
    });
}


/**
 * Update the actual number of students for a given course.
 * Some courses may have a maximum number of students, 
 * in which case the actual number of students is updated only
 * if the new number of students is less than the maximum number of students.
 * @param {*} courseId
 * @param {Integer} quantity quantity of students to add or remove
 * @returns {Promise<Boolean>} promise that resolves to true if the update was successful, false otherwise
 */
const updateCourseStudents = (courseId, quantity) => {
    return new Promise((resolve, reject) => {
        const query = quantity >= 0 ?
            'UPDATE COURSE SET actualS = actualS + ? WHERE id = ?'
            : 'UPDATE COURSE SET actualS = actualS - ? WHERE id = ?';

        db.run(query, [Math.abs(quantity), courseId], function (err) {
            if (err) {
                // the error is caused by the actual number of students being greater than the maximum number of students
                if (err.message.includes('actualS <= maxS'))
                    resolve({ error: 400, message: "The course "+courseId+" is full" });
                else if (err.message.includes('actualS >= 0'))
                    resolve({ error: 400, message: "Trying to remove more students than the course "+courseId+" has" });
                else reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });

    });
}

/**
 * Add a student to a course.
 * @param {*} courseId
 * @returns {Promise<Boolean>} promise that resolves to true if the update was successful, false otherwise
 */
const addStudentToCourse = (courseId) => {
    return updateCourseStudents(courseId, 1);
}

/**
 * Remove a student to a course.
 * @param {*} courseId
 * @returns {Promise<Boolean>} promise that resolves to true if the update was successful, false otherwise
 */
const removeStudentFromCourse = (courseId) => {
    return updateCourseStudents(courseId, -1);
}

/** 
 * Returns a list of all incompatibilities.
 * @returns {Promise<Array>} promise that resolves to an array of incompatibilities
*/
const getAllIncompatibilities = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM INCOMPATIBILITY', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map((row) => ({ course1: row.course1, course2: row.course2 })));
            }
        });
    });
}

/**
 * Get a list of the incompatible courses for a given course.
 * @param {*} courseId 
 * @returns {Promise<Array>} incompatibilities for a given course
 */
const getIncompatibilitiesOfCourse = (courseId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM INCOMPATIBILITY WHERE course1 = ? OR course2 = ?', [courseId, courseId], (err, rows) => {
            if (err) {
                reject(err);
            } else if (rows.length > 0) {
                const list = []
                for (const row of rows) {
                    if (row.course1 == courseId)
                        list.push(row.course2)
                    else
                        list.push(row.course1)
                }
                resolve(list)
            } else {
                resolve([])
            }
        });
    });
}


module.exports = {
    getAllCourses, getCourseById,
    addStudentToCourse, removeStudentFromCourse,
    getAllIncompatibilities, getIncompatibilitiesOfCourse
};