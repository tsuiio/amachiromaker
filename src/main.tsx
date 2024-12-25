import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";

OverlayScrollbars(document.body, {
  scrollbars: {
    theme: "os-theme-light",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
