import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WebSocketComponent from "./pages/WebSocketComponent";
import Header from "./components/global/Header";
import Devices from "./pages/Devices";
import DeviceExample from "./pages/DeviceExample";

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
        <Route
          path="/socket"
          element={
            <div style={{ width: "100vw" }}>
              <WebSocketComponent />
            </div>
          }
        />
        <Route
          path="/device"
          element={
            <div style={{ width: "100vw" }}>
              <DeviceExample />
            </div>
          }
        />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
