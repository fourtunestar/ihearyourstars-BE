import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Music from "./Router/TestMusic";

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/music" element={<Music />} />
        </Routes>
    </Router>
  );
}

export default App;