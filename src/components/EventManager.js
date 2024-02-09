import "./EventManager.css";
import "./ErrorList.css"
import { useEffect, useState } from "react";

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


    const keyDownHandler = (e) => {
        const value = e.target.value;
        switch (e.key) {
            case 'Tab':
            case 'Enter':
                if (value === '') {
                    e.preventDefault();
                    return;
                }
                const inputValue = value.trim();
                // Make sure all of the data (trimmed) are numbers
                if (!isNaN(inputValue)) {
                    input.onSubmit(inputValue);
                }

            case 'Escape':
                // in case the above case was just triggered,
                // wait a bit before clearing the value
                // so that it can be sent to onSubmit
                e.target.value = "";
                e.preventDefault();
                break;
            default:
        }
    }

    return (
        <div className="event-manager">
            <h1 style={{ color: "lightgray", textAlign:"center", paddingBottom:"0.5em"}}>Events: </h1>
            <input type="text" onKeyDown={keyDownHandler} />
            <hr className="solid" />
            
            <div
                className="events"
                style={{ maxHeight: "calc(85vh - 19em)", overflow: "auto" }}
            >
                {events && events.map((event, index) => (
                    event && (
                        <div className="event" key={index}>
                            
                            <div style={{ overflow: "hidden" }}>
                                <div className="mb-3" style={{ placeItems: "flex-end" }}>
                                    <div style={{ display: "flex", width: "100%" }}>
                                        <div style={{ width: "25%" }}>
                                            <input
                                                style={{ verticalAlign: "middle", width: "100%" }}
                                                type="text"
                                                value={event.state}
                                                disabled
                                            />
                                        </div>
                                        <div style={{ width: "75%" }}>
                                            <input
                                                defaultValue={event.time}
                                                type="time"
                                                readOnly
                                                style={{ width: "100%" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

export default EventManager;
