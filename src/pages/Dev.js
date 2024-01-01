import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import AutoComplete from "../components/AutoComplete";
import EventManager from "../components/EventManager";
import "./Dev.css";
import { useSearchParams } from "react-router-dom";

function Dev() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [whitelist, setWhitelist] = useState([[], []]);
    
    const studentName = searchParams.get("name");
    const currentDate = searchParams.get("date");

    const handleDateChange = (e) => {
        e.preventDefault();
        // only get the month and day of the date
        const date = e.target.value.split("-").slice(1).join("-");
        setSearchParams({ date: date, name: studentName});
    }

    const handleNameChange = (e) => {
        const ref = e.current;
        // normalize the input by removing all non-alphanumeric characters,
        // trim spaces, and lowercase
        const input = ref.value
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9 ]/g, "");
        setTimeout(() => {
            ref.value = input.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        }, 100);
        setSearchParams({ date: currentDate, name: input });
    };

    useEffect(() => {
        fetch(process.env.REACT_APP_GET_SHEET_DATA, { method: "GET" })
            .then((response) => response.json())
            .then((json) => {
                if (
                    json.valueRanges &&
                    json.valueRanges[2] &&
                    json.valueRanges[2].values
                ) {
                    let names = json.valueRanges[2].values
                        .map((name) => name[0])
                        .filter(
                            (name) =>
                                name !== undefined &&
                                name
                                    .replace(/[^a-zA-Z0-9 ]/g, "")
                                    .trim() !== ""
                        );
                    setWhitelist([
                        names,
                        names.map((name) =>
                            (
                                name
                                    .replace(/[^a-zA-Z0-9 ]/g, "")
                                    .trim()
                                    .split(" ")[0] +
                                " " +
                                name.split(" ")[1].charAt(0)
                            ).toLowerCase()
                        ),
                    ]);
                }
            });
        }, []);

    return (
        <div>
            <div className="grid-container">
                <div className="student">
                    <h1 style={{ color: "lightgray" }}>Student</h1>
                    <AutoComplete
                        initVal={(studentName ? studentName.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) : '') || ''}
                        onSubmit={handleNameChange}
                        whitelist={whitelist[0]}
                    />
                </div>

                <div className="date-input">
                    <h1 style={{ color: "lightgray" }}>Date</h1>
                    <Form.Control value={new Date().getFullYear().toString() + '-' + currentDate} type="date" onChange={handleDateChange} />
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
