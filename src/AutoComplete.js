import { useState, useRef, useEffect } from "react";
import './AutoComplete.css';

const AutoComplete = ({ options = ["Alexander", "Alice", "Alone"] , onSubmit }) => {
    const [value, setValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    const suggestions = value.match(/[a-z0-9]/i) 
        ? options
            .filter((option) => option.toLowerCase().indexOf(value.toLowerCase()) > -1)
            .slice(0, 3) // Only take the first three suggestions
        : [];

    const autoCompleteHandler = value + (suggestions[activeSuggestionIndex] || '').slice(value.length);
    
    const keyDownHandler = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                const newIndexDown = activeSuggestionIndex + 1 < suggestions.length ? activeSuggestionIndex + 1 : 0;
                setActiveSuggestionIndex(newIndexDown);
                e.preventDefault();
                break;
            case 'ArrowUp':
                const newIndexUp = activeSuggestionIndex - 1 >= 0 ? activeSuggestionIndex - 1 : suggestions.length - 1;
                setActiveSuggestionIndex(newIndexUp);
                e.preventDefault();
                break;
            case 'Tab':
            case 'Enter':
                e.preventDefault();
                setValue(suggestions[activeSuggestionIndex] || '');
                setShowSuggestions(false);
                // Send the ref and give the code time to access
                // the value since it was just updated
                setTimeout(() => {
                    onSubmit(autoCompleteRef);
                }, 10);
            case 'Escape':
                // in case the above case was just triggered,
                // wait a bit before clearing the value
                // so that it can be sent to onSubmit
                setTimeout(() => {
                    setValue('');
                }, 10);
                setShowSuggestions(false);
                e.preventDefault();
                break;
            case 'Backspace':
                if (e.ctrlKey) {
                    const words = value.trim().split(/\s+/);
                    words.pop();
                    setValue(words.join(' '));
                    e.preventDefault();
                }
                break;
            default:
            if (!showSuggestions)
                setActiveSuggestionIndex(0);
                setShowSuggestions(true);
        }
    }

    useEffect(() => {
        const handleOutsideCLick = (e) => {
            if (autoCompleteRef.current && !autoCompleteRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener("click", handleOutsideCLick);
        return () => {
            document.removeEventListener("click", handleOutsideCLick);
        };
    }, []);

    useEffect(() => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [suggestions]);

    const autoCompleteRef = useRef();

    return (
        <div className="auto-complete">
            <div className="form" style={{ position: 'relative' }}>
                <input
                    className="auto-complete-ghost"
                    type="text"
                    value={autoCompleteHandler}
                    disabled
                />
                <input
                    style={{ position: 'relative', zIndex: 2 }}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    ref={autoCompleteRef}
                    onKeyDown={keyDownHandler}
                    placeholder="Enter your full name"
                    required="required"
                />
                
            </div>

            {showSuggestions && (
                <ul className="suggestions">
                    {suggestions.map((suggestion, index) => (
                        <li className={index === activeSuggestionIndex ? 'active' : ''} key={suggestion} onClick={() => setValue(suggestion)}>
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AutoComplete;