'use strict';

/**
 * Get min and max cfu of a study plan type.
 * @param {*} studyPlanType boolean: true if full-time, false if part-time, string: "full-time" or "part-time"
 * @returns {Map} min and max cfu of a study plan type 
 */
const getMinMaxCfu = (studyPlanType) => {
    let cfu = {};

    // in order to occupy less space in the database, study plan type is stored as boolean where TRUE is full-time and FALSE is part-time
    // this functions works if study plan type is boolean or string
    if ((typeof studyPlanType === 'string' && studyPlanType.trim().toLowerCase() === 'full-time') || (typeof studyPlanType === 'boolean' && studyPlanType)) {
        cfu = {
            minCfu: 60,
            maxCfu: 80,
        };
    } else {
        cfu = {
            minCfu: 20,
            maxCfu: 40,
        };
    }
    return cfu;
}

module.exports = { getMinMaxCfu };