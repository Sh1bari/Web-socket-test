import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import WebSocketProvider from "./components/global/WebSocketProvider.tsx";
import { Provider } from "react-redux";
import store from './redux/store';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </Provider>
);
