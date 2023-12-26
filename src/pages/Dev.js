import AutoComplete from "../components/AutoComplete";
import EventManager from "../components/EventManager";
import './Dev.css';

function Dev() {
    return (
        <div>
            <div className="grid-container">
                <div className="student">
                    <h1 style={{color:"lightgray"}}>Student</h1>
                    <AutoComplete />
                </div>

                <div className="date">
                    <h1 style={{color:"lightgray"}}>Date</h1>
                    <AutoComplete />
                </div>

                <div className="errors">
                    <h1 style={{color:"lightgray"}}> Errors: </h1>
                </div>

                <EventManager />
                
            </div>
        </div>  
    );

}

export default Dev;