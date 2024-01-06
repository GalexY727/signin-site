import { Form } from "react-bootstrap";
import "./ErrorList.css";

const ErrorList = ({ errors }) => {
    return (
        <div>
            <h1 style={{ color: "lightgray" }}>Errors: </h1>
            <div className="error-list">
                {errors && errors.map((error, index) => (
                    <input className="error" type="text" value={error} key={index} disabled="true" />
                ))}
            </div>
        </div>
    );
}

export default ErrorList;