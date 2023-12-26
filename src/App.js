import Home from "./pages/Home";
import Dev from "./pages/Dev";

import {Route, Routes, BrowserRouter} from "react-router-dom";

function App() {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/Dev" element={<Dev/>}/>
                    <Route path="*" element={<h1>404</h1>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;