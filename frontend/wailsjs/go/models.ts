export namespace services {
	
	export class Card {
	    rank: string;
	    suit: string;
	
	    static createFrom(source: any = {}) {
	        return new Card(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.rank = source["rank"];
	        this.suit = source["suit"];
	    }
	}
	export class SimulationRequest {
	    Player1: Card[];
	    Player2: Card[];
	    Board: Card[];
	    Iterations: number;
	
	    static createFrom(source: any = {}) {
	        return new SimulationRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Player1 = this.convertValues(source["Player1"], Card);
	        this.Player2 = this.convertValues(source["Player2"], Card);
	        this.Board = this.convertValues(source["Board"], Card);
	        this.Iterations = source["Iterations"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SimulationResult {
	    player1WinPercentage: number;
	    player2WinPercentage: number;
	    tiePercentage: number;
	
	    static createFrom(source: any = {}) {
	        return new SimulationResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.player1WinPercentage = source["player1WinPercentage"];
	        this.player2WinPercentage = source["player2WinPercentage"];
	        this.tiePercentage = source["tiePercentage"];
	    }
	}

}

