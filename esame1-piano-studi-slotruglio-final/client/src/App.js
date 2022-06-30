import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { CoursesView } from './components/Courses';
import { HomeLoggedIn } from './components/HomeLogged';
import { Login } from './components/Login';
import { MessageModal, NotFound, Unhautorized, Loading } from './components/MiscComponents';

import API from './api/API_wrapper';


function App() {
  return (
    <Router>
      <App2 />
    </Router>
  );
}

function App2() {
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [updateCount, setUpdateCount] = useState({});

  // errors states
  const [errorModal, setErrorModal] = useState("");
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorFull, setErrorFull] = useState(false);

  // user related states
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [loginMsg, setLoginMsg] = useState('');
  const [messageModal, setMessageModal] = useState("");
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [user, setUser] = useState({});

  // studyplan
  const [userStudyPlan, setUserStudyPlan] = useState({});
  const [userCourses, setUserCourses] = useState([]); // db call to get user courses
  const [localCourses, setLocalCourses] = useState([]);

  // save study plan
  const [saveError, setSaveError] = useState("Cfu not in bounds");
  const [savable, setSavable] = useState(false);
  const [dirty, setDirty] = useState(false);

  const doLogin = (credentials) => {
    API.login(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setLoginMsg('');
        setMessageModal("Welcome");
        setMessageModalVisible(true);
        navigate('/');
      })
      .catch(err => setLoginMsg(err));
  };

  const doLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser({});
    setUserStudyPlan({});
    setUserCourses([]);
    setMessageModal("Goodbye");
    setMessageModalVisible(true);
    navigate('/');
  }

  const createStudyPlan = (type, minCfu, maxCfu) => {
    setUserStudyPlan({
      studyPlanType: type,
      minCfu: minCfu,
      maxCfu: maxCfu,
      actualCfu: 0
    });
    setLocalCourses([]);

    setSavable(false);
  }

  const addCourseToStudyPlan = (course) => {
    setLocalCourses((old) => [...old, course]);
    setUserStudyPlan((old) => {
      return {
        studyPlanType: old.studyPlanType,
        minCfu: old.minCfu,
        maxCfu: old.maxCfu,
        actualCfu: old.actualCfu + course.cfu
      }
    });
    setUpdateCount({ id: course.id, count: 1 });
  }

  const removeCourseFromStudyPlan = (course) => {
    setLocalCourses((old) => old.filter(c => c.id !== course.id));
    setUserStudyPlan((old) => {
      return {
        studyPlanType: old.studyPlanType,
        minCfu: old.minCfu,
        maxCfu: old.maxCfu,
        actualCfu: old.actualCfu - course.cfu
      }
    });
    setUpdateCount({ id: course.id, count: -1 });
  }

  const deleteStudyPlan = () => {
    API.deleteStudyPlan().then(() => {
      setUserStudyPlan({});
      setUserCourses([]);
      setLocalCourses([]);
    }).catch(err => handleError(err));
    setDirty(true);
    setSavable(false);
  }

  const handleError = (err) => {

    if (err.message.includes("is full")) {
      setErrorModal(err.message + ", click on CANCEL and try again");
      setErrorFull(true);
    } else if (err.message.includes("Failed to fetch")) {
      setErrorModal("Network error, please try to reload the page");
    } else {
      setErrorModal(err.message);
    }

  }

  const handleCancel = () => {
    setLocalCourses(userCourses);

    const sumCfu = userCourses.reduce((acc, cur) => acc + cur.cfu, 0);
    setUserStudyPlan((old) => {
      return {
        studyPlanType: old.studyPlanType,
        minCfu: old.minCfu,
        maxCfu: old.maxCfu,
        actualCfu: sumCfu
      };
    });
  }


  // check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        handleError(err);
      }
    };

    checkAuth();
  }, []);

  // get all courses from server
  useEffect(() => {
    API.getAllCourses()
      .then(courses => {
        setCourses(courses);
        if (!loggedIn) setInitialLoading(false);
      })
      .catch(error => handleError(error))
  }, [loggedIn, errorFull]);

  // get user study plan from server
  useEffect(() => {
    if (loggedIn) {
      API.getUserStudyPlanInfo()
        .then((studyPlan) => setUserStudyPlan(studyPlan))
        .catch(error => handleError(error))
    }
  }, [loggedIn]);

  // get user courses from server if user study plan exists
  useEffect(() => {
    if (userStudyPlan.minCfu) {
      API.getUserCourses()
        .then((courses) => {
          setUserCourses(courses);
          setLocalCourses(courses);
          setSaveError("No differences");
          setInitialLoading(false);
        })
        .catch(error => handleError(error))
    }
  }, [userStudyPlan.minCfu]);

  // get user courses from server after post/put/delete
  useEffect(() => {
    if (dirty) {
      API.getAllCourses()
        .then(courses => {
          setCourses(courses);
        })
        .catch(error => handleError(error));

      API.getUserCourses()
        .then((courses) => {
          setUserCourses(courses);
          setLocalCourses(courses);
          setDirty(false);
        })
        .catch(error => handleError(error))
    }
  }, [userCourses.length, dirty]);

  // update university courses number of students after insert / remove
  useEffect(() => {
    if (updateCount.count && updateCount.count !== 0) {

      if (updateCount.count === 1) {
        // new course added
        setCourses((old) => old.map(c => c.id === updateCount.id ? { ...c, actualS: c.actualS + 1 } : c));

      } else if (updateCount.count === -1) {
        // course removed
        setCourses(old => old.map(c => c.id === updateCount.id ? { ...c, actualS: c.actualS - 1 } : c));
      }
    }
  }, [updateCount]);

  // check if is savable
  useEffect(() => {
    let flag = false;

    // check for create - if empty can't save
    if (userCourses.length === 0 && localCourses.length === 0) {
      setSaveError("No courses selected");
      flag = true;
    }

    if (userCourses.length > 0) {
      let diff1 = userCourses.filter(c => !localCourses.find(c2 => c2.id === c.id));
      if (diff1.length === 0 && userCourses.length === localCourses.length) {
        setSaveError("No differences to save");
        flag = true;
      }
    }

    if (localCourses.length > 0) {
      if (userStudyPlan.minCfu > userStudyPlan.actualCfu || userStudyPlan.maxCfu < userStudyPlan.actualCfu) {
        setSaveError("Cfu not in bounds");
        flag = true;
      }
    }

    if (!flag) setSaveError("");

    if (saveError.length === 0) {
      setSavable(true);
    } else {
      setSavable(false);
    }

  }, [userCourses, localCourses, userStudyPlan, saveError.length]);

  // modal login/logut message
  useEffect(() => {
    if (messageModalVisible) {
      setTimeout(() => {
        setMessageModalVisible(false);
      }, 1000);
    }

    if (!messageModalVisible && messageModal.length > 0)
      setTimeout(() => setMessageModal(""), 2000)
  }, [messageModalVisible, messageModal.length])

  // modal error message
  useEffect(() => {
    if (errorModal.length > 0) {

      if (!errorModal.includes("Unauthenticated user!")
        && !errorModal.includes("Study plan not found")
      ) {
        setErrorModalVisible(true);


        if (errorModal.includes("Network Error")) {
          setTimeout(() => {
            setErrorModalVisible(false);
            setErrorModal("");
          }, 5000);
        }

        setTimeout(() => {
          setErrorModalVisible(false);
          setErrorModal("");
        }, 2000);

      } else {

        setErrorModal("");
      }
    }
  }, [errorModal, initialLoading])




  return (
    <>
      <MessageModal user={user} isError={false} message={messageModal} onClose={() => setMessageModalVisible(false)} show={messageModalVisible} />
      <MessageModal message={errorModal} isError={true} onClose={() => setErrorModalVisible(false)} show={errorModalVisible} />
      <Routes>
        <Route path="/" element={
          initialLoading ? <Loading /> :
            <Layout loggedIn={loggedIn} user={user} onLogout={doLogout} />
        }>
          <Route index element={loggedIn ? <Navigate to="/student" /> : <Navigate to="/allCourses" />} />
          <Route path="/allCourses" element={<CoursesView courses={courses} name="All University Courses" />} />
          <Route path="/student/courses" element={loggedIn ? <CoursesView courses={userCourses} name="My Courses" /> : <Navigate to="/401" />} />
          <Route path="/student" element={
            loggedIn ? <HomeLoggedIn
              universityCourses={courses}
              localStudyPlan={userStudyPlan}
              studyPlanCourses={localCourses}
              userDbCourses={userCourses}
              createStudyPlan={createStudyPlan}
              deleteStudyPlan={deleteStudyPlan}
              addCourseToStudyPlan={addCourseToStudyPlan}
              removeCourseFromStudyPlan={removeCourseFromStudyPlan}
              onCancel={handleCancel}
              onError={handleError}
              onSave={() => setDirty(true)}
              savable={savable}
              saveError={saveError}
            /> : <Navigate to="/login" />
          } />
        </Route>
        <Route path="/login" element={
          !loggedIn ? <Login onLogin={doLogin} loginError={loginMsg} setLoginError={setLoginMsg} />
            : <Navigate to="/student" />} />
        <Route path="/401" element={<Unhautorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
    </>
  )
}

export default App;
