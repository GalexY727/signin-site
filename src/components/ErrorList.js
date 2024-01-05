import { Form } from "react-bootstrap";
import "./ErrorList.css";

const ErrorList = ({ errors }) => {
    console.log(errors);

    return (
        <div>
            <h1 style={{ color: "lightgray" }}>Errors: </h1>
            <div className="error-list">
                {errors.map((error) => (
                    <Form.Control className="errors" type="text" value={error} readOnly />
                ))}
            </div>
        </div>
    );
}

export default ErrorList;