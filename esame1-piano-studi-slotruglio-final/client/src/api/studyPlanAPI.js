import { APIURL } from './utilityAPI';

async function getUserStudyPlanInfo() {
    // call: GET /api/studyPlan
    const response = await fetch(new URL('studyPlan', APIURL), {
        credentials: 'include'
    });
    const studyPlanInfo = await response.json();
    if (response.ok) {
        return studyPlanInfo;
    } else {
        throw studyPlanInfo;  // an object with the error coming from the server
    }
}

async function getUserCourses() {
    // call: GET /api/studyPlan/courses
    const response = await fetch(new URL('studyPlan/courses', APIURL), {
        credentials: 'include'
    });
    const courses = await response.json();
    if (response.ok) {
        return courses;
    } else {
        throw courses;  // an object with the error coming from the server
    }
}

async function createStudyPlan(studyPlan) {
    // call: POST /api/studyPlan
    return new Promise((resolve, reject) => {
        fetch(new URL('studyPlan', APIURL), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studyPlanType: studyPlan.studyPlanType,
                minCfu: studyPlan.minCfu,
                maxCfu: studyPlan.maxCfu,
                actualCfu: studyPlan.actualCfu,
                courses: studyPlan.courses,
            }),
        }).then(response => {
            if (response.ok) {
                resolve(null);
            } else {
                response.json().then(message => {
                    reject(message);
                }).catch(() => reject({ error: 500, message: 'Cannot parse server response' }));
            }
        }).catch(() => reject({ error: 500, message: 'Cannot connect to server' }));
    });
}

async function editStudyPlan(studyPlan) {
    // call: PUT /api/studyPlan/courses
    return new Promise((resolve, reject) => {
        fetch(new URL('studyPlan/courses', APIURL), {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studyPlanType: studyPlan.studyPlanType,
                minCfu: studyPlan.minCfu,
                maxCfu: studyPlan.maxCfu,
                actualCfu: studyPlan.actualCfu,
                courses: studyPlan.courses,
            }),
        }).then(response => {
            if (response.ok) {
                resolve(null);
            } else {
                response.json().then(message => {
                    reject(message);
                }).catch(() => reject({ error: 500, message: 'Cannot parse server response' }));
            }
        }).catch(() => reject({ error: 500, message: 'Cannot connect to server' }));

    })
}

async function deleteStudyPlan() {
    // call: DELETE /api/studyPlan
    return new Promise((resolve, reject) => {
        fetch(new URL('studyPlan', APIURL), {
            method: 'DELETE',
            credentials: 'include'
        }).then(response => {
            if (response.ok) {
                resolve(null);
            } else {
                response.json().then(message => {
                    reject(message);
                })
                    .catch(() => reject({ error: 500, message: 'Cannot parse server response' }));
            }
        }).catch(() => reject({ error: 500, message: 'Cannot connect to server' }));
    })
}

export { getUserStudyPlanInfo, getUserCourses, createStudyPlan, editStudyPlan, deleteStudyPlan };