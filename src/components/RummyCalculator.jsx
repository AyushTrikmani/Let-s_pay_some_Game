import { useState } from 'react';

export default function RummyCalculator() {
    const [players, setPlayers] = useState([
        { id: 'rp1', name: 'Player 1', points: 0, status: 'Active', cards: [] },
        { id: 'rp2', name: 'Player 2', points: 20, status: 'First Drop', cards: [] },
        { id: 'rp3', name: 'Player 3', points: 40, status: 'Middle Drop', cards: [] }
    ]);

    const updatePoints = (id, pts, status = 'Custom') => {
        const capped = Math.min(80, Math.max(0, pts));
        setPlayers(players.map(p => p.id === id ? { ...p, points: capped, status } : p));
    };

    const addCardToPlayer = (id, value) => {
        setPlayers(players.map(p => {
            if (p.id === id) {
                const newCards = [...p.cards, value];
                const newSum = Math.min(80, newCards.reduce((a, b) => a + b, 0));
                return { ...p, cards: newCards, points: newSum, status: 'Ungrouped Cards' };
            }
            return p;
        }));
    };

    const clearPlayerCards = (id) => {
        setPlayers(players.map(p => p.id === id ? { ...p, cards: [], points: 0, status: 'Clean Show' } : p));
    };

    return (
        <div className="rummy-calc-container">
            <div className="rummy-calc-header">
                <div className="rummy-title-wrap">
                    <span className="card-badge">♠ Indian Rummy (13 Cards)</span>
                    <h3>Declare / Show Points Calculator</h3>
                </div>
                <p className="rummy-subtitle">
                    Count ungrouped cards when another player declares. Maximum penalty is capped at <strong>80 points</strong>.
                </p>
            </div>

            {/* Quick Drop Reference Banner */}
            <div className="rummy-presets-banner">
                <div className="rule-badge-item">
                    <span className="pill-badge">First Drop</span>
                    <strong>20 pts</strong>
                </div>
                <div className="rule-badge-item">
                    <span className="pill-badge">Middle Drop</span>
                    <strong>40 pts</strong>
                </div>
                <div className="rule-badge-item">
                    <span className="pill-badge">Full Count / Cap</span>
                    <strong>80 pts max</strong>
                </div>
                <div className="rule-badge-item">
                    <span className="pill-badge">A, K, Q, J, 10</span>
                    <strong>10 pts each</strong>
                </div>
                <div className="rule-badge-item">
                    <span className="pill-badge">Jokers</span>
                    <strong>0 pts</strong>
                </div>
            </div>

            {/* Players Calculation Cards */}
            <div className="rummy-players-grid">
                {players.map(player => (
                    <div className="rummy-player-card" key={player.id}>
                        <div className="rummy-card-top">
                            <h4>{player.name}</h4>
                            <span className="rummy-status-tag">{player.status}</span>
                        </div>

                        <div className="rummy-score-display">
                            <span className="rummy-pts-num">{player.points}</span>
                            <span className="rummy-pts-label">pts {player.points === 80 && '(Max Cap)'}</span>
                        </div>

                        {/* Quick Presets */}
                        <div className="rummy-quick-presets">
                            <button
                                className={`rummy-btn-preset ${player.points === 0 ? 'active' : ''}`}
                                onClick={() => updatePoints(player.id, 0, 'Winner / Valid Declare')}
                            >
                                0 (Win)
                            </button>
                            <button
                                className={`rummy-btn-preset ${player.points === 20 ? 'active' : ''}`}
                                onClick={() => updatePoints(player.id, 20, 'First Drop')}
                            >
                                20 (1st Drop)
                            </button>
                            <button
                                className={`rummy-btn-preset ${player.points === 40 ? 'active' : ''}`}
                                onClick={() => updatePoints(player.id, 40, 'Middle Drop')}
                            >
                                40 (Mid Drop)
                            </button>
                            <button
                                className={`rummy-btn-preset ${player.points === 80 ? 'active' : ''}`}
                                onClick={() => updatePoints(player.id, 80, 'Full Count (Max)')}
                            >
                                80 (Full)
                            </button>
                        </div>

                        {/* Interactive Card Adder */}
                        <div className="rummy-card-adder">
                            <span className="adder-label">Add Ungrouped Card:</span>
                            <div className="adder-buttons">
                                <button className="add-card-btn" onClick={() => addCardToPlayer(player.id, 10)}>
                                    +10 (A/K/Q/J/10)
                                </button>
                                {[2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <button
                                        key={num}
                                        className="add-card-btn mini"
                                        onClick={() => addCardToPlayer(player.id, num)}
                                    >
                                        +{num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Manual Slider / Input */}
                        <div className="rummy-manual-input">
                            <label>Fine Tune:</label>
                            <input
                                type="range"
                                min="0"
                                max="80"
                                value={player.points}
                                onChange={(e) => updatePoints(player.id, parseInt(e.target.value) || 0, 'Custom')}
                                className="rummy-slider"
                            />
                            <button className="clear-rummy-btn" onClick={() => clearPlayerCards(player.id)}>
                                Reset
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
