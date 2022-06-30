'use strict';

// import dao
const courseDao = require('../dao/courseDao');
const studyPlanDao = require('../dao/studyPlanDao');

// import utilities
const { getMinMaxCfu } = require('../utilities/utility');

/**
 * Check if the cfus provided are valid
 * @param {Integer} minCfu
 * @param {Integer} maxCfu
 * @param {Integer} actualCfu 
 * @param {*} studyPlanType 
 * @returns {Boolean} true if the cfus are valid
 * @returns {Map}  map with error and message if the cfus are not valid
 */
const checkCfuInBounds = (minCfu, maxCfu, actualCfu, studyPlanType) => {
    const cfuForType = getMinMaxCfu(studyPlanType);
    if (minCfu !== cfuForType.minCfu) {
        return { error: 422, message: 'min cfu is not correct for type ' + studyPlanType };
    }
    if (maxCfu !== cfuForType.maxCfu) {
        return { error: 422, message: 'max cfu is not correct for type ' + studyPlanType };
    }
    if (actualCfu < minCfu || actualCfu > maxCfu) {
        return { error: 422, message: 'actual cfu is not between min and max cfu' };
    }
    return true;
}

/**
 * Check if all the courses are in the database
 * @param {*} courses array of courses to check
 * @returns {Array} array of all courses - if all courses are in the database 
 * @returns {Map}  map with error and message if some courses are not in the database
 */
const checkCoursesInDb = async (courses) => {
    const promises = courses.map((id) => courseDao.getCourseById(id));
    const dbCourses = await Promise.all(promises);
    for (const course of dbCourses) {
        if (course.error) {
            return { error: course.error, message: course.message };
        }
    }
    return dbCourses;
}

/**
 * Check if the courses in a list are compatible with each other
 * @param {Array} courses array of courses ids to check
 * @returns {Bolean} true if the courses are compatible
 * @returns {Map}  map with error and message if the courses are not compatible
 */
const checkCoursesCompatibility = async (coursesIds) => {
    const promises = coursesIds.map((id) => courseDao.getIncompatibilitiesOfCourse(id));
    const incompatibilitiesLists = await Promise.all(promises);
    let incompatibilities = [];
    for (const incompatibilitiesList of incompatibilitiesLists) {
        incompatibilities.push(...incompatibilitiesList);
    }
    for (const id of coursesIds) {
        if (incompatibilities.includes(id)) {
            return {
                error: 400,
                message: 'course ' + id + ' is incompatible with at least another course of the studyplan'
            };
        }
    }
    return true;
}

/**
 * Check if there are courses with required courses
 * and if the required courses are in the studyplan
 * @param {Array} courses array of courses to check
 * @returns {Bolean} true if there are no required courses or if all required courses are in the array
 * @returns {Map}  map with error and message if there are required courses not in the array
 */
const checkRequiredCourses = (courses) => {
    const coursesIds = courses.map((course) => course.id);
    for (const course of courses) {
        if (course.required) {
            if (!coursesIds.includes(course.required)) {
                return {
                    error: 400,
                    message: 'course ' + course.required + ' is required by ' + course.id + ' but not included in the studyplan'
                };
            }
        }
    }
    return true;
}

/**
 * Check if there are courses with maximum of students and they are full
 * @param {Array} courses array of courses to check
 * @returns {Bolean} true if there are no full courses
 * @returns {Map}  map with error and message if there is a full course
 */
const checkFullCourses = (courses) => {
    for (const course of courses) {
        if (course.maxS) {
            if (course.maxS < course.actualS + 1) {
                return {
                    error: 400,
                    message: 'course ' + course.id + ' is full'
                };
            }
        }
    }
    return true;
}

/**
 * Add a student to a list of courses given their ids
 * @param {Array} courses array of courses' ids to add the student to
 * @returns {Boolean} true if the student is added to all the courses
 * @returns {Map}  map with error and message if the student is not added to all the courses
 */
const addStudentToCourses = async (coursesIds) => {
    const promises = coursesIds.map((id) => courseDao.addStudentToCourse(id));
    const updateResult = await Promise.all(promises);
    for (const update of updateResult) {
        if (update.error) {
            return { error: update.error, message: update };
        }
    }
    return true;
}


module.exports = {
    checkCfuInBounds, checkCoursesInDb, checkCoursesCompatibility,
    checkRequiredCourses, checkFullCourses,
    addStudentToCourses
}