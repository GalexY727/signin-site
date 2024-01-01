import { useState, useRef, useEffect } from "react";
import "./AutoComplete.css";

const AutoComplete = ({ initVal='', whitelist, onSubmit }) => {
    const [value, setValue] = useState(initVal);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    const [autoCompleteValue, setRealAutoCompleteValue] = useState("");

    const setAutoCompleteValue = (
        name,
        index = activeSuggestionIndex,
        filter = suggestions
    ) => {
        let ghostText =
            name !== "" ? name + (filter[index] || "").slice(name.length) : "";
        setRealAutoCompleteValue(ghostText);
    };

    const keyDownHandler = (e) => {
        switch (e.key) {
            case "ArrowDown":
                const newIndexDown =
                    activeSuggestionIndex + 1 < suggestions.length
                        ? activeSuggestionIndex + 1
                        : 0;
                setActiveSuggestionIndex(newIndexDown);
                setAutoCompleteValue(value, newIndexDown);
                e.preventDefault();
                break;
            case "ArrowUp":
                const newIndexUp =
                    activeSuggestionIndex - 1 >= 0
                        ? activeSuggestionIndex - 1
                        : suggestions.length - 1;
                setActiveSuggestionIndex(newIndexUp);
                setAutoCompleteValue(value, newIndexUp);
                e.preventDefault();
                break;
            case "Tab":
            case "Enter":
                setValue(suggestions[activeSuggestionIndex] || "");
                setShowSuggestions(false);
                // Send the ref and give the code time to access
                // the value since it was just updated
                setTimeout(() => {
                    onSubmit(autoCompleteRef);
                }, 10);
            case "Escape":
                // in case the above case was just triggered,
                // wait a bit before clearing the value
                // so that it can be sent to onSubmit
                setTimeout(() => {
                    setValue("");
                    setAutoCompleteValue("");
                }, 10);
                setShowSuggestions(false);
                e.preventDefault();
                break;
            default:
        }
    };

    const onChange = (e) => {
        setValue(e.target.value);
        const filter = e.target.value.match(/[a-z0-9]/i)
            ? whitelist
                  .filter(
                      (name) =>
                          name
                              .toLowerCase()
                              .indexOf(e.target.value.toLowerCase()) > -1
                  )
                  .slice(0, 5) // Only take the first three suggestions
            : [];

        setSuggestions(filter.slice(0, 5));
        if (filter.length > 0) {
            setShowSuggestions(true);
            setActiveSuggestionIndex(0);
            setAutoCompleteValue(e.target.value, 0, filter);
        } else {
            setShowSuggestions(false);
            setAutoCompleteValue("");
        }
    };

    const onClickHandler = (e) => {
        setValue(e.target.innerText);
        setShowSuggestions(false);
        // Send the ref and give the code time to access
        // the value since it was just updated
        setTimeout(() => {
            onSubmit(autoCompleteRef);
            setTimeout(() => {
                setValue("");
                setAutoCompleteValue("");
            }, 10);
        }, 10);
    };

    useEffect(() => {
        const handleOutsideCLick = (e) => {
            if (
                autoCompleteRef.current &&
                !autoCompleteRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("click", handleOutsideCLick);
        return () => {
            document.removeEventListener("click", handleOutsideCLick);
        };
    }, []);

    const autoCompleteRef = useRef();

    return (
        <div className="auto-complete">
            <div style={{ position: "relative" }}>
                <input
                    className="auto-complete-ghost"
                    type="text"
                    value={autoCompleteValue}
                    placeholder=""
                    disabled
                />
                <input
                    style={{ position: "relative", zIndex: 2 }}
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={autoCompleteRef}
                    onKeyDown={keyDownHandler}
                    placeholder="Enter your full name"
                    required="required"
                />
            </div>

            {showSuggestions && (
                <ul className="suggestions">
                    {suggestions.map((suggestion, index) => (
                        <li
                            className={
                                index === activeSuggestionIndex ? "active" : ""
                            }
                            key={suggestion}
                            onClick={onClickHandler}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutoComplete;
