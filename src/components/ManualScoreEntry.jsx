import { useState, useEffect } from 'react';

export default function ManualScoreEntry({
    nextGameNumber,
    players,
    onAddGame,
    onUpdatePlayer
}) {
    // Points per player: { [pid]: number }
    const [points, setPoints] = useState(() => {
        const init = {};
        players.forEach(p => { init[p.id] = 0; });
        return init;
    });

    const [gameLabel, setGameLabel] = useState(`Game #${nextGameNumber}`);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editNameText, setEditNameText] = useState('');

    // Update state if players roster changes or gameNumber updates
    useEffect(() => {
        setPoints(prev => {
            const next = { ...prev };
            players.forEach(p => {
                if (next[p.id] === undefined) {
                    next[p.id] = 0;
                }
            });
            return next;
        });
        setGameLabel(`Game #${nextGameNumber}`);
    }, [players, nextGameNumber]);

    const handlePointChange = (pid, val) => {
        if (val === '') {
            setPoints(prev => ({ ...prev, [pid]: '' }));
            return;
        }
        const num = parseInt(val, 10);
        setPoints(prev => ({ ...prev, [pid]: isNaN(num) ? 0 : Math.max(0, num) }));
    };

    const handleAdjust = (pid, delta) => {
        setPoints(prev => {
            const current = typeof prev[pid] === 'number' ? prev[pid] : parseInt(prev[pid], 10) || 0;
            return {
                ...prev,
                [pid]: Math.max(0, current + delta)
            };
        });
    };

    const handleSetZero = (pid) => {
        setPoints(prev => ({ ...prev, [pid]: 0 }));
    };

    const handleClearRound = () => {
        const reset = {};
        players.forEach(p => { reset[p.id] = 0; });
        setPoints(reset);
    };

    // Calculate who has the lowest score in this current round
    const numericPoints = {};
    players.forEach(p => {
        numericPoints[p.id] = typeof points[p.id] === 'number' ? points[p.id] : parseInt(points[p.id], 10) || 0;
    });

    const lowestScore = Math.min(...players.map(p => numericPoints[p.id] ?? 0));
    const lowestPlayers = players.filter(p => (numericPoints[p.id] ?? 0) === lowestScore);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddGame({
            gameNumber: nextGameNumber,
            label: gameLabel,
            points: { ...numericPoints },
            lowestPlayers: lowestPlayers.map(p => p.id),
            lowestScore,
            timestamp: Date.now()
        });

        // Reset points for the next game
        const reset = {};
        players.forEach(p => { reset[p.id] = 0; });
        setPoints(reset);
    };

    const handleStartNameEdit = (player) => {
        setEditingPlayerId(player.id);
        setEditNameText(player.name);
    };

    const handleSaveNameEdit = (playerId) => {
        if (editNameText.trim() && onUpdatePlayer) {
            onUpdatePlayer(playerId, { name: editNameText.trim() });
        }
        setEditingPlayerId(null);
    };

    return (
        <div className="manual-entry-card">
            {/* Minimalist Header */}
            <div className="manual-entry-header">
                <div className="entry-title-wrap">
                    <span className="entry-round-pill">Round {nextGameNumber}</span>
                    <input
                        type="text"
                        className="entry-label-input"
                        value={gameLabel}
                        onChange={(e) => setGameLabel(e.target.value)}
                        placeholder={`Game #${nextGameNumber}`}
                        title="Edit round name"
                    />
                </div>

                <div className="entry-header-actions">
                    <button
                        type="button"
                        className="entry-clear-btn"
                        onClick={handleClearRound}
                        title="Reset inputs to 0"
                    >
                        <i className="fas fa-undo"></i> Clear
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Minimalist Player Score Cards */}
                <div className="manual-players-list">
                    {players.map(player => {
                        const val = points[player.id] !== undefined ? points[player.id] : 0;
                        const numVal = numericPoints[player.id];
                        const isZero = numVal === 0;
                        const isLowest = numVal === lowestScore;
                        const isEditingName = editingPlayerId === player.id;

                        return (
                            <div
                                key={player.id}
                                className={`entry-player-row ${isZero ? 'row-winner' : ''} ${isLowest && !isZero ? 'row-lowest' : ''}`}
                            >
                                {/* Player Info / Editable Name */}
                                <div className="entry-player-identity">
                                    <span className="entry-player-avatar">{player.avatar}</span>
                                    {isEditingName ? (
                                        <div className="entry-inline-edit">
                                            <input
                                                type="text"
                                                className="entry-name-input-field"
                                                value={editNameText}
                                                onChange={(e) => setEditNameText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveNameEdit(player.id);
                                                    if (e.key === 'Escape') setEditingPlayerId(null);
                                                }}
                                                onBlur={() => handleSaveNameEdit(player.id)}
                                                autoFocus
                                                maxLength={18}
                                            />
                                            <button
                                                type="button"
                                                className="entry-name-save-btn"
                                                onMouseDown={() => handleSaveNameEdit(player.id)}
                                            >
                                                <i className="fas fa-check"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="entry-name-group">
                                            <span
                                                className="entry-player-name"
                                                onClick={() => handleStartNameEdit(player)}
                                                title="Click to rename"
                                            >
                                                {player.name}
                                            </span>
                                            <button
                                                type="button"
                                                className="entry-name-pencil"
                                                onClick={() => handleStartNameEdit(player)}
                                                title="Rename player"
                                            >
                                                <i className="fas fa-pen"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Quick "Winner / 0 pts" button */}
                                <button
                                    type="button"
                                    className={`entry-zero-btn ${isZero ? 'is-zero-active' : ''}`}
                                    onClick={() => handleSetZero(player.id)}
                                    title="Declare / Winner (0 points)"
                                >
                                    {isZero ? '✓ Winner (0)' : '0 pts'}
                                </button>

                                {/* Stepper & Direct Score Input */}
                                <div className="entry-score-control">
                                    <button
                                        type="button"
                                        className="entry-step-btn"
                                        onClick={() => handleAdjust(player.id, -1)}
                                        title="Decrease 1"
                                    >
                                        &minus;
                                    </button>

                                    <div className="entry-input-box">
                                        <input
                                            type="number"
                                            className="entry-num-field"
                                            value={val}
                                            onChange={(e) => handlePointChange(player.id, e.target.value)}
                                            min="0"
                                            max="500"
                                            id={`manual-input-${player.id}`}
                                        />
                                        <span className="entry-pts-unit">pts</span>
                                    </div>

                                    <button
                                        type="button"
                                        className="entry-step-btn"
                                        onClick={() => handleAdjust(player.id, 1)}
                                        title="Increase 1"
                                    >
                                        +
                                    </button>

                                    {/* Quick +5 & +10 pills */}
                                    <div className="entry-quick-adds">
                                        <button
                                            type="button"
                                            className="entry-quick-pill"
                                            onClick={() => handleAdjust(player.id, 5)}
                                            title="Add 5 points"
                                        >
                                            +5
                                        </button>
                                        <button
                                            type="button"
                                            className="entry-quick-pill"
                                            onClick={() => handleAdjust(player.id, 10)}
                                            title="Add 10 points"
                                        >
                                            +10
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Minimalist Bottom Bar: Round Summary & Save Button */}
                <div className="manual-footer-row">
                    <div className="manual-round-summary">
                        <span className="summary-crown">👑</span>
                        <span className="summary-text">
                            Round Leader:{' '}
                            <strong>
                                {lowestPlayers.map(p => p.name).join(', ')} ({lowestScore} pts)
                            </strong>
                        </span>
                    </div>

                    <button type="submit" className="manual-save-btn" id="submit-manual-game-btn">
                        <i className="fas fa-check-circle"></i> Save Round Scores
                    </button>
                </div>
            </form>
        </div>
    );
}
