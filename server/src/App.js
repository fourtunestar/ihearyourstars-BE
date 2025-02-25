import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TestMusic from "./Router/TestMusic";
function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<TestMusic />} />
        </Routes>
    </Router>
  );
}

export default App;