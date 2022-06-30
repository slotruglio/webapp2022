import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Container, Button, Col, Row, Form, FormGroup, Alert, Stack, InputGroup } from 'react-bootstrap';


function Login(props) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("u1@d.it");
    const [password, setPassword] = useState("password");
    const [errorMsg, setErrorMsg] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    const eyeClass = "bi bi-eye d-inline-block justify-content-center align-top"
    const closedEyeClass = "bi bi-eye-slash d-inline-block justify-content-center align-top"

    const handleSubmit = (event) => {
        event.preventDefault();
        let valid = true;
        if (!email.trim().match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            props.setLoginError("");
            setErrorMsg("Email is not valid");
            valid = false;
        }
        if (password.trim().length < 1) {
            props.setLoginError("");
            setErrorMsg("Password is not valid");
            valid = false;
        }

        if (!email.trim().match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
            && password.trim().length < 1) {
            //props.setLoginError("");
            setErrorMsg("Email and Password are not valid");
            valid = false;
        }
        if (valid === true) {
            setErrorMsg("");
            props.onLogin({ email, password });
        }
    }


    return (
        <Container className='h-100 w-50 p-5 d-block align-items-center justify-content-center'>
            <Row>
                <Col className='text-center'>
                    <Row>
                        <h1>
                            <i className="bi bi-book d-inline-block justify-content-center align-top "></i>
                            {' '}StudyPlan
                        </h1>

                    </Row>
                    <Row>
                        <h2>Login</h2>
                    </Row>
                    <Container>
                        <Form className='text-start'>
                            {props.loginError ?
                                <Alert variant="danger" onClose={() => props.setLoginError("")} dismissible>{props.loginError}</Alert>
                                : errorMsg ?
                                    <Alert variant="danger" onClose={() => setErrorMsg("")} dismissible>{errorMsg}</Alert> : null}

                            <Form.Group controlId="email" className='p-2'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={ev => setEmail(ev.target.value)}
                                    className={+ errorMsg.match("Email") ? 'highlight-error' : ''}
                                />
                            </Form.Group>
                            <FormGroup controlId="password" className='p-2'>
                                <Form.Label>
                                    Password
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPwd ? "text" : "password"}
                                        value={password}
                                        onChange={ev => setPassword(ev.target.value)}
                                        className={errorMsg.match("Password") ? 'highlight-error' : ''}
                                    />
                                    <Button variant="outline-secondary">
                                        <i className={showPwd ? eyeClass : closedEyeClass} onClick={() => setShowPwd((old) => !old)}></i>
                                    </Button>

                                </InputGroup>
                            </FormGroup>

                            <Stack direction="veritcal" gap={2} className="p-2 mt-4">
                                <Button variant="primary" type="submit" onClick={handleSubmit} >Login</Button>
                                <Button variant="outline-secondary" onClick={(event) => { navigate(`/`) }} >Go back</Button>
                            </Stack>
                        </Form>
                    </Container>
                </Col>
            </Row>
        </Container>
    )
}

export { Login }