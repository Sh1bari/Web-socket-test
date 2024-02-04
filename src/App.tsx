import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WebSocketComponent from "./components/WebSocketComponent";
import Header from "./components/global/Header";
import Devices from "./pages/Devices";

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ width: "100vw" }}>
              <Devices />
            </div>
          }
        />
        <Route path="/socket" element={<WebSocketComponent />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
