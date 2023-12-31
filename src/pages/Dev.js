import { Form } from "react-bootstrap";
import AutoComplete from "../components/AutoComplete";
import EventManager from "../components/EventManager";
import "./Dev.css";
import { useSearchParams } from "react-router-dom";

function Dev() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const studentName = searchParams.get("name");
    const currentDate = searchParams.get("date");

    const handleDateChange = (e) => {
        setSearchParams({ date: e.target.value, name: studentName});
    }

    const handleNameChange = (e) => {
        setSearchParams({ date: currentDate, name: e });
    };

    return (
        <div>
            <div className="grid-container">
                <div className="student">
                    <h1 style={{ color: "lightgray" }}>Student</h1>
                    <AutoComplete
                        initVal={studentName || ""}
                        onSubmit={handleNameChange}
                    />
                </div>

                <div className="date-input">
                    <h1 style={{ color: "lightgray" }}>Date</h1>
                    <Form.Control value={currentDate} type="date" onChange={handleDateChange} />
                </div>

                <div className="errors">
                    <h1 style={{ color: "lightgray" }}> Errors: </h1>
                </div>

                <EventManager />
            </div>
        </div>
    );
}

export default Dev;
