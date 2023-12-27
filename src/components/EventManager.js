
import { InputGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import './EventManager.css';
import { useState } from 'react';

function EventManager() {
    const [events, setEvents] = useState([]);


    const addNewEvent = () => {
        const name = prompt('Enter event name');
        const description = prompt('Enter event description');
        setEvents([...events, {name, description}]);
    }

    return (
        <div className="event-manager">
            <h1 style={{color:'lightgray'}}>Events: </h1>
            <form onSubmit={addNewEvent}>
            <button type="submit" className="submit-task" />
                <div style={{overflow: 'hidden'}}>
                    <InputGroup className="mb-3" style={{placeItems:"flex-end"}}>
                        <Form.Select style={{maxWidth:"30%"}}>
                            <option>In</option>
                            <option>Out</option>
                        </Form.Select>

                        <Form.Control type="time" />
                    </InputGroup>
                </div>
            </form>
            <div className="events">
                {events.map((event) => (
                    <div className="event">
                        <h2>{event.name}</h2>
                        <p>{event.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default EventManager;