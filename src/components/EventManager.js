import { InputGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import "./EventManager.css";
import { useEffect, useState } from "react";

function EventManager(name, date) {
    const [events, setEvents] = useState([]);

    const inputName = name;
    const inputDate = date;

    // console.log(inputName);
    // console.log(inputDate);

    const [signedInState, setSignedInState] = useState(true);
    const [time, setTime] = useState(
        new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    );

    const handleSelectChange = (e) => {
        setSignedInState(e.target.value === "In");
    };
    

    const handleTimeChange = (e) => {
        setTime(e.target.value);
    };

    const convertTime12to24 = (time12h) => {
        // check if time is already in 24hour format
        if ((!time12h.includes("AM") && !time12h.includes("PM"))) {
            return time12h;
        }

        const [time, modifier] = time12h.split(" ");

        let [hours, minutes] = time.split(":");

        if (hours === "12") {
            hours = "00";
        }

        if (modifier === "PM") {
            hours = parseInt(hours, 10) + 12;
        }

        return `${hours}:${minutes}`;
    };

    useEffect(() => {
        fetch(process.env.REACT_APP_GET_SHEET_DATA, { method: "GET" })
            .then((response) => response.json())
            .then((json) => {
                const data = json.valueRanges[3].values;
                // console.log(data);
                data.map((row) => {
                    const name = row[0];
                    const state = row[1];
                    const date = row[2];

                    let event = {
                        name: name,
                        state: state,
                        date: date,
                    };

                    // console.log(inputName.name);
                    console.log(
                        "inputName: " + inputName.name.replace(/\s+/g, ""), 
                        "event Name: " + event.name.toLowerCase().replace(/\s+/g, ""), 
                        "bool: " + inputName.name.replace(/\s+/g, "") === event.name.toLowerCase().replace(/\s+/g, ""));
                    // if (inputName === event.name.toLowerCase()) {
                    //     setEvents([...events, event]);
                    // }
                });
            });
    }, []);
    const addNewEvent = () => {

        let newEvent = {
            state: signedInState ? "In" : "Out",
            time: time,
        };

        setEvents([...events, newEvent]);
    };

    const removeEvent = (e) => {
        let index = events.indexOf(e.target.value);
        let newEvents = [...events];
        newEvents.splice(index, 1);
        setEvents(newEvents);

        console.log(events);
    };

    return (
        <div className="event-manager">
            <h1 style={{ color: "lightgray" }}>Events: </h1>

            <button onClick={addNewEvent} className="submit-task" />
            <div style={{ overflow: "hidden" }}>
                <InputGroup className="mb-3" style={{ placeItems: "flex-end" }}>
                    <Form.Select
                        onChange={handleSelectChange}
                        style={{ maxWidth: "30%" }}
                    >
                        <option>In</option>
                        <option>Out</option>
                    </Form.Select>

                    <Form.Control type="time" onChange={handleTimeChange} />
                </InputGroup>
            </div>

            <div
                className="events"
                style={{ maxHeight: "calc(100vh - 22em)", overflow: "auto" }}
            >
                {events.map((event) => (
                    <div className="event">
                        <button className="delete-task" onClick={removeEvent} />
                        <div style={{ overflow: "hidden" }}>
                            <InputGroup
                                className="mb-3"
                                style={{ placeItems: "flex-end" }}
                            >
                                <Form.Select
                                    defaultValue={event.state}
                                    style={{ maxWidth: "30%" }}
                                >
                                    <option>In</option>
                                    <option>Out</option>
                                </Form.Select>
                                
                                <Form.Control
                                    defaultValue={convertTime12to24(event.time)}
                                    type="time"
                                />
                            </InputGroup>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EventManager;
