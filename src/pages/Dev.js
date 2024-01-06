import { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import AutoComplete from "../components/AutoComplete";
import EventManager from "../components/EventManager";
import ErrorList from "../components/ErrorList";
import "./Dev.css"; 
import { useSearchParams } from "react-router-dom";

function Dev() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [whitelist, setWhitelist] = useState([[], []]);
    let urlName = searchParams.get("name") || "";
    let urlDate =
        searchParams.get("date") ||
        new Date()
            .toLocaleDateString("en-GB", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
            .split("/")
            .reverse()
            .join("-");
    const [currentDate, setCurrentDate] = useState(
        urlDate ||
            new Date()
                .toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                .split("/")
                .reverse()
                .join("-")
    );
    const [studentName, setStudentName] = useState(urlName || "");
    const [errors, setErrors] = useState([]);

    const handleDateChange = (e) => {
        e.preventDefault();
        // only get the month and day of the date
        setCurrentDate(e.target.value);
        // console.log(currentDate, studentName);
    };

    useEffect(() => {
        setSearchParams({ date: currentDate, name: studentName });
    }, [currentDate, studentName]);

    // console.log(currentDate, studentName);

    const handleNameChange = (e) => {
        const value = e.current.value || studentName;
        // normalize the input by removing all non-alphanumeric characters,
        // trim spaces, and lowercase
        const input = value
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9 ]/g, "");
        setTimeout(() => {
            e.current.value = input.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                letter.toUpperCase()
            );
        }, 300);
        setStudentName(input);
        // console.log(currentDate, studentName);
    };

    const getEventData = async (inputName, inputDate) => {
        const response = await fetch(process.env.REACT_APP_GET_SHEET_DATA, {
            method: "GET",
        });
        const json = await response.json();
        if (
            !(
                json.valueRanges &&
                json.valueRanges[3] &&
                json.valueRanges[3].values
            )
        ) {
            return [];
        }
        const data = json.valueRanges[3].values;

        function areSameDay(date1, date2) {
            const newDate1 = new Date(date1);
            const newDate2 = new Date(date2);

            return (
                newDate1.getFullYear() === newDate2.getFullYear() &&
                newDate1.getMonth() === newDate2.getMonth() &&
                newDate1.getDate() === newDate2.getDate()
            );
        }

        return data
            .map((row) => {
                const name = row[0];
                const state = row[1];
                const date = row[2].split(" ")[0];
                const time = row[2].split(" ")[1];

                let event = {
                    name: name,
                    state: state,
                    time: time,
                    date: date,
                };

                if (
                    event.name.toLowerCase() === inputName &&
                    areSameDay(event.date, inputDate)
                ) {
                    return event;
                }
            })
            .filter((event) => event !== undefined);
    };

    useEffect(() => {
        fetch(process.env.REACT_APP_GET_SHEET_DATA, { method: "GET" })
            .then((response) => response.json())
            .then((json) => {

                if (
                    json.valueRanges &&
                    json.valueRanges[4] &&
                    json.valueRanges[4].values
                ) {
                    setErrors(json.valueRanges[4].values.map((row) => row[0]));
                }

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
                                name.replace(/[^a-zA-Z0-9 ]/g, "").trim() !== ""
                        );
                    setWhitelist([
                        names,
                        names ||
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

    const getInitVal = () => {
        // console.log(studentName);
        return (
            (studentName
                ? studentName.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                      letter.toUpperCase()
                  )
                : "") || ""
        );
    };

    return (
        <div>
            <span className="grid-container">
                <div className="left-col">
                    <div className="student-date">
                        <span>
                            <h1 style={{ color: "lightgray" }}>Student</h1>
                            <AutoComplete
                                initVal={getInitVal}
                                onSubmit={handleNameChange}
                                whitelist={whitelist[0]}
                            />
                        </span>

                        <span>
                            <h1 style={{ color: "lightgray" }}>Date</h1>
                            <Form.Control
                                value={currentDate}
                                type="date"
                                onChange={handleDateChange}
                            />
                        </span>
                    </div>

                    <EventManager
                        name={studentName}
                        date={currentDate.toString()}
                        getEventData={getEventData}
                    />
                </div>
                
                <div className="errors">
                    <ErrorList errors={errors} />
                </div>
            </span>
        </div>
    );
}

export default Dev;
