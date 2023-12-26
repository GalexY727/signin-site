import './EventManager.css';
import { useState } from 'react';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

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
                <button className="submit-task" />
                <div style={{overflow: 'hidden', paddingRight: '.5em'}}>
                <DropdownButton id="dropdown-basic-button" title="Dropdown button">
                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                </DropdownButton>
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