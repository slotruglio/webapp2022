'use strict';

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const { getMinMaxCfu } = require('../utilities/utility');
const studyPlanDao = require('../dao/studyPlanDao');
const courseDao = require('../dao/courseDao');

const spService = require('../services/studyPlanService');

// get user's study plan info
router.get('/', async (req, res) => {
    try {
        const studyPlan = await studyPlanDao.getStudyPlanInfo(req.user.id);
        if (studyPlan.error) {
            return res.status(studyPlan.error).json(studyPlan);
        }
        return res.status(200).json(studyPlan);

    } catch (err) {
        return res.status(500).json({ error: 500, message: err.message });
    }

});

// get user's courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await studyPlanDao.getCoursesInfo(req.user.id);
        return res.status(200).json(courses);
    } catch (err) {
        return res.status(500).json({ error: 500, message: err.message });
    }
});

// create user's study plan
router.post('/', [
    check('studyPlanType').isIn(['full-time', 'part-time']),
    check('minCfu').isInt(),
    check('maxCfu').isInt(),
    check('actualCfu').isInt(),
    check('courses').isArray(),
    check('courses.*').isString().trim().isLength({ min: 7, max: 7 }),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ error: 422, message: errors.array() });
    }

    try {
        const studentId = req.user.id;
        const type = req.body.studyPlanType === 'full-time';
        const minCfu = req.body.minCfu;
        const maxCfu = req.body.maxCfu;
        const actualCfu = req.body.actualCfu;
        const studentCourses = req.body.courses;

        // step 1 - check if cfu are valids
        const cfuCheck = spService.checkCfuInBounds(minCfu, maxCfu, actualCfu, req.body.studyPlanType);
        if (cfuCheck.error) {
            return res.status(cfuCheck.error).json(cfuCheck);
        }

        // step 2 - check if courses are valid
        const dbCourses = await spService.checkCoursesInDb(studentCourses);
        if (dbCourses.error) {
            return res.status(dbCourses.error).json(dbCourses);
        }

        // step 3 - check if sum of cfu is correct
        let sumCfu = 0;
        for (const course of dbCourses) {
            sumCfu += course.cfu;
        }
        if (sumCfu !== actualCfu) {
            return res.status(422).json({ error: 422, message: 'sum of cfu is not correct' });
        }

        // step 4 - check if courses are compatibles
        const coursesCompatibility = await spService.checkCoursesCompatibility(studentCourses);
        if (coursesCompatibility.error) {
            return res.status(coursesCompatibility.error).json(coursesCompatibility);
        }

        // step 5 - check if there are required courses
        const requiredCheck = spService.checkRequiredCourses(dbCourses);
        if (requiredCheck.error) {
            return res.status(requiredCheck.error).json(requiredCheck);
        }

        // step 6 - check if courses are full
        const fullCheck = spService.checkFullCourses(dbCourses);
        if (fullCheck.error) {
            return res.status(fullCheck.error).json(fullCheck);
        }

        // step 7 - create study plan
        const studyPlanResult = await studyPlanDao.createStudyPlan(
            studentId,
            type,
            minCfu,
            maxCfu,
            actualCfu,
        );
        if (studyPlanResult.error) {
            return res.status(studyPlanResult.error).json(studyPlanResult);
        }

        if (!studyPlanResult) {
            return res.status(500).json({ error: 500, message: 'study plan not created' });
        }

        // step 8 - add courses to study plan
        await studyPlanDao.addCourses(
            studentId,
            studentCourses,
        );

        // step 9 - update courses actualS
        const addStudent = await spService.addStudentToCourses(studentCourses);
        if (addStudent.error) {
            return res.status(addStudent.error).json(addStudent);
        }


        // step 10 - all done - return created
        return res.status(201).send();


    } catch (err) {

        return res.status(500).json({ error: 500, message: err.message });
    }
})

// update user's courses
router.put('/courses', [
    check('studyPlanType').isIn(['full-time', 'part-time']),
    check('minCfu').isInt(),
    check('maxCfu').isInt(),
    check('actualCfu').isInt(),
    check('courses').isArray(),
    check('courses.*').isString().trim().isLength({ min: 7, max: 7 }),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ error: 400, message: errors.array() });
    }

    try {
        const studentId = req.user.id;
        const minCfu = req.body.minCfu;
        const maxCfu = req.body.maxCfu;
        const actualCfu = req.body.actualCfu;
        const studentCourses = req.body.courses;

        // step 1 - check if cfu are valids
        const cfuCheck = spService.checkCfuInBounds(minCfu, maxCfu, actualCfu, req.body.studyPlanType);
        if (cfuCheck.error) {
            return res.status(cfuCheck.error).json(cfuCheck);
        }

        // step 2 - check if courses are valid
        const dbCourses = await spService.checkCoursesInDb(studentCourses);
        for (const course of dbCourses) {
            if (course.error) {
                return res.status(course.error).json(course);
            }
        }

        // step 3 - check if sum of cfu is correct
        let sumCfu = 0;
        for (const course of dbCourses) {
            sumCfu += course.cfu;
        }
        if (sumCfu !== actualCfu) {
            return res.status(422).json({ error: 422, message: 'sum of cfu is not correct' });
        }

        // step 4 - check if the study plan exists
        const studyPlan = await studyPlanDao.getStudyPlanInfo(studentId);
        if (studyPlan.error) {
            return res.status(studyPlan.error).json(studyPlan);
        }

        // step 5 - check if courses are compatibles
        const coursesCompatibility = await spService.checkCoursesCompatibility(studentCourses);
        if (coursesCompatibility.error) {
            return res.status(coursesCompatibility.error).json(coursesCompatibility);
        }

        // step 6 - check if there are required courses
        const requiredCheck = spService.checkRequiredCourses(dbCourses);
        if (requiredCheck.error) {
            return res.status(requiredCheck.error).json(requiredCheck);
        }

        // step 7 - get old courses to remove and new courses to add
        const oldIds = await studyPlanDao.getCourses(studentId);
        // id of courses to remove
        const idToRemove = oldIds.filter(id => !studentCourses.includes(id));
        // id of courses to add
        const idToAdd = studentCourses.filter(id => !oldIds.includes(id));
        const dbCourseToAdd = dbCourses.filter(course => idToAdd.includes(course.id));

        // step 8 - check if new courses are full
        const fullCheck = spService.checkFullCourses(dbCourseToAdd);
        if (fullCheck.error) {
            return res.status(fullCheck.error).json(fullCheck);
        }

        // step 9 - remove courses from study plan
        await studyPlanDao.removeCourses(studentId, idToRemove);

        // step 10 - update removed courses actualS
        let promises = idToRemove.map((id) => courseDao.removeStudentFromCourse(id));
        await Promise.all(promises);

        // step 11 - add courses to study plan
        await studyPlanDao.addCourses(
            studentId,
            idToAdd,
        );

        // step 12 - update courses actualS
        const addStudent = await spService.addStudentToCourses(idToAdd);
        if (addStudent.error) {
            return res.status(addStudent.error).json(addStudent);
        }

        // step 13 - update actualCfu
        await studyPlanDao.updateStudyPlan(studentId, actualCfu);

        // step 14 - all done - return created
        return res.status(200).send();

    } catch (err) {
        return res.status(500).json({ error: 500, message: err.message });
    }

});

// delete user's study plan
router.delete('/', async (req, res) => {
    try {
        const studentId = req.user.id;

        // step 1- update courses actualS
        const courses = await studyPlanDao.getCourses(studentId);
        let promises = courses.map((id) => courseDao.removeStudentFromCourse(id));
        await Promise.all(promises);

        // step 2 - delete courses from study plan
        await studyPlanDao.removeCourses(studentId, courses);

        // step 3 - delete study plan
        await studyPlanDao.deleteStudyPlan(studentId);

        // step 4 - all done - return deleted
        return res.status(204).send();


    } catch (err) {

        return res.status(500).json({ error: 500, message: err.message });
    }
})

module.exports = router;