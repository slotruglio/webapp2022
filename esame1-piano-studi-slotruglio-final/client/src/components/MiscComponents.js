import { OverlayTrigger, Tooltip, ModalHeader, Modal, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router';


function Loading() {
    return (
        <Container className='h-100 w-50 p-5 d-block align-items-center justify-content-center text-center'>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            <h1>Loading ...</h1>
        </Container>
    )
}

function Separator({ height }) {
    return (
        <hr style={{ height: height }} />
    )
}

function OverlayOnButton(props) {
    return (
        <OverlayTrigger
            placement={props.position}
            delay={{ show: 250, hide: 400 }}
            overlay={
                <Tooltip id={`tooltip-button-${props.identifier}`} >{props.text}</Tooltip>
            }
        >
            <span className="d-inline-block">
                {props.button}
            </span>
        </OverlayTrigger>
    )
}

function MessageModal(props) {

    return <Modal
        size="sm"
        show={props.show}
        onHide={() => props.onClose()}
        aria-labelledby="contained-modal-title-vcenter"
        id="props.message"
    >
        <ModalHeader closeButton>
            <Modal.Title id="props.message"><i className="bi bi-book margin-10"></i>{' '}StudyPlan {props.isError ? `- ERROR` : null}</Modal.Title>
        </ModalHeader>
        <Modal.Body>
            {props.message} {props.user?.name} {props.user?.surname}
        </Modal.Body>
    </Modal>

}

function NotFound() {
    const navigate = useNavigate();

    return <Container className='h-100 p-5 d-flex align-items-center justify-content-center'>
        <Row>
            <Col>
                <Row>
                    <h1 className='text-center'>
                        <i className="bi bi-terminal-x d-inline-block justify-content-center align-top "></i>
                        {' '}404 - Page not found
                    </h1>
                </Row>
                <Row><Button variant="outline-dark" onClick={(event) => { navigate(`/`) }} >Go to Home</Button></Row>
            </Col>
        </Row>
    </Container>
}

function Unhautorized() {
    const navigate = useNavigate();

    return <Container className='h-100 p-5 d-flex align-items-center justify-content-center'>
        <Row>
            <Col>
                <Row className='text-center'>
                    <h1>
                        <i className="bi bi-shield-lock d-inline-block justify-content-center align-top "></i>
                        {' '}401
                    </h1>
                    <h2>You don't have permission to access this page</h2>
                </Row>
                <Row><Button variant="outline-dark" onClick={(event) => { navigate(`/`) }} >Go to Home</Button></Row>
            </Col>
        </Row>
    </Container>
}



export { Separator, OverlayOnButton, MessageModal, NotFound, Unhautorized, Loading }