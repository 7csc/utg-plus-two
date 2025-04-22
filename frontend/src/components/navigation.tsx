import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/Home.module.css";

type NavigationProps = {
    readonly className?: string;
}

export default function Navigation( { className }: NavigationProps) {
    const router = useLocation();

    return (
        <div className={`${styles.sidebar} ${className || ""}`}>
            <Link to="/" className={router.pathname === '/' ? styles.activeTab : ""}>
                Odds Calculator
            </Link>
            <Link to="/callCount" className={router.pathname === '/callCount' ? styles.activeTab : ""}>
               Bluff & Hero Call Counter
            </Link>
            <Link to="/spr" className={router.pathname === '/spr' ? styles.activeTab : ""}>
               SPR(Stack to Pot Ratio)
            </Link>
        </div>
    );
}