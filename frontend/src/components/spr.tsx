import React, { useState } from 'react';
import styles from '../styles/Home.module.css';
import Navigation from '../components/navigation';

export default function Spr() {
    const [estack, setEstack] = useState('');
    const [potsize, setPotsize] = useState('');
    const [result, setResult] = useState<number | null>(null);
    const [error, setError] = useState('');

    const calculateSPR = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setResult(null);

        const effectiveStack = parseFloat(estack);
        const potSize = parseFloat(potsize);

        if (isNaN(effectiveStack) || isNaN(potSize)) {
            setError('Please enter a valid number.');
            return;
        }
        if (potSize === 0) {
            setError('Enter a non-zero value for pot size.');
            return;
        }
        const spr = effectiveStack / potSize;
        setResult(spr);
    };

    return (
        <div className={styles.container}>
            <Navigation />
            <div className={styles.spr_content}>
            <h1 className={styles.heading}>SPR</h1>
            <form className={styles.spr_form} onSubmit={calculateSPR} autoComplete="off">
            <div className={styles.spr_field}>
                    <label className={styles.spr_label} htmlFor="hand">Effective Stack:</label>
                    <input
                        className={styles.spr_input}
                        type="number"
                        id="estack"
                        value={estack}
                        placeholder="Example: 100"
                        onChange={(e) => setEstack(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.spr_field}>
                    <label className={styles.spr_label} htmlFor="board">Pot Size:</label>
                    <input
                        className={styles.spr_input}
                        type="text"
                        id="potsize"
                        value={potsize}
                        placeholder="Example: 30"
                        onChange={(e) => setPotsize(e.target.value)}
                    />
                </div>
                <button className={styles.spr_button} type="submit">Calculate SPR</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            {result !== null && (
                <div className={styles.result}>
                    <p>SPR: {result.toFixed(2)}</p>
                </div>
            )}
        </div>
        </div>
    );
}