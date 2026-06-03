import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
/*const pool = require("./db");

async function testDB() {
  try {
    const [rows] = await pool.query("SELECT 1");
    console.log("DB Connected ✅");
  } catch (err) {
    console.error("DB Error ❌", err.message);
  }
}

testDB();*/
reportWebVitals();
