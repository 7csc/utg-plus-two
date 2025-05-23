import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'
import "../wailsjs/runtime";
import "../wailsjs/go/services/ExportService";

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
)
