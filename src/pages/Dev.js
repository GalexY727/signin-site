import { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import AutoComplete from "../components/AutoComplete";
import EventManager from "../components/EventManager";
import ErrorList from "../components/ErrorList";
import "./Dev.css"; 
import { useSearchParams } from "react-router-dom";
import { db } from "../utils/firebaseConfig.js";
import { get, onValue, ref, set } from "firebase/database";

function Dev() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [studentWhitelist, setStudentWhitelist] = useState([]);
    const [parentWhitelist, setParentWhitelist] = useState([]);
    const [combinedWhitelist, setCombinedWhitelist] = useState([]);
    
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
    const [searchName, setSearchName] = useState(urlName || "");
    const [errors, setErrors] = useState([]);

    const handleDateChange = (e) => {
        e.preventDefault();
        // only get the month and day of the date
        setCurrentDate(e.target.value);
    };

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    const handleDurationChange = (addedDuration) => {
        // Get the current duration of the current day
        // += the added duration
        // Set the new duration
        const data = getData();
        
        data.then((data) => {
            let studentData = true ? data.Students : data.Parents;
            try {
                let duration = "0:0:0";
                let titleCaseName = toTitleCase(searchName);
                let [currentYear, currentMonth, currentDay] = currentDate.split("-");
                if (currentDay.startsWith("0")) {
                    currentDay = currentDay.slice(1);
                }
                if (currentMonth.startsWith("0")) {
                    currentMonth = currentMonth.slice(1);
                }
                if (
                    studentData[titleCaseName] &&
                    studentData[titleCaseName][currentYear] &&
                    studentData[titleCaseName][currentYear][currentMonth] &&
                    studentData[titleCaseName][currentYear][currentMonth][currentDay]
                ) {
                    duration = studentData[titleCaseName][currentYear][currentMonth][currentDay].duration || "0:0:0";
                    console.log(duration);
                }
                let [hours, minutes, seconds] = duration.split(":");
                // the addedDuration is in hours
                hours = parseInt(hours) + parseInt(addedDuration);
                // clamp hours from 0-12
                hours = Math.min(12, Math.max(0, hours));
                duration = `${hours}:${minutes}:${seconds}`;

                let [year, month, day] = urlDate.split("-");

                // if the day starts with 0, remove it
                if (day.startsWith("0")) {
                    day = day.slice(1);
                }
                if (month.startsWith("0")) {
                    month = month.slice(1);
                }

                setData(true, toTitleCase(urlName), year, month, day, null, duration);
            }
            catch (e) {
                console.error(e);
            }
        });
    }

    const getData = () => {
        return get(ref(db, '/')).then((snapshot) => {
            if (snapshot.exists()) {
                return snapshot.val();
            }
        }).catch((error) => {
            console.error(error);
        }).then((data) => {
            return data;
        });
    }

    const setData = async (isStudent = true, name, year, month, day, index, value) => {
        // Adjust the path based on whether it's a student or not
        const basePath = isStudent ? '/Students' : '/Parents';
        
        let path = `${basePath}/${name}/${year}/${month}/${day}`;

        console.log(index);
        if (index != null || index != undefined) {
            console.log(index);
            path += `/${index}`;
            console.log(path);
        }

        path += `/${"duration"}`;
        
        console.log(path);
        // Now, set the data using the modified path
        set(ref(db, path), value);
    }

    useEffect(() => {
        setSearchParams({ date: currentDate, name: searchName });
    }, [currentDate, searchName]);


    const handleNameChange = (e) => {
        const value = e.current.value || searchName;
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
        setSearchName(input);
    };

    const getEventData = async (inputName, inputDate) => {
        if (!inputName) return [];
        const response = await fetch(process.env.REACT_APP_GET_SHEET_DATA, {
            method: "GET",
        });

        const json = await response.json();

        let arrayIndex = studentWhitelist.map((name) => name.toLowerCase()).includes(inputName.toLowerCase()) ? 3 : 5;

        if (
            !(
                json.valueRanges &&
                json.valueRanges[arrayIndex] &&
                json.valueRanges[arrayIndex].values
            )
        ) {
            console.log("no data!")
            return [];
        }
        const data = json.valueRanges[arrayIndex].values;

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
                    const studentNames = json.valueRanges[2].values
                        .map((name) => name[0])
                        .filter(
                            (name, index, self) =>
                                name !== undefined &&
                                name.replace(/[^a-zA-Z0-9 ]/g, "").trim() !== "" &&
                                self.indexOf(name) === index // Check if the current index is the first occurrence of the name
                        );
                    setStudentWhitelist(studentNames);

                    const parentNames = json.valueRanges[2].values
                        .map((row) => {
                            // Extract parent names from columns 3-8
                            let parentNames = row
                                .slice(2, 8)
                                .filter((name) => name !== undefined);
                            return parentNames;
                        })
                        .flat() // Flatten the array
                        .filter(
                            (name, index, self) =>
                                name.replace(/[^a-zA-Z0-9 ]/g, "").trim() !== "" &&
                                self.indexOf(name) === index // Check if the current index is the first occurrence of the name
                        );
                    setParentWhitelist(parentNames);
                    setCombinedWhitelist([...studentNames, ...parentNames]);
                }
            });
    }, []);

    const getInitVal = () => {
        return (
            (searchName
                ? searchName.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
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
                                whitelist={combinedWhitelist}
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
                        name={searchName}
                        date={currentDate.toString()}
                        getEventData={getEventData}
                        onSubmit={handleDurationChange}
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
