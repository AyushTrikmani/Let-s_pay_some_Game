// Card definitions, scoring helpers, and presets for Declare / Least Count

export const CARD_RANKS = [
    { rank: 'A', name: 'Ace', basePoints: 1 },
    { rank: '2', name: '2', basePoints: 2 },
    { rank: '3', name: '3', basePoints: 3 },
    { rank: '4', name: '4', basePoints: 4 },
    { rank: '5', name: '5', basePoints: 5 },
    { rank: '6', name: '6', basePoints: 6 },
    { rank: '7', name: '7', basePoints: 7 },
    { rank: '8', name: '8', basePoints: 8 },
    { rank: '9', name: '9', basePoints: 9 },
    { rank: '10', name: '10', basePoints: 10 },
    { rank: 'J', name: 'Jack', basePoints: 10, facePoints: 11 },
    { rank: 'Q', name: 'Queen', basePoints: 10, facePoints: 12 },
    { rank: 'K', name: 'King', basePoints: 10, facePoints: 13 },
    { rank: '★', name: 'Joker', basePoints: 0, isJoker: true }
];

export const SUITS = [
    { symbol: '♠', name: 'Spades', color: 'black' },
    { symbol: '♥', name: 'Hearts', color: 'red' },
    { symbol: '♦', name: 'Diamonds', color: 'red' },
    { symbol: '♣', name: 'Clubs', color: 'black' }
];

export const DEFAULT_RULES = {
    targetLimit: 100, // 50, 100, 150, 200, 250, etc.
    declareThreshold: 7, // Max hand points allowed to declare (e.g. <= 7, <= 5, <= 10)
    penaltyType: 'double', // 'double' (2x hand), 'fixed40', 'fixed50', 'fixed80', 'handPlus25'
    sevenIsZero: false, // Optional Indian hostel house rule: 7 counts as 0 pts
    faceCardStrict: false, // If true, J=11, Q=12, K=13. If false, J=Q=K=10
    allowBuyIn: true // Allow eliminated players to buy back in with highest score + 1
};

export const DEFAULT_PLAYERS = [
    { id: 'p1', name: 'Player 1', avatar: '🦁', color: '#e07a3f' },
    { id: 'p2', name: 'Player 2', avatar: '⚡', color: '#3b82f6' },
    { id: 'p3', name: 'Player 3', avatar: '🎯', color: '#10b981' },
    { id: 'p4', name: 'Player 4', avatar: '🌸', color: '#ec4899' }
];

export const AVATAR_OPTIONS = ['🦁', '⚡', '🎯', '🌸', '🦊', '🚀', '👑', '🔥', '🃏', '💎', '🐺', '🍀', '🏆', '⭐', '🐯', '🦅'];

export function generatePlayersPreset(count) {
    const defaultNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];
    const colors = ['#e07a3f', '#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#ef4444', '#14b8a6'];
    const players = [];
    for (let i = 0; i < count; i++) {
        players.push({
            id: `p${i + 1}`,
            name: defaultNames[i] || `Player ${i + 1}`,
            avatar: AVATAR_OPTIONS[i % AVATAR_OPTIONS.length],
            color: colors[i % colors.length]
        });
    }
    return players;
}

export function calculateCardPoints(card, rules) {
    if (card.isJoker || card.rank === '★') return 0;
    if (rules.sevenIsZero && card.rank === '7') return 0;
    if (rules.faceCardStrict) {
        if (card.rank === 'J') return 11;
        if (card.rank === 'Q') return 12;
        if (card.rank === 'K') return 13;
    } else {
        if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    }
    if (card.rank === 'A') return 1;
    const num = parseInt(card.rank, 10);
    return isNaN(num) ? 0 : num;
}

export function calculateHandTotal(cards, rules) {
    if (!cards || !Array.isArray(cards)) return 0;
    return cards.reduce((sum, card) => sum + calculateCardPoints(card, rules), 0);
}

/**
 * Evaluates the declare round outcome.
 */
export function evaluateRound(declarerId, roundHandPoints, rules) {
    const declarerPoints = roundHandPoints[declarerId] ?? 0;
    const playerIds = Object.keys(roundHandPoints);

    // Find any players who had points <= declarer (excluding declarer)
    const catchers = playerIds.filter(pid => pid !== declarerId && roundHandPoints[pid] <= declarerPoints);
    const isSuccess = catchers.length === 0;

    const pointsAwarded = {};

    if (isSuccess) {
        // Declarer gets 0! Everyone else gets their hand points.
        pointsAwarded[declarerId] = 0;
        playerIds.forEach(pid => {
            if (pid !== declarerId) {
                pointsAwarded[pid] = roundHandPoints[pid];
            }
        });

        return {
            isSuccess: true,
            catchers: [],
            declarerPenalty: 0,
            pointsAwarded,
            summaryText: `Successful Declare! Declarer won with ${declarerPoints} pts (awarded 0 pts). Other players take hand points.`
        };
    } else {
        // Declarer was CAUGHT / BUST!
        // The catcher(s) who had the lowest points get 0 points!
        const otherScores = playerIds.filter(pid => pid !== declarerId).map(pid => roundHandPoints[pid]);
        const minPoints = Math.min(...otherScores);
        const absoluteLowestPlayers = playerIds.filter(pid => pid !== declarerId && roundHandPoints[pid] === minPoints);

        // Calculate penalty for declarer
        let penalty = 0;
        switch (rules.penaltyType) {
            case 'double':
                penalty = declarerPoints * 2;
                break;
            case 'fixed40':
                penalty = 40;
                break;
            case 'fixed50':
                penalty = 50;
                break;
            case 'fixed80':
                penalty = 80;
                break;
            case 'handPlus25':
                penalty = declarerPoints + 25;
                break;
            default:
                penalty = declarerPoints * 2;
        }

        // Failed declarer gets penalty
        pointsAwarded[declarerId] = penalty;

        // Player(s) with minimum points get 0
        absoluteLowestPlayers.forEach(pid => {
            pointsAwarded[pid] = 0;
        });

        // Other non-lowest players get their hand points
        playerIds.forEach(pid => {
            if (pid !== declarerId && !absoluteLowestPlayers.includes(pid)) {
                pointsAwarded[pid] = roundHandPoints[pid];
            }
        });

        return {
            isSuccess: false,
            catchers: absoluteLowestPlayers,
            declarerPenalty: penalty,
            pointsAwarded,
            summaryText: `WRONG DECLARE (BUST)! Declarer caught with ${declarerPoints} pts! Catcher(s) had ${minPoints} pts (awarded 0). Declarer takes penalty of ${penalty} pts.`
        };
    }
}
