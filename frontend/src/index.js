
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { init, initData } from "@telegram-apps/sdk-react";

// Initialize Telegram Mini App SDK
init();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
      