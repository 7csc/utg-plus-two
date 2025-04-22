export type Card = {
    Rank: string;
    Suit: string;
  };
  
  export type SimulationRequest = {
    Player1: Card[];
    Player2: Card[];
    Board: Card[];
    Iterations: number;
  };