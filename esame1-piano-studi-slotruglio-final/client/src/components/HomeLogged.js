import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Container, Stack, Alert, Button, Row, Col } from 'react-bootstrap';
import { StudyPlanCard, CreateCard, CreateModal, DeleteModal } from './StudyPlan';
import { UniversityCourseTable, LocalStudyPlanTable } from './StudyPlanCourses';

import API from '../api/API_wrapper';


function HomeLoggedIn(props) {
    const navigate = useNavigate();
    const [showCreate, setShowCreate] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isEdit, setIsEdit] = useState(""); // "" -> view, "create" -> create, "edit" -> edit
    const [created, setCreated] = useState(false);

    const handleCloseCreate = () => setShowCreate(false);
    const handleShowCreate = () => setShowCreate(true);
    const handleCloseDelete = () => setShowDelete(false);
    const handleShowDelete = () => setShowDelete(true);

    const handleSubmit = (type, cfus) => {
        props.createStudyPlan(type, cfus.minCfu, cfus.maxCfu);
        setIsEdit("create"); 
        setShowCreate(false);
    }

    const handleDelete = () => {
        props.deleteStudyPlan();
        setShowDelete(false);
    }

    const onClickSave = () => {
        const courses = props.studyPlanCourses.map(c => c.id);
        if (isEdit === "create") {
            API.createStudyPlan({ ...props.localStudyPlan, courses: courses }).then(() => {
                props.onSave();
                navigate('/');
            }).catch(err => { props.onError(err) });
        } else if (isEdit === "edit") {
            API.editStudyPlan({ ...props.localStudyPlan, courses: courses }).then(() => {
                props.onSave();
                navigate('/');
            }).catch(err => { props.onError(err) });
        }

    }

    useEffect(() => {
        if ((isEdit === "create" && props.localStudyPlan.studyPlanType) || props.userDbCourses.length > 0) {
            setCreated(true);
        } else {
            setCreated(false);
        }

    }, [isEdit, props.localStudyPlan.studyPlanType, props.userDbCourses.length]);

    return (
        <>
            <CreateModal show={showCreate} handleClose={handleCloseCreate} handleSubmit={handleSubmit} />
            <DeleteModal show={showDelete} handleClose={handleCloseDelete} handleDelete={handleDelete} />

            <Container className='w-100 h-100 d-block mt-5'>
                {isEdit.length > 0 ?
                    <>
                        <Container className='d-flex justify-content-between my-5'>
                            <Col xs={7}>
                                Background Color Legend:
                                <Table borderless size="sm">
                                    <caption>
                                        You can see details going over the add button
                                    </caption>
                                    <thead>

                                        <tr>
                                            <th>Color</th>
                                            <th>Significant</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><Container className='university-success d-box '>&nbsp;</Container>
                                            </td>
                                            <td>means that the course have been already added</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <Container className='university-warning d-box '>&nbsp;</Container>
                                            </td>
                                            <td>means that course is incompatible with a course or it needs a required course not added</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <Container className='university-secondary d-box '>&nbsp;</Container>
                                            </td>
                                            <td>means that course is full or adding causes too many cfu</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                            <Col xs={3}>
                                    {props.saveError.length > 0 ? <Alert variant='info'>{props.saveError}</Alert> : <Container />}
                                    <Stack direction="horizontal" gap={2} className="justify-content-end">
                                        <Button variant="danger" onClick={() => { props.onCancel(); setIsEdit("")}}>Cancel</Button>
                                        <Button variant="primary" disabled={!props.savable} onClick={() => onClickSave()}>Save</Button>
                                    </Stack>
                            </Col>

                        </Container>

                    </> :
                    <Container className='my-5' >{(props.localStudyPlan.studyPlanType) ?
                        <StudyPlanCard
                            onEdit={() => {props.localStudyPlan.actualCfu === 0 ? setIsEdit("create") : setIsEdit("edit")}}
                            studyPlan={props.localStudyPlan}
                            handleShowDelete={handleShowDelete}
                            userCourses={props.userDbCourses} /> :
                        <CreateCard onCreate={handleShowCreate} />
                    }</ Container>

                }
                <Row className='justify-content-between'>
                    <Col xs={8}>
                        <Row>
                            <h4>University Courses</h4>
                        </Row>
                        <Row>
                            <UniversityCourseTable
                                state={isEdit}
                                courses={props.universityCourses}
                                localStudyPlan={props.localStudyPlan}
                                studyPlanCourses={props.studyPlanCourses}
                                addCourseToStudyPlan={props.addCourseToStudyPlan}
                            />
                        </Row>
                    </Col>
                    <Col xs={4}>
                        {created ?
                            <>
                                <Row>
                                    <h4>{`Study Plan: ${props.localStudyPlan.actualCfu} CFU, min ${props.localStudyPlan.minCfu} & max ${props.localStudyPlan.maxCfu}`}</h4>
                                </Row>

                                <Row>
                                    <LocalStudyPlanTable
                                        state={isEdit}
                                        localStudyPlan={props.localStudyPlan}
                                        studyPlanCourses={props.studyPlanCourses}
                                        removeCourseFromStudyPlan={props.removeCourseFromStudyPlan}
                                    />
                                </Row>
                            </>
                            : null}
                    </Col>
                </Row>
            </Container>

        </>
    )
}

export { HomeLoggedIn }