import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Container, Stack, Navbar, Button, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';


function Layout(props) {
    const navigate = useNavigate();

    return <>
        <Navbar bg="dark" variant="dark" className='' >
            <Container >
                <Navbar.Brand to="/" className='justify-content-start'>
                    <Stack direction="horizontal" gap={3}>
                        <i className="bi bi-book d-inline-block align-top"></i>
                        {' '}
                        StudyPlan
                    </Stack>
                </Navbar.Brand>
                {props.loggedIn ?
                    <Nav className="me-auto">
                        <NavLink to="/student" className='mx-1 navlink-nodecoration'>Home</NavLink>
                        <NavLink to="/student/courses" className='mx-1 navlink-nodecoration'>My courses</NavLink>
                        <NavLink to="/allCourses" className='mx-1 navlink-nodecoration'>All courses</NavLink>
                    </Nav>
                    : null}
            </Container>
            <Container fluid="lg" className="justify-content-end">
                <Navbar.Text>
                    {
                        props.loggedIn ?
                            (<>
                                <Stack direction="horizontal" gap={3}>
                                    <i className="bi bi-person-circle d-inline-block align-top"></i>{' '}
                                    {props.user.name + ' ' + props.user.surname}
                                    <Button variant="dark" onClick={props.onLogout} >Logout</Button>
                                </Stack>
                            </>) :
                            <Button variant="dark" onClick={(event) => { navigate(`/login`) }} >Login</Button>
                    }
                </Navbar.Text>
            </Container>
        </Navbar>
        <Outlet />
    </>
}

export { Layout }