import { useState } from 'react';
import { Card, Button, Stack, Modal, Form} from 'react-bootstrap';
import { Separator } from './MiscComponents'
import { getMinMaxCfu } from '../utilities/utility';

function StudyPlanCard(props) {
    return (
        <>
            <Card>
                <Card.Body>
                    <Card.Title>Your StudyPlan</Card.Title>
                    <Card.Text>
                        You have already created a {props.studyPlan.studyPlanType} StudyPlan with the following cfu: {props.studyPlan.actualCfu}
                        <br />You can see all your courses in the right table or clicking on "My Courses"
                    </Card.Text>
                    <Stack direction="horizontal" gap={2} className="justify-content-end">
                        <Button variant="danger" onClick={props.handleShowDelete}>Delete</Button>
                        <Button variant="warning" onClick={props.onEdit}>Edit</Button>
                    </Stack>
                </Card.Body>
            </Card>
        </>
    )
}

function CreateCard(props) {
    return (
        <>
            <Card>
                <Card.Body>
                    <Card.Title>You haven't got yet a study plan</Card.Title>

                    <Card.Text>
                        Clicking the Create button you can create a new full time or part time study plan.<br />
                        Remember thath you can only have one study plan at a time. <br />
                        If you want to change from full time to part time, you have to delete it and create a new one.
                    </Card.Text>
                            <Button variant="primary" onClick={props.onCreate}>Create</Button>
                </Card.Body>
            </Card>
        </>
    )
}

function CreateModal(props) {
    const [studyPlanType, setStudyPlanType] = useState('full-time');

    const partTime = getMinMaxCfu('part-time');
    const fullTime = getMinMaxCfu('full-time');

    return (
        <Modal
            show={props.show}
            onHide={props.handleClose}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Choose Study Plan type</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Remember that you can only have one study plan at a time.<br />
                    If you want to change from full time to part time, you have to delete it and create a new one.
                </p>
                <Form onSubmit={(event) => {
                    event.preventDefault();
                    props.handleSubmit(studyPlanType, getMinMaxCfu(studyPlanType));
                }}>
                    <Form.Group>
                        <Form.Label>Type of Study Plane</Form.Label>
                        <Form.Control as="select" value={studyPlanType} onChange={ev => setStudyPlanType(ev.target.value)}>
                            <option value={"full-time"}>{`Full-Time: minCFU = ${fullTime.minCfu}, maxCFU = ${fullTime.maxCfu}`}</option>
                            <option value={"part-time"}>{`Part-Time: minCFU = ${partTime.minCfu}, maxCFU = ${partTime.maxCfu}`}</option>
                        </Form.Control>
                    </Form.Group>
                    <Separator height={1} />
                    <Stack direction='horizontal' gap={2} className="justify-content-end">
                        <Button onClick={props.handleClose} variant='secondary' >Cancel</Button>
                        <Button type='submit'>Create</Button>
                    </Stack>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

function DeleteModal(props) {
    return (

        <>
            <Modal show={props.show} onHide={props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Study Plan</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want do delete your study plan?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleClose}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={props.handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}


export { StudyPlanCard, CreateCard, CreateModal, DeleteModal };