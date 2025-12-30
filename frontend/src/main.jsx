import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';

if (!Capacitor.isNativePlatform()) {
  registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Remove loading screen after 2.5 seconds to show the animation
setTimeout(() => {
  const loader = document.getElementById('app-loading');
  if (loader) {
    loader.style.transition = 'opacity 0.5s';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500); // Wait for fade out
  }
}, 2500);
