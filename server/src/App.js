import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Music from "./Router/TestMusic";
function App() {
  return (
    <Router>
      <BodyWrapper>
        <Routes>
          <Route path="/music" element={<Music />} />
        </Routes>
        <Footer />
      </BodyWrapper>
    </Router>
  );
}

export default App;