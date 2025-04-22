import React from 'react';
import './App.css';
import appStyles from './styles/App.module.scss';
import styles from './styles/Home.module.css';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navigation from "./components/navigation";
import CallCount from "./components/callCount";
import Spr from "./components/spr";
import OddsCalculator from "./components/oddsCalculator";
import "../wailsjs/runtime";
import "../wailsjs/go/services/ExportService";
import "../wailsjs/go/services/CalculateService";

const App: React.FC = () => {
      return (
        <Router>
        <div className={styles.container}>
            <Navigation className={styles.sidebar} />
            <div className={styles.content}>
            <div className={appStyles.header}>
            </div>

                <Routes>
                <Route path="/" element={<OddsCalculator />} />
                <Route path="/callCount" element={<CallCount />} />
                <Route path="/spr" element={<Spr />} />
                </Routes>
        
        </div>
        </div>
        </Router>
      );
};



export default App
