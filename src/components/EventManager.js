import { InputGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import "./EventManager.css";
import { useEffect, useReducer, useState } from "react";

function EventManager(input) {
    const [events, setEvents] = useState([]);
    const [signedInState, setSignedInState] = useState(true);
    const [time, setTime] = useState(
        new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    );
        
    const dateObject = new Date(input.date + ' ' + time);

    // console.log(dateObject.toLocaleString([], {timeZone: "America/Los_Angeles"}));

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

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    useEffect(() => {
        const fetchData = async () => {
            const data = await input.getEventData(input.name.toLowerCase(), dateObject);
            const formattedData = data.map((event) => {
                const [hour, minute] = event.time.split(':');
                return {
                    ...event,
                    time: `${hour.padStart(2, '0')}:${minute}`
                };
            });
            setEvents(formattedData);
        };
    
        fetchData();
    }, [input.name, input.date]);

    const addNewEvent = () => {
        // console.log(dateObject.toLocaleString([], {timeZone: "America/Los_Angeles"}).replace(",", ""));
        if (input.name === "") {
            alert("Please enter a name");
            return;
        }
        makeData(
            toTitleCase(input.name),
            signedInState ? "In" : "Out",
            dateObject.toLocaleString([], {timeZone: "America/Los_Angeles"}).replace(",", "")
        );
    };

    const makeData = async (name, inOrOut, timestamp) => {
        const data = [
            ["name", name],
            ["timestamp", timestamp],
            ["inOrOut", inOrOut],
            ["studentOrParent", "Student"],
        ];
        postData(data);
    };

    const postData = (data) => {
        var formDataObject = new FormData();

        data.forEach((element) => {
            formDataObject.append(element[0], element[1]);
        });

        let url = process.env.REACT_APP_SHEET_POST_URL;
        fetch(url, { method: "POST", body: formDataObject }).catch((err) =>
            console.log(err)
        );
    };

    const removeEvent = (e) => {
        
        let index = events.indexOf(e.target.value);
        console.log(index);
        console.log(toTitleCase(input.name));
        console.log(input.date + " " + convertTime12to24(time) + ":01")
        makeData(
            toTitleCase(input.name),
            "Out",
            input.date + " " + convertTime12to24(time) + ":01"
        );

        // let newEvents = [...events];
        // newEvents.splice(index, 1);
        // setEvents(newEvents);

        // console.log(newEvents);  
    };

    return (
        <div className="event-manager">
            <h1 style={{ color: "lightgray", textAlign:"center", paddingBottom:"0.5em"}}>Events: </h1>

            <button onClick={addNewEvent} className="submit-task" />
            <div style={{ overflow: "hidden" }}>
                <InputGroup style={{ placeItems: "flex-end" }}>
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
            
            <hr className="solid" />

            <div
                className="events"
                style={{ maxHeight: "calc(85vh - 19em)", overflow: "auto" }}
            >
                {events && events.map((event, index) => (
                    event &&
                    <div className="event" key={index}>
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
                                    defaultValue={event.time}
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
