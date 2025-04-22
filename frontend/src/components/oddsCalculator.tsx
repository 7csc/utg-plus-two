import React, { useState } from 'react';
import styles from '../styles/Home.module.css';
import appStyles from '../styles/App.module.scss';
import Navigation from '../components/navigation';
import { deck } from '../utils/deck';
import { services } from '../../wailsjs/go/models';


import { CalculateWinProbability } from "../../wailsjs/go/services/CalculateService";

type SelectableCard = {
    rank: string;
    suit: string;
    id: string;
};

const convertCard = (card: SelectableCard): { rank: string; suit: string } => ({
    rank: card.rank,
    suit: card.suit,
});

export default function OddsCalculator() {
    const [player1Cards, setPlayer1Cards] = useState<(SelectableCard | null)[]>( [null, null]);
    const [player2Cards, setPlayer2Cards] = useState<SelectableCard[]>( [null, null]);
    const [boardCards, setBoardCards] = useState<SelectableCard[]>( [null, null, null, null, null]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedCard, setSelectedCard] = useState<SelectableCard | null>(null);

    const [winProbabilities, setWinProbabilities] = useState({ Player1: 0, Player2: 0, Tie: 0});

    const handleCardSelect = (card: SelectableCard) => {
        setSelectedCard(selectedCard?.id === card.id ? null : card);
    };

    const handlePlaceCard = (index: number, type: 'Player1' | 'Player2' | 'Board') => {
        if (!selectedCard) return;

        let newCards;
        switch (type) {
            case 'Player1':
                newCards = [...player1Cards];
                newCards[index] = selectedCard;
                setPlayer1Cards(newCards);
                break;
            case 'Player2':
                newCards = [...player2Cards];
                newCards[index] = selectedCard;
                setPlayer2Cards(newCards);
                break;
            case 'Board':
                newCards = [...boardCards];
                newCards[index] = selectedCard;
                setBoardCards(newCards);
                break;
        }
        setSelectedCard(null);

    };

    const handleRemoveCard = (index: number, type: 'Player1' | 'Player2' | 'Board') => {
        let newCards;
        switch (type) {
        case 'Player1':
            newCards = [...player1Cards];
            newCards[index] = null;
            setPlayer1Cards(newCards);
            break;
        case 'Player2':
            newCards = [...player2Cards];
            newCards[index] = null;
            setPlayer2Cards(newCards);
            break;
        case 'Board':
            newCards = [...boardCards];
            newCards[index] = null;
            setBoardCards(newCards);
            break;
        }
    };

    const calculateWinProbability = async () => {
        setIsLoading(true);

        const req: services.SimulationRequest = {
            Player1: player1Cards.filter(card => card !== null).map(convertCard),
            Player2: player2Cards.filter(card => card !== null).map(convertCard),
            Board: boardCards.filter(card => card !== null).map(convertCard),
            Iterations: 100000,
            convertValues: function (a: any, classs: any, asMap?: boolean) {
                throw new Error('Function not implemented.');
            }
        };

        const result = await CalculateWinProbability(req);

        setWinProbabilities({
                Player1: result.player1WinPercentage,
                Player2: result.player2WinPercentage,
                Tie: result.tiePercentage
        });
        setIsLoading(false);
    };

    

    return (
    <div className={styles.container}>
        <Navigation />

        <div className={appStyles.cardTable}>
                {['❤︎', '♦️', '♣️', '♠️'].map((suit) => (
                    <div key={suit} className={appStyles.cardRow}>
                        {deck.filter(card => card.suit === suit).map((card) => (
                            <div
                                key={card.id}
                                className={`${appStyles.card} ${selectedCard?.id === card.id ? appStyles.selected : ''}`}
                                onClick={() => handleCardSelect(card)}
                            >
                                {card.rank} {card.suit}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

        <div className={appStyles.gameArea}>
            <div className={appStyles.playerArea}>
                <div className={appStyles.player}>
                    <h3>Player 1</h3>
                    <div className={appStyles.playerCards}>
                        {player1Cards.map((card, index) => (
                            <div
                                key={index}
                                className={appStyles.cardSlot}
                                onClick={() =>
                                    card ? handleRemoveCard(index, `Player1`) : handlePlaceCard(index, 'Player1')
                                }
                            >
                                {card ? `${card.rank} ${card.suit}` : 'Blank'}
                            </div>
                        ))}
                    </div>
            </div>
            <div className={appStyles.player}>
                    <h3>Player 2</h3>
                    <div className={appStyles.playerCards}>
                        {player2Cards.map((card, index) => (
                            <div
                                key={index}
                                className={appStyles.cardSlot}
                                onClick={() =>
                                    card ? handleRemoveCard(index, `Player2`) : handlePlaceCard(index, 'Player2')
                                }
                            >
                                {card ? `${card.rank} ${card.suit}` : 'Blank'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={appStyles.board}>
                <h3>Board</h3>
                <div className={appStyles.boardCards}>
                    {boardCards.map((card, index) => (
                        <div
                            key={index}
                            className={appStyles.cardSlot}
                            onClick={() =>
                                card ? handleRemoveCard(index, 'Board') : handlePlaceCard(index, 'Board')
                            }
                        >
                            {card ? `${card.rank} ${card.suit}` : 'Blank'}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className={appStyles.winProbabilities}>
            <div className={appStyles.barWrapper}>
                <div className={appStyles.barContainer}>
                    <div className={appStyles.bar} style={{ width: `${winProbabilities.Player1}%`, backgroundColor: '#00796b' }}></div>
                    <div className={appStyles.bar} style={{ width: `${winProbabilities.Tie}%`, backgroundColor: '#888' }}></div>
                    <div className={appStyles.bar} style={{ width: `${winProbabilities.Player2}%`, backgroundColor: '#d32f2f' }}></div>
                </div>
                <div className={appStyles.labels}>
                    <div className={appStyles.labelBox}>
                        <span className={appStyles.labelText}>Player 1</span>
                        <span className={appStyles.labelValue}>{winProbabilities.Player1}%</span>
                    </div>
                    <div className={appStyles.labelBox}>
                        <span className={appStyles.labelText}>Tie</span>
                        <span className={appStyles.labelValue}>{winProbabilities.Tie}%</span>
                    </div>
                    <div className={appStyles.labelBox}>
                        <span className={appStyles.labelText}>Player 2</span>
                        <span className={appStyles.labelValue}>{winProbabilities.Player2}%</span>
                    </div>
                </div>
            </div> 
        </div>
        <button className={appStyles.calculateButton} onClick={calculateWinProbability} disabled={isLoading}>
            {isLoading ? 'Calculating...' : 'Calculate'}
        </button>
    </div>
    );
}