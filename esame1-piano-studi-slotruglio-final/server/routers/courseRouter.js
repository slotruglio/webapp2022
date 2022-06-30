'use strict';

const express = require('express');
const router = express.Router();

const courseDao = require('../dao/courseDao');

/**
 * get all courses from database with their respective incompatibilities
 */
router.get('/courses', async (req, res) => {
    try {
        // get all courses from database
        const courses = await courseDao.getAllCourses();

        let coursesWithIncompatibleCourses = [];
        // for each course, get the incompatibilities courses' ids
        for (const course of courses) {
            const incompatibleCoursesIds = await courseDao.getIncompatibilitiesOfCourse(course.id);
            if (incompatibleCoursesIds.length == 0) {
                coursesWithIncompatibleCourses.push(course);

            } else {
                let incompatibleCourses = [];
                // for each incompatibility course id, get the course info
                for (const id of incompatibleCoursesIds) {
                    const incompatibleCourse = await courseDao.getCourseById(id);
                    incompatibleCourses.push(incompatibleCourse);

                }
                // add the incompatibilities courses to the course
                coursesWithIncompatibleCourses.push({
                    ...course,
                    incompatibles: incompatibleCourses
                });
            }
        }
        return res.status(200).json(coursesWithIncompatibleCourses);
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;