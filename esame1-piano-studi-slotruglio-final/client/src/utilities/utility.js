/**
 * Get min and max cfu of a study plan type.
 * @param {String} studyPlanType "full-time" or "part-time"
 * @returns {Map} min and max cfu of a study plan type 
 */
const getMinMaxCfu = (studyPlanType) => {
    let cfu = {};

    // in order to occupy less space in the database, study plan type is stored as boolean where TRUE is full-time and FALSE is part-time
    // this functions works if study plan type is boolean or string
    if (studyPlanType.trim().toLowerCase() === 'full-time') {
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

const getAttributesForCourses = (isAdded, isCfuAllowed, incompatibles, requiredNotAdded, isFull) => {
    let attributes = {
        bgColor: 'bg-white',
        tooltip: '',
        buttonDisabled: false,
    };

    if (isAdded) {
        attributes['bgColor'] = 'university-success';
        attributes['tooltip'] += ' Course already added';
        attributes['buttonDisabled'] = true;
        return attributes;
    }
    if (!isCfuAllowed) {
        attributes['bgColor'] = 'university-secondary';
        attributes['tooltip'] += ' With this course you will exceed the max cfu available';
        attributes['buttonDisabled'] = true;
        return attributes;
    }
    if (incompatibles.length > 0) {
        attributes['bgColor'] = 'university-warning';
        attributes['tooltip'] += ' This course is incompatible with: ' + incompatibles.map(i => i.id).join(', ');
        attributes['buttonDisabled'] = true;
        return attributes;
    }
    if (requiredNotAdded.length > 0) {
        attributes['bgColor'] = 'university-warning';
        attributes['tooltip'] += ' This course requires: ' + requiredNotAdded;
        attributes['buttonDisabled'] = true;
        return attributes;
    }

    if(isFull) {
        attributes['bgColor'] = 'university-secondary';
        attributes['tooltip'] += ' This course is full';
        attributes['buttonDisabled'] = true;
        return attributes;
    }
    
    return attributes
}

export { getMinMaxCfu, getAttributesForCourses };