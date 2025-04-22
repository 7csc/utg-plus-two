package services

import (
	"context"
	"math"
	"math/rand"
	"sort"
	"sync"
	"sync/atomic"
)

type CalculateService struct {
	ctx context.Context
}

func NewCalculateService() *CalculateService {
	return &CalculateService{}
}

func (c *CalculateService) SetContext(ctx context.Context) {
	c.ctx = ctx
}

type Card struct {
	Rank string `json:"rank"`
	Suit string `json:"suit"`
}

type SimulationRequest struct {
	Player1    Hand `json:"Player1"`
	Player2    Hand `json:"Player2"`
	Board      Hand `json:"Board"`
	Iterations int  `json:"Iterations"`
}

type SimulationResult struct {
	Player1WinRate float64 `json:"player1WinPercentage"`
	Player2WinRate float64 `json:"player2WinPercentage"`
	TieRate        float64 `json:"tiePercentage"`
}

type Hand []Card

var ranks = "23456789TJQKA"
var suits = "hdcs"

// 2d,5hの場合、[0] [3]
// 2を加算することで、rankを表現する
func cardValue(c Card) int {
	return indexOfRank(ranks, c.Rank) + 2
}

func indexOfRank(s string, char string) int {
	for i, r := range s {
		if string(r) == char {
			return i
		}
	}
	return -1
}

// 手札を除く全カードを含むデッキ(Cardの集合)を作成する
func NewDeck(exclude Hand) []Card {
	deck := []Card{}
	for _, r := range ranks {
		for _, s := range suits {
			card := Card{Rank: string(r), Suit: string(s)}
			if !cardOnHand(exclude, card) {
				deck = append(deck, card)
			}
		}
	}
	return deck
}

func cardOnHand(hand Hand, card Card) bool {
	for _, c := range hand {
		if c == card {
			return true
		}
	}
	return false
}

func EvaluateHand(hand Hand) int64 {
	rankCount := make(map[int]int)
	suitCount := make(map[string]int)
	values := []int{}

	for _, card := range hand {
		val := cardValue(card)
		rankCount[val]++
		suitCount[card.Suit]++
		values = append(values, val)
	}

	// 値を降順にソート
	sort.Sort(sort.Reverse(sort.IntSlice(values)))

	isFlush := false
	for _, count := range suitCount {
		if count == 5 {
			isFlush = true
			break
		}
	}

	isStraight, highStraight := checkStraight(values)

	var score int64

	fourVal, fourOk := checkPairs(rankCount, 4)
	threeVal, threeOK := checkPairs(rankCount, 3)
	pairVal, pairOk := checkPairs(rankCount, 2)

	switch {
	case isStraight && isFlush:
		score = 8*1e10 + int64(highStraight)
	case fourOk:
		kicker := highestVal(values, []int{fourVal})
		score = 7*1e10 + int64(fourVal)*1e8 + int64(kicker)
	case threeOK:
		if pairVal, ok2 := checkPairs(rankCount, 2); ok2 {
			score = 6*1e10 + int64(threeVal)*1e8 + int64(pairVal)*1e6
		} else {
			kickers := filterVals(values, []int{threeVal})
			score = 3*1e10 + int64(threeVal)*1e8 + combineKickers(kickers, 2)
		}
	case len(twoPairValues(rankCount)) == 2:
		twoPairs := twoPairValues(rankCount)
		sort.Sort(sort.Reverse(sort.IntSlice(twoPairs)))
		kicker := highestVal(values, twoPairs)
		score = 2*1e10 + int64(twoPairs[0])*1e8 + int64(twoPairs[1])*1e6 + int64(kicker)
	case pairOk:
		kickers := filterVals(values, []int{pairVal})
		score = 1*1e10 + int64(pairVal)*1e8 + combineKickers(kickers, 3)
	case isFlush:
		score = 5*1e10 + combineKickers(values, 5)
	case isStraight:
		score = 4*1e10 + int64(highStraight)
	default:
		score = combineKickers(values, 5)
	}

	return score
}

// 重複排除された値が5つ & 値が連続しているスライスであればストレートと判定する
// A,5,4,3,2 のパターンでは、5を最高値とする
func checkStraight(vals []int) (bool, int) {
	uniq := uniqueInts(vals)
	sort.Sort(sort.Reverse(sort.IntSlice(uniq)))
	if len(uniq) < 5 {
		return false, 0
	}

	if uniq[0]-uniq[4] == 4 {
		return true, uniq[0]
	}

	if uniq[0] == 14 && len(uniq) >= 5 && uniq[1] == 5 && uniq[2] == 4 && uniq[3] == 3 && uniq[4] == 2 {
		return true, 5
	}
	return false, 0
}

// 重複排除されたintスライスを返す
func uniqueInts(vals []int) []int {
	m := make(map[int]bool)
	results := []int{}
	for _, v := range vals {
		if !m[v] {
			m[v] = true
			results = append(results, v)
		}
	}
	return results
}

// あるランクの出現数が指定された値の数と等しいか確認する
func checkPairs(rankCount map[int]int, count int) (int, bool) {
	for val, cnt := range rankCount {
		if cnt == count {
			return val, true
		}
	}
	return 0, false
}

// ペアとなるカードの値を返す
func twoPairValues(rankCount map[int]int) []int {
	pairs := []int{}
	for val, cnt := range rankCount {
		if cnt == 2 {
			pairs = append(pairs, val)
		}
	}
	return pairs
}

// 指定した値を除いた中で、最大の値を返す
func highestVal(vals []int, exclude []int) int {
	for _, v := range vals {
		if !intInSlice(v, exclude) {
			return v
		}
	}
	return 0
}

// 指定されたintスライスに特定の値が入っているか確認する
func intInSlice(val int, slice []int) bool {
	for _, v := range slice {
		if v == val {
			return true
		}
	}
	return false
}

// 指定した値を除外したintスライスを返す
func filterVals(vals []int, exclude []int) []int {
	result := []int{}
	for _, v := range vals {
		if !intInSlice(v, exclude) {
			result = append(result, v)
		}
	}
	return result
}

// キッカーの値を組み合わせて数値スコアに変換する
func combineKickers(kickers []int, count int) int64 {
	score := int64(0)
	for i := 0; i < count && i < len(kickers); i++ {
		score = score*100 + int64(kickers[i])
	}
	return score
}

func EvaluateBestHand(cards Hand) int64 {
	if len(cards) < 5 {
		panic("Not enough cards.")
	}
	best := int64(0)

	for _, comb := range combinations(cards, 5) {
		score := EvaluateHand(comb)
		if score > best {
			best = score
		}
	}
	return best
}

func combinations(cards Hand, n int) []Hand {
	var result []Hand
	var combHelper func(start int, curr Hand)
	combHelper = func(start int, curr Hand) {
		if len(curr) == n {
			tmp := make(Hand, n)
			copy(tmp, curr)
			result = append(result, tmp)
			return
		}
		for i := start; i < len(cards); i++ {
			combHelper(i+1, append(curr, cards[i]))
		}
	}
	combHelper(0, Hand{})
	return result
}

func MonteCarloSimulation(playerHand, opponentHand, board Hand, iterations int) (float64, float64, float64) {
	var playerWins, opponentWins, ties int64
	var wg sync.WaitGroup

	missingCards := 5 - len(board)
	if missingCards < 0 || missingCards > 5 {
		panic("Please specify 0 to 5 boards.")
	}

	numGoroutines := 4
	itersPerGo := iterations / numGoroutines

	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			known := append(append(Hand{}, playerHand...), opponentHand...)
			known = append(known, board...)
			deck := NewDeck(known)

			var localWins, localLosses, localTies int64
			for j := 0; j < itersPerGo; j++ {
				deckCopy := make([]Card, len(deck))
				copy(deckCopy, deck)
				rand.Shuffle(len(deckCopy), func(i, j int) {
					deckCopy[i], deckCopy[j] = deckCopy[j], deckCopy[i]
				})
				drawn := deckCopy[:missingCards]
				completeBoard := append(board, drawn...)

				playerBest := EvaluateBestHand(append(playerHand, completeBoard...))
				opponentBest := EvaluateBestHand(append(opponentHand, completeBoard...))
				if playerBest > opponentBest {
					localWins++
				} else if playerBest < opponentBest {
					localLosses++
				} else {
					localTies++
				}
			}
			atomic.AddInt64(&playerWins, localWins)
			atomic.AddInt64(&opponentWins, localLosses)
			atomic.AddInt64(&ties, localTies)
		}()
	}
	wg.Wait()
	total := float64(itersPerGo * numGoroutines)
	return float64(playerWins) / total, float64(opponentWins) / total, float64(ties) / total
}

func normalizeSuit(card Card) Card {
	switch card.Suit {
	case "❤︎":
		card.Suit = "h"
	case "♦️":
		card.Suit = "d"
	case "♣️":
		card.Suit = "c"
	case "♠️":
		card.Suit = "s"
	}
	return card
}

func normalizeHand(hand Hand) Hand {
	normalized := make(Hand, len(hand))
	for i, card := range hand {
		normalized[i] = normalizeSuit(card)
	}
	return normalized
}

func adjustDecimalPoint(value float64) float64 {
	return math.Round(value*100) / 100
}

func (c *CalculateService) CalculateWinProbability(req SimulationRequest) SimulationResult {
	playerHand := normalizeHand(req.Player1)
	opponentHand := normalizeHand(req.Player2)
	board := normalizeHand(req.Board)

	playerWinRate, opponentWinRate, tieRate := MonteCarloSimulation(playerHand, opponentHand, board, req.Iterations)

	return SimulationResult{
		Player1WinRate: adjustDecimalPoint(playerWinRate * 100),
		Player2WinRate: adjustDecimalPoint(opponentWinRate * 100),
		TieRate:        adjustDecimalPoint(tieRate * 100),
	}
}
