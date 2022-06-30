import { APIURL } from './utilityAPI';

// Courses API

async function getAllCourses() {
    // call: GET /api/courses
    const response = await fetch(new URL('courses', APIURL));
    const coursesJson = await response.json();
    if (response.ok) {
        return coursesJson.map((course) => (
            {
                id: course.id, name: course.name,
                cfu: course.cfu, actualS: course.actualS, maxS: course.maxS,
                incompatibles: course.incompatibles,
                required: course.required,
            }
        ));
    } else {
        throw coursesJson; // error json from server
    }
}


export { getAllCourses };