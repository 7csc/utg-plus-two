import { useState } from 'react';
import styles from '../styles/Home.module.css';
import Navigation from '../components/navigation';
import { Download } from "lucide-react";

interface CounterRowData {
    label: string;
    oddsText: string;
    breakEven: string;
    attemptKey: string;
    succeedKey: string;
}

import { ExportCounts } from "../../wailsjs/go/services/ExportService";

const bluffRows: CounterRowData[] = [
    { label: '1/4', oddsText: '$100:$25 = 4:1', breakEven: '20%', attemptKey: '1-1', succeedKey: '1-2' },
    { label: '1/3', oddsText: '$100:$33 = 3:1', breakEven: '25%', attemptKey: '2-1', succeedKey: '2-2' },
    { label: '1/2', oddsText: '$100:$50 = 2:1', breakEven: '33%', attemptKey: '3-1', succeedKey: '3-2' },
    { label: '3/4', oddsText: '$100:$75 = 1.3:1', breakEven: '43%', attemptKey: '4-1', succeedKey: '4-2' },
    { label: 'Pot Size', oddsText: '$100:$100 = 1:1', breakEven: '50%', attemptKey: '5-1', succeedKey: '5-2' },
];

const heroCallRows: CounterRowData[] = [
    { label: '1/4', oddsText: '5:1', breakEven: '16.7%', attemptKey: '6-1', succeedKey: '6-2' },
    { label: '1/3', oddsText: '4:1', breakEven: '19.9%', attemptKey: '7-1', succeedKey: '7-2' },
    { label: '1/2', oddsText: '3:1', breakEven: '25%', attemptKey: '8-1', succeedKey: '8-2' },
    { label: '2/3', oddsText: '2.5:1', breakEven: '28.5%', attemptKey: '9-1', succeedKey: '9-2' },
    { label: '3/4', oddsText: '2.3:1', breakEven: '30%', attemptKey: '10-1', succeedKey: '10-2' },
    { label: 'Pot Size', oddsText: '2:1', breakEven: '33.3%', attemptKey: '11-1', succeedKey: '11-2' },
];

export default function CallCount() {
    const [values, setValues] = useState<Record<string, number>>({
        "1-1": 0,
        "1-2": 0,
        "2-1": 0,
        "2-2": 0,
        "3-1": 0,
        "3-2": 0,
        "4-1": 0,
        "4-2": 0,
        "5-1": 0,
        "5-2": 0,
        "6-1": 0,
        "6-2": 0,
        "7-1": 0,
        "7-2": 0,
        "8-1": 0,
        "8-2": 0,
        "9-1": 0,
        "9-2": 0,
        "10-1": 0,
        "10-2": 0,
        "11-1": 0,
        "11-2": 0,
    });

    const adjustValue = (key:string, amount:number) => {
        setValues(prevValues => {
            const newValue = prevValues[key] + amount;
            return {
            ...prevValues,
            [key]: newValue <0 ? 0 : newValue,
            };
        });
    };

    const CounterRow = ({ row }: {row: CounterRowData}) => (
        <tr className={styles.row}>
            <td className={styles.cell}>{row.label}</td>
            <td className={styles.cell}>{row.oddsText}</td>
            <td className={styles.cell}>{row.breakEven}</td>
            <td className={styles.cell}>
                <button
                    className={styles.counterButton}
                    onClick={() => adjustValue(row.attemptKey, -1)}
                    aria-label={`Decrease attempts for ${row.label}`}
                >-</button>
                {values[row.attemptKey]}
                <button
                    className={styles.counterButton}
                    onClick={() => adjustValue(row.attemptKey, 1)}
                    aria-label={`Increase attempts for ${row.label}`}
                >+</button>
            </td>
            <td className={styles.cell}>
            <button
                className={styles.counterButton}
                onClick={() => adjustValue(row.succeedKey, -1)}
                aria-label={`Decrease successes for ${row.label}`}
            >-</button>
            {values[row.succeedKey]}
            <button
                className={styles.counterButton}
                onClick={() => adjustValue(row.succeedKey, 1)}
                aria-label={`Increase successes for ${row.label}`}
                >+</button>
            </td>  
        </tr>
    );

const handleExport = async () => {
    try {
        const path = await ExportCounts(values);
        alert(`Count records were exported to ${path}`)

        setValues(prevValues => {
            const resetValues = {...prevValues};
            Object.keys(resetValues).forEach(key => resetValues[key] = 0);
            return resetValues;
        });
    } catch (error) {
        console.error("Export Error", error);
        alert("Export Failed");
    }
};



    return (
        <div className={styles.container}>
             <Navigation />
            <h1 className={styles.heading}>Call Counter</h1>

            <section>
            <h2>Bluff</h2>
            <table className={styles.table}>
                <thead>
                <tr className={styles.row}>
                    <th className={styles.cell}>Bluff size</th>
                    <th className={styles.cell}>Reward:Risk Ratio</th>
                    <th className={styles.cell}>Break-even percentage</th>
                    <th className={styles.cell}>Attempts</th>
                    <th className={styles.cell}>Succeed</th>
                </tr>
                </thead>
                <tbody>
                    {bluffRows.map(row => (
                        <CounterRow key={row.attemptKey} row={row}/>
                    ))}
                </tbody>
                </table>
            </section>

            <section>
        <h2>Hero Call</h2>
        <table className={styles.table}>
          <thead>
            <tr className={styles.row}>
              <th className={styles.cell}>Villain bet size</th>
              <th className={styles.cell}>Hero Call Pot Odds</th>
              <th className={styles.cell}>Break-even percentage</th>
              <th className={styles.cell}>Attempts</th>
              <th className={styles.cell}>Succeed</th>
            </tr>
          </thead>
          <tbody>
            {heroCallRows.map(row => (
              <CounterRow key={row.attemptKey} row={row} />
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: '2rem'}}>
        <button className={styles.exportButton} onClick={handleExport}>
            Export <Download size={20} style={{ marginLeft: "3px" }} />
        </button>
      </section>
    </div>
    );
}