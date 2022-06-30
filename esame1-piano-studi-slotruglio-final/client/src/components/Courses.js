import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Container, Button, Table } from 'react-bootstrap';
import { OverlayOnButton } from './MiscComponents';


function Course(props) {
    const [showD, setShowD] = useState(false);

    const chevron_up = "bi bi-chevron-up d-inline-block justify-content-center align-top"
    const chevron_down = "bi bi-chevron-down d-inline-block justify-content-center align-top"

    const incompatibleAsString = props.course.incompatibles ? props.course.incompatibles.map(c => `(${c.id}) ${c.name}`).join(', ') : '';
    const requiredAsString = props.course.required ? "This course requires: ".concat(props.course.required) : "";

    return (
        <>
            <tr className='text-center align-middle'>
                <td>{props.course.id}</td>
                <td className='text-start'>{props.course.name}</td>
                <td>{props.course.cfu}</td>
                <td>{props.course.actualS}</td>
                <td>{props.course.maxS ? props.course.maxS : null}</td>
                <td>
                    {showD ?
                        <OverlayOnButton identifier={props.course.id} position="right" text="Close" button={
                            <Button variant="Link" className={chevron_up} onClick={() => setShowD(!showD)} />} />
                        :
                        <OverlayOnButton identifier={props.course.id} position="right" text="See more" button={
                            <Button variant="Link" className={chevron_down} onClick={() => setShowD(!showD)} />} />}
                </td>
            </tr>
            {showD ? <tr className='noborder'>
                <td colSpan={6}>
                    <Container>
                        {incompatibleAsString.length > 0 ? <p>This course is incompatible with: {incompatibleAsString}</p> : null}
                        {requiredAsString.length > 0 ? <p className="text-start">{requiredAsString}</p> : null}
                        {incompatibleAsString.length === 0 && requiredAsString.length === 0 ? <p>No other information</p> : null}
                    </Container>
                </td>
            </tr> : null}
        </>
    )
}

function CourseTable(props) {
    return (

        <Table responsive className='mt-4'>
            <thead >
                <tr className='text-center align-middle'>
                    <th>Code</th>
                    <th className='text-start'>Course Name</th>
                    <th>CFU</th>
                    <th>Current Students</th>
                    <th>Max Students</th>
                    <th>{''}</th>
                </tr>
            </thead>
            <tbody>
                {props.courses.map(c => <Course course={c} key={c.id} />)}
            </tbody>
        </Table>
    )
}

function CoursesView(props) {
    const navigate = useNavigate();
    return (
        <Container className='w-100 h-100 d-block mt-5 mx-5 px-5'>
            {props.courses.length > 0 ?
                <Container>
                    <h1>{props.name}</h1>

                    <CourseTable courses={props.courses} /> </Container>
                : <Container><h2>You don't have a study plan</h2>
                    <p>Go to home to create one</p>
                    <Button variant='primary' onClick={() => navigate('/')}>Home</Button>
                </Container>
            }
        </Container>
    )
}

export { CourseTable, CoursesView };