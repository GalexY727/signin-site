import { React, useState, useEffect } from "react";
import AutoComplete from "../components/AutoComplete";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import "../Loader.css";
import { db } from "../utils/firebaseConfig.js";
import { get, ref, set } from "firebase/database";

function Home() {
    const [studentNames, setStudentNames] = useState([]);
    const [parentNames, setParentNames] = useState([]);
    const [studentWhitelist, setStudentWhitelist] = useState([]);
    const [parentWhitelist, setParentWhitelist] = useState([]);
    const [studentHashmap, setStudentHashmap] = useState([{}]);
    const [isLoading, setIsLoading] = useState(true);
    const [recentActivityState, setRecentActivityState] = useState("");
    const groupNames = [
        "Build",
        "Programming",
        "Design",
        "Marketing",
        "Leadership",
    ];

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

    const setData = async (isStudent = true, name, year, month, day, index, state, value) => {
        // Adjust the path based on whether it's a student or not
        const basePath = isStudent ? '/Students' : '/Parents';
        
        let path = `${basePath}/${name}/${year}/${month}/${day}`;

        console.log(index);
        if (index != null || index !== undefined) {
            console.log(index);
            path += `/${index}`;
            console.log(path);
        }

        path += `/${state}`;
        
        console.log(path);
        // Now, set the data using the modified path
        set(ref(db, path), value);
    }

    // function setData(name, year, month, day, state, value, isStudent = true) {
    //     // Adjust the path based on whether it's a student or not
    //     const basePath = isStudent ? '/Students' : '/NonStudents';
    //     const path = `${basePath}/${name}/${year}/${month}/${day}/${state}`;
        
    //     // Now, set the data using the modified path
    //     set(ref(db, path), value);
    // }

    // Pull from the cache in sheets on startup
    useEffect(() => {
        const data = getData();
        data.then((data) => {
            console.log(data);
            
            const studentData = data.Students;
            const parentData = data.Parents;

            let studentNames = [];
            let parentNames = [];

            Object.keys(studentData).forEach(name => {
                const year = Object.keys(studentData[name])[0];
                const month = Object.keys(studentData[name][year])[0];
                const day = Object.keys(studentData[name][year][month])[0];
                if (studentData[name][year][month][day].signedIn) {
                    console.log(`${name} is signed in.`);
                    studentNames.push(name);
                } else {
                    console.log(`${name} is not signed in.`);
                }
            });

            Object.keys(parentData).forEach(name => {
                const year = Object.keys(parentData[name])[0];
                const month = Object.keys(parentData[name][year])[0];
                const day = Object.keys(parentData[name][year][month])[0];
                if (parentData[name][year][month][day].signedIn) {
                    console.log(`${name} is signed in.`);
                    parentNames.push(name);
                } else {
                    console.log(`${name} is not signed in.`);
                }
            });

            setStudentNames(studentNames);
            setParentNames(parentNames);
        });
        setTimeout(() => {
            fetch(process.env.REACT_APP_GET_SHEET_DATA, { method: "GET" })
                .then((response) => response.json())
                .then((json) => {
                    // Set the studentWhitelist based upon col 5
                    if (
                        json.valueRanges &&
                        json.valueRanges[2] &&
                        json.valueRanges[2].values
                    ) {
                        setStudentWhitelist(
                            json.valueRanges[2].values
                                .map((name) => name[0])
                                .filter(
                                    (name) =>
                                        name !== undefined &&
                                        name
                                            .replace(/[^a-zA-Z0-9 ]/g, "")
                                            .trim() !== ""
                                )
                        );
                        setStudentHashmap(
                            json.valueRanges[2].values.reduce(
                                (acc, [name, group]) => {
                                    acc[name] = group;
                                    return acc;
                                },
                                {}
                            )
                        );
                        setParentWhitelist(
                            json.valueRanges[2].values
                                .map((row) => {
                                    // Extract parent names from columns 3-8
                                    let parentNames = row
                                        .slice(2, 8)
                                        .filter((name) => name !== undefined);
                                    return parentNames;
                                })
                                .flat() // Flatten the array
                                .filter(
                                    (name) =>
                                        name
                                            .replace(/[^a-zA-Z0-9 ]/g, "")
                                            .trim() !== ""
                                )
                        );
                    }
                    setIsLoading(false);
                });
        }, 3000);
    }, []);

    const acceptedAnimation = (ref) => {
        ref.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(1.02)", background: "rgba(0,255,0,0.5)" },
                { transform: "scale(1)", background: "rgba(0,0,0,0.3)" },
            ],
            {
                duration: 800,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "both",
            }
        );
    };

    const removalAnimation = (ref) => {
        ref.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(0.93)", background: "rgba(170,19,24,0.6)" },
                { transform: "scale(1)", background: "rgba(0,0,0,0.3)" },
            ],
            {
                duration: 800,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "both",
            }
        );
    };

    const deniedAnimation = (ref) => {
        ref.animate(
            [
                { transform: "translate(1px, 1px) rotate(0deg)" },
                { transform: "translate(-1px, -2px) rotate(-1deg)" },
                {
                    transform: "translate(-3px, 0px) rotate(1deg)",
                    background: "red",
                },
                { transform: "translate(3px, 2px) rotate(0deg)" },
                { transform: "translate(1px, -1px) rotate(1deg)" },
                { transform: "translate(-1px, 2px) rotate(-1deg)" },
                { transform: "translate(-3px, 1px) rotate(0deg)" },
                { transform: "translate(3px, 1px) rotate(-1deg)" },
                { transform: "translate(-1px, -1px) rotate(1deg)" },
                { transform: "translate(1px, 2px) rotate(0deg)" },
                { transform: "translate(1px, -2px) rotate(-1deg)" },
                {
                    transform: "translate(1px, 1px) rotate(0deg)",
                    background: "rgba(0,0,0,0.3)",
                },
            ],
            {
                duration: 820,
                easing: "cubic-bezier(.36,.07,.19,.97)",
                fill: "both",
            }
        );
    };

    const studentSubmit = (inputRef) => {
        const ref = inputRef.current;
        const input = ref.value.trim().replace(/[^a-zA-Z0-9 ]/g, "");

        if (!studentWhitelist.includes(input)) {
            deniedAnimation(ref);
            return;
        }
        inputRef.current.value = "";
        compileData(input, ref, true);
    };

    const parentSubmit = (inputRef) => {
        const ref = inputRef.current;
        const input = ref.value.trim().replace(/[^a-zA-Z0-9 ]/g, "");

        if (!parentWhitelist.includes(input)) {
            deniedAnimation(ref);
            return;
        }
        
        inputRef.current.value = "";
        compileData(input, ref, false);
    };

    return (
        <div>
            <div className="instructions">
                Enter a name to sign in. Then, enter it again to sign out.
                <h2 className="text-center text-red">
                    DON'T FORGET TO SIGN OUT!
                </h2>
                <div
                    className={`activity-state 
            ${
                recentActivityState.includes("in")
                    ? "text-green"
                    : recentActivityState.includes("out")
                    ? "text-red"
                    : ""
            } 
            ${recentActivityState ? "top-bottom-borders" : ""}`}
                >
                    {recentActivityState}
                </div>
            </div>
            <div className="login student-side">
                <h1 className="user-select-none">Students</h1>
                <form onSubmit={studentSubmit}>
                    <AutoComplete
                        onSubmit={studentSubmit}
                        whitelist={studentWhitelist}
                        className="form"
                    />
                </form>
            </div>
            <div className="login parent-side">
                <h1 className="user-select-none">Parent/Mentors</h1>
                <form onSubmit={parentSubmit}>
                    <AutoComplete
                        onSubmit={parentSubmit}
                        whitelist={parentWhitelist}
                        className="form"
                    />
                </form>
            </div>
            <div className="px-3 text-center text-light students user-select-none">
                <h3>
                    {isLoading || studentNames.length === 0 ? " " : "Students:"}
                </h3>
                <div className="names d-flex flex-wrap">
                    {/* Loop over each group (Build, Design, etc) */}
                    {groupNames.map((groupName) => {
                        const namesInGroup = Object.entries(
                            studentHashmap
                        ).filter(
                            ([name, group]) =>
                                group === groupName &&
                                studentNames.includes(name)
                        );
                        return (
                            namesInGroup.length > 0 && (
                                <div className="group-name" key={groupName}>
                                    <h4>{groupName}</h4>
                                    <div className="group">
                                        {namesInGroup.map(([name]) => (
                                            <div
                                                className="px-3 text-nowrap text-light name"
                                                key={name}
                                            >
                                                <span>
                                                    {name === "Emily Hager"
                                                        ? "🦒 "
                                                        : ""}
                                                    <span>{name}</span>
                                                    {name === "Emily Hager"
                                                        ? " 🦒"
                                                        : ""}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        );
                    })}
                </div>
                <span className="loader"></span>
            </div>
            <div className="px-3 text-center text-light mentors user-select-none">
                <h3>
                    {isLoading || parentNames.length === 0
                        ? " "
                        : "Parents/Mentors:"}
                </h3>
                <div className="names group row">
                    {parentNames.map((name) => (
                        <div
                            className="px-3 text-nowrap text-light name col-md-6"
                            key={name}
                        >
                            <span>
                                <span>{name}</span>
                            </span>
                        </div>
                    ))}
                </div>
                <span className="loader"></span>
            </div>
        </div>
    );

    function compileData(name, ref, isStudent) {
        const data = getData();

        const date = new Date(Date.now());
        const year = date.getFullYear();
        const month = date.getMonth()+1;
        const day = date.getDate();
        const outTime = date.getTime();

        data.then((data) => {
            let studentData = isStudent ? data.Students : data.Parents;
            let index = 0;
            if (studentNames.includes(name)) {
                removalAnimation(ref);
                let timeDiff;
                try {
                    index = Object.keys(studentData[name][year][month][day]).length - 3;
                    console.log(index);
                    let inTime = studentData[name][year][month][day][index]["in"];
                    timeDiff = outTime - inTime;
                    let diffInSeconds = Math.floor(timeDiff / 1000);
                    let hours = Math.floor(diffInSeconds / 3600);
                    diffInSeconds %= 3600;
                    let minutes = Math.floor(diffInSeconds / 60);
                    let seconds = diffInSeconds % 60;

                    let existingDuration = studentData[name][year][month][day]["duration"] || "0:0:0";
                    let [existingHours, existingMinutes, existingSeconds] = existingDuration.split(':').map(Number);

                    hours += existingHours;
                    minutes += existingMinutes;
                    seconds += existingSeconds;

                    if (seconds >= 60) {
                        minutes += Math.floor(seconds / 60);
                        seconds %= 60;
                    }
                    if (minutes >= 60) {
                        hours += Math.floor(minutes / 60);
                        minutes %= 60;
                    }

                    console.log(hours, minutes, seconds);

                    timeDiff = `${hours}:${minutes}:${seconds}`;
                    console.log(timeDiff);
                } catch (error) {
                    console.log(error);
                }

                console.log(name, year, month, day, "duration", timeDiff);
                setData(isStudent, name, year, month, day, null, "duration", timeDiff);
                console.log(name, year, month, day, "out", outTime);
                setData(isStudent, name, year, month, day, index, "out", outTime);
                setData(isStudent, name, year, month, day, null, "signedIn", false);

                setStudentNames((currentNames) => currentNames.filter((el) => el !== name));
                setRecentActivityState("Signed out " + name);
                setTimeout(() => {
                    setRecentActivityState("");
                }, 5000);
            } else {
                acceptedAnimation(ref);
                let newStudentNames = [...studentNames, name];
                setStudentNames(newStudentNames);
                console.log(studentData, name, year, month, day, "in", outTime);
                console.log(index);
                // check if the duration exists
                getData().then((data) => {
                    const studentData = isStudent ? data.Students : data.Parents;
                    try {
                        let duration = studentData[name][year][month][day]["duration"];
                        console.log(duration);
                    } catch {
                        console.log("duration doesn't exist");
                        setData(isStudent, name, year, month, day, null, "duration", "0:0:0");
                    }
                });

                try {
                    index = Object.keys(studentData[name][year][month][day]).length - 2;
                    console.log(index);
                } catch {
                    index = 0;
                }
                setData(isStudent, name, year, month, day, index, "in", outTime).then(() => {
                    setData(isStudent, name, year, month, day, null, "signedIn", true);
                });
                setRecentActivityState("Signed in " + name);
                setTimeout(() => {
                    setRecentActivityState("");
                }, 5000);
            }
        });
    }
}

export default Home;