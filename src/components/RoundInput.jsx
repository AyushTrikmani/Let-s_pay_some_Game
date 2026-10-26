import { useState, useEffect } from 'react';
import CardPickerModal from './CardPickerModal';
import { evaluateRound } from '../utils/CardUtils';

export default function RoundInput({
    roundNumber,
    players,
    eliminated,
    rules,
    onSubmitRound,
    onOpenRules
}) {
    const activePlayers = players.filter(p => !eliminated.includes(p.id));
    const [declarerId, setDeclarerId] = useState(activePlayers[0]?.id || '');
    
    // Store hand points per player: { [pid]: number }
    const [points, setPoints] = useState(() => {
        const initial = {};
        activePlayers.forEach(p => { initial[p.id] = 5; });
        return initial;
    });

    // Store cards per player: { [pid]: Array }
    const [playerHands, setPlayerHands] = useState({});

    // Card Picker Modal state
    const [cardPickerTarget, setCardPickerTarget] = useState(null);

    // Keep points and declarer synchronized whenever players or table size changes
    useEffect(() => {
        setPoints(prev => {
            const next = { ...prev };
            activePlayers.forEach(p => {
                if (next[p.id] === undefined) {
                    next[p.id] = 5;
                }
            });
            return next;
        });

        if (!activePlayers.some(p => p.id === declarerId)) {
            setDeclarerId(activePlayers[0]?.id || '');
        }
    }, [players, eliminated]);

    const handlePointChange = (pid, val) => {
        const num = Math.max(0, parseInt(val, 10) || 0);
        setPoints(prev => ({ ...prev, [pid]: num }));
    };

    const handleAdjustPoint = (pid, delta) => {
        setPoints(prev => ({
            ...prev,
            [pid]: Math.max(0, (prev[pid] || 0) + delta)
        }));
    };

    const handleSaveHandCards = (cards, totalPts) => {
        if (!cardPickerTarget) return;
        const pid = cardPickerTarget.id;
        setPlayerHands(prev => ({ ...prev, [pid]: cards }));
        setPoints(prev => ({ ...prev, [pid]: totalPts }));
    };

    // Evaluate live prediction
    const currentEvaluation = declarerId
        ? evaluateRound(declarerId, points, rules)
        : null;

    const declarerPlayer = players.find(p => p.id === declarerId);
    const declarerPoints = points[declarerId] ?? 0;
    const isExceedingThreshold = declarerPoints > rules.declareThreshold;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!declarerId) {
            alert('Please select which player declared!');
            return;
        }

        if (isExceedingThreshold) {
            const proceed = window.confirm(
                `Note: ${declarerPlayer?.name}'s hand has ${declarerPoints} points, which exceeds the declare threshold of ≤ ${rules.declareThreshold} points. Do you want to submit anyway?`
            );
            if (!proceed) return;
        }

        onSubmitRound({
            roundNumber,
            declarerId,
            rawPoints: { ...points },
            playerHands: { ...playerHands },
            evaluation: currentEvaluation
        });

        // Reset points to defaults for next round
        const resetPts = {};
        activePlayers.forEach(p => { resetPts[p.id] = 5; });
        setPoints(resetPts);
        setPlayerHands({});
    };

    return (
        <div className="round-input-card">
            <div className="round-input-header">
                <div className="round-badge-group">
                    <span className="round-tag">Round #{roundNumber}</span>
                    <h3>Record Round Scores</h3>
                </div>
                <button className="help-rules-link" onClick={onOpenRules} type="button" title="View Game Rules">
                    <i className="fas fa-question-circle"></i> House Rules (≤ {rules.declareThreshold} pts)
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Who Declared? */}
                <div className="form-section">
                    <label className="section-instruction">
                        <strong>Step 1:</strong> Who called &quot;Declare&quot;?
                    </label>
                    <div className="declarer-chips-row">
                        {activePlayers.map(player => (
                            <button
                                key={player.id}
                                type="button"
                                className={`declarer-chip ${declarerId === player.id ? 'active' : ''}`}
                                onClick={() => setDeclarerId(player.id)}
                                id={`declare-chip-${player.id}`}
                            >
                                <span className="chip-avatar">{player.avatar}</span>
                                <span className="chip-name">{player.name}</span>
                                {declarerId === player.id && (
                                    <span className="chip-check"><i className="fas fa-bullhorn"></i></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Enter Hand Points for Each Player */}
                <div className="form-section">
                    <label className="section-instruction">
                        <strong>Step 2:</strong> Enter card points remaining in each player&apos;s hand:
                    </label>

                    <div className="player-input-grid">
                        {activePlayers.map(player => {
                            const isDeclarer = player.id === declarerId;
                            const pts = points[player.id] ?? 0;
                            const cards = playerHands[player.id] || [];

                            return (
                                <div
                                    key={player.id}
                                    className={`player-score-entry-card ${isDeclarer ? 'entry-declarer' : ''}`}
                                    id={`score-entry-${player.id}`}
                                >
                                    <div className="entry-top">
                                        <div className="entry-user-info">
                                            <span className="entry-avatar">{player.avatar}</span>
                                            <div>
                                                <span className="entry-name">{player.name}</span>
                                                {isDeclarer && (
                                                    <span className="declarer-pill-small">
                                                        <i className="fas fa-bullhorn"></i> Declarer
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Visual Card Picker Launcher */}
                                        <button
                                            type="button"
                                            className="card-picker-launch-btn"
                                            onClick={() => setCardPickerTarget(player)}
                                            title="Open visual card deck calculator"
                                            id={`card-picker-btn-${player.id}`}
                                        >
                                            <i className="fas fa-layer-group"></i> Pick Cards {cards.length > 0 && `(${cards.length})`}
                                        </button>
                                    </div>

                                    {/* Selected Cards Mini Preview if any */}
                                    {cards.length > 0 && (
                                        <div className="mini-cards-preview">
                                            {cards.map((c, idx) => (
                                                <span key={idx} className="preview-card-chip">
                                                    {c.rank}{c.isJoker ? '' : c.suit}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Numeric controls */}
                                    <div className="numeric-controls-row">
                                        <div className="quick-btn-group">
                                            <button
                                                type="button"
                                                className="quick-adjust-btn"
                                                onClick={() => handleAdjustPoint(player.id, -5)}
                                                title="Subtract 5"
                                            >
                                                -5
                                            </button>
                                            <button
                                                type="button"
                                                className="quick-adjust-btn"
                                                onClick={() => handleAdjustPoint(player.id, -1)}
                                                title="Subtract 1"
                                            >
                                                -1
                                            </button>
                                        </div>

                                        <div className="points-input-wrapper">
                                            <input
                                                type="number"
                                                min="0"
                                                max="120"
                                                value={pts}
                                                onChange={(e) => handlePointChange(player.id, e.target.value)}
                                                className="points-number-input"
                                                id={`pts-input-${player.id}`}
                                            />
                                            <span className="pts-suffix">pts</span>
                                        </div>

                                        <div className="quick-btn-group">
                                            <button
                                                type="button"
                                                className="quick-adjust-btn"
                                                onClick={() => handleAdjustPoint(player.id, 1)}
                                                title="Add 1"
                                            >
                                                +1
                                            </button>
                                            <button
                                                type="button"
                                                className="quick-adjust-btn"
                                                onClick={() => handleAdjustPoint(player.id, 5)}
                                                title="Add 5"
                                            >
                                                +5
                                            </button>
                                            <button
                                                type="button"
                                                className="quick-zero-btn"
                                                onClick={() => handlePointChange(player.id, 0)}
                                                title="Set to 0"
                                            >
                                                0
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live Prediction Verdict Box */}
                {currentEvaluation && declarerPlayer && (
                    <div className={`verdict-preview-box ${currentEvaluation.isSuccess ? 'verdict-success' : 'verdict-caught'}`}>
                        <div className="verdict-icon">
                            {currentEvaluation.isSuccess ? '🎉' : '🚨'}
                        </div>
                        <div className="verdict-content">
                            <h4>
                                {currentEvaluation.isSuccess ? 'SUCCESSFUL DECLARE!' : 'WRONG DECLARE (BUST / CAUGHT)!'}
                            </h4>
                            <p>{currentEvaluation.summaryText}</p>
                            
                            {/* Breakdown */}
                            <div className="verdict-breakdown-pills">
                                {activePlayers.map(p => {
                                    const awarded = currentEvaluation.pointsAwarded[p.id];
                                    return (
                                        <span key={p.id} className={`verdict-pill ${awarded === 0 ? 'pill-zero' : 'pill-pts'}`}>
                                            {p.name}: <strong>+{awarded} pts</strong>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Action */}
                <div className="round-submit-row">
                    <button type="submit" className="submit-round-btn" id="submit-round-btn">
                        <i className="fas fa-check-circle"></i> Submit Round #{roundNumber} Points
                    </button>
                </div>
            </form>

            {/* Visual Card Picker Modal */}
            {cardPickerTarget && (
                <CardPickerModal
                    isOpen={!!cardPickerTarget}
                    onClose={() => setCardPickerTarget(null)}
                    playerName={cardPickerTarget.name}
                    initialCards={playerHands[cardPickerTarget.id] || []}
                    onSaveHand={handleSaveHandCards}
                    rules={rules}
                />
            )}
        </div>
    );
}
