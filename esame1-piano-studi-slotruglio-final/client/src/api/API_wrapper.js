

// import courses API from './coursesAPI';
import { getAllCourses } from './coursesAPI';

// import studyPlan API from './studyPlanAPI';
import { getUserStudyPlanInfo, getUserCourses, createStudyPlan, editStudyPlan, deleteStudyPlan } from './studyPlanAPI';

// import authentication API from './userAPI';
import { login, logout, getUserInfo } from './userAPI';







const API = { 
    getAllCourses, 
    login, logout, getUserInfo, 
    getUserStudyPlanInfo, getUserCourses, createStudyPlan, editStudyPlan, deleteStudyPlan,
};
export default API;