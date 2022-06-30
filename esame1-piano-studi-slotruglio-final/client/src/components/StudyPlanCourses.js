import { useEffect, useState } from 'react';
import { Container, Button, Table } from 'react-bootstrap';
import { OverlayOnButton } from './MiscComponents';
import { getAttributesForCourses } from '../utilities/utility';

const add_icon = "bi bi-plus-lg d-inline-block justify-content-center align-top"
const remove_icon = "bi bi-x-lg d-inline-block justify-content-center align-top"
const slash_icon = "bi bi-slash-lg d-inline-block justify-content-center align-top"

// university course
function UniversityCourse(props) {
    const [showD, setShowD] = useState(false);
    const [attributes, setAttributes] = useState({});

    const chevron_up = "bi bi-chevron-up d-inline-block justify-content-center align-top p-1"
    const chevron_down = "bi bi-chevron-down d-inline-block justify-content-center align-top p-1"

    const incompatibleAsString = props.course.incompatibles ? props.course.incompatibles.map(c => `(${c.id}) ${c.name}`).join(', ') : '';
    const requiredAsString = props.course.required ? "This course requires: ".concat(props.course.required) : "";

    // passare local study plan per verificare lo stato del corso



    useEffect(() => {
        if (props.state === "create" || props.state === "edit") {
            // step 1 - check if course is in local study plan
            const isAdded = props.studyPlanCourses.find(c => c.id === props.course.id) ? true : false;

            // step 2 - check if the number of actual cfu + course cfu is less or equal than the max cfu
            const isCfuAllowed = props.localStudyPlan.maxCfu >= props.localStudyPlan.actualCfu + props.course.cfu;

            // step 3 - check if the course is compatible with the rest of the courses in the local study plan
            const incompatiblesIds = props.course.incompatibles ? props.course.incompatibles.filter(c => props.studyPlanCourses.find(c2 => c2.id === c.id)) : [];
            // step 4 - check if the course requires another course that is in the local study plan
            let requiredNotAdded = ""; // default value
            if (props.course.required) {
                requiredNotAdded = props.studyPlanCourses.find(c => c.id === props.course.required) ? "" : props.course.required;
            }

            // step 5 - check if the course has max students and if the number of actual students is less or equal than the max students
            let isFull = false; // default value
            if (props.course.maxS) {
                isFull = props.course.maxS < props.course.actualS + 1;
            }

            // get correct attribute for the component based on the steps above
            setAttributes(getAttributesForCourses(isAdded, isCfuAllowed, incompatiblesIds, requiredNotAdded, isFull));
        } else {
            setAttributes(getAttributesForCourses(false, true, [], "", false));
        }
    }, [props.studyPlanCourses, props.localStudyPlan, props.course, props.state]);

    return (
        <>
            <tr className={`text-center align-middle ${attributes.bgColor}`}>
                <td>{props.course.id}</td>
                <td className='text-start'>{props.course.name}</td>
                <td>{props.course.cfu}</td>
                <td>{props.course.actualS}</td>
                <td>{props.course.maxS ? props.course.maxS : null}</td>
                <td>{props.state === "create" || props.state === "edit" ?
                    <OverlayOnButton identifier={props.course.id + "add"} position="top" text={attributes.buttonDisabled ? attributes.tooltip : "Add"}
                        button={
                            <Button
                                variant={attributes.buttonDisabled ? "outline-secondary" : "outline-success"}
                                className={attributes.buttonDisabled ? slash_icon : add_icon}
                                disabled={attributes.buttonDisabled}
                                onClick={() => props.addCourseToStudyPlan(props.course)}
                            />}
                    /> : null}</td>
                <td>{showD ?
                    <OverlayOnButton identifier={props.course.id} position="top" text="Close" button={
                        <Button variant="Link" className={chevron_up} onClick={() => setShowD(!showD)} />} />
                    :
                    <OverlayOnButton identifier={props.course.id} position="top" text="See more" button={
                        <Button variant="Link" className={chevron_down} onClick={() => setShowD(!showD)} />} />}</td>
            </tr>
            {showD ? <tr className={`noborder ${attributes.bgColor}`}>
                <td colSpan={7}>
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

// university course table
function UniversityCourseTable(props) {
    return (
        <Table responsive size="sm">
            <thead>
                <tr className='text-center align-middle'>
                    <th>Code</th>
                    <th className='text-start'>Course Name</th>
                    <th>CFU</th>
                    <th>Current Students</th>
                    <th>Max Students</th>
                    <th>{''}</th>
                    <th>{''}</th>
                </tr>

            </thead>
            <tbody>
                {props.courses.map(c =>
                    <UniversityCourse
                        key={c.id} course={c}
                        localStudyPlan={props.localStudyPlan}
                        addCourseToStudyPlan={props.addCourseToStudyPlan}
                        studyPlanCourses={props.studyPlanCourses}
                        state={props.state}
                    />)}
            </tbody>
        </Table>
    )
}

// study plan course
function LocalStudyPlanCourse(props) {

    const requiredBy = props.studyPlanCourses.find(c => c.required === props.course.id);


    return (
        <tr className='text-center align-middle'>
            <td>{props.course.id}</td>
            <td className='text-start'>{props.course.name}</td>
            <td>{props.course.cfu}</td>
            <td>{props.state === "create" || props.state === "edit" ?
                <OverlayOnButton identifier={props.course.id + "remove"} position="top" text={requiredBy !== undefined ? `This course is required by: ${requiredBy.id}` : "Remove"}
                    button={
                        <Button
                            variant={requiredBy !== undefined ? "outline-secondary" : "outline-danger"}
                            className={requiredBy !== undefined ? slash_icon : remove_icon}
                            disabled={requiredBy !== undefined}
                            onClick={() => props.removeCourseFromStudyPlan(props.course)}
                        />}
                /> : null}</td>

        </tr>
    )
}

// study plan table
function LocalStudyPlanTable(props) {
    return (
        <Table responsive size="sm">
            <thead>
                <tr className='text-center align-middle'>
                    <th>Code</th>
                    <th className='text-start'>Course Names</th>
                    <th>CFU</th>
                    <th>{''}</th>
                </tr>
            </thead>
            <tbody>
                {props.studyPlanCourses.map(c =>
                    <LocalStudyPlanCourse
                        key={c.id} course={c} state={props.state}
                        studyPlanCourses={props.studyPlanCourses}
                        removeCourseFromStudyPlan={props.removeCourseFromStudyPlan}

                    />)}
            </tbody>
        </Table>
    )
}

export { UniversityCourseTable, LocalStudyPlanTable };