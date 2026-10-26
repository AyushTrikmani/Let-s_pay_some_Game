import { useState, useRef, useEffect } from 'react';
import { AVATAR_OPTIONS } from '../utils/CardUtils';

export default function Leaderboard({
    players,
    scores,
    lastGameDeltas = {},
    onAddPlayer,
    onUpdatePlayer,
    onDeletePlayer,
    onChangePlayerCount,
    gamesCount = 0
}) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newAvatar, setNewAvatar] = useState('🦊');

    // Inline editing state for player names
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editNameText, setEditNameText] = useState('');
    const editInputRef = useRef(null);

    // Avatar selector state
    const [avatarPickerPlayerId, setAvatarPickerPlayerId] = useState(null);

    // Sort players by score ascending: LOWEST TOTAL IS 1st (WINNER)
    const sorted = [...players].sort((a, b) => (scores[a.id] || 0) - (scores[b.id] || 0));

    useEffect(() => {
        if (editingPlayerId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingPlayerId]);

    const handleStartEdit = (player) => {
        setEditingPlayerId(player.id);
        setEditNameText(player.name);
        setAvatarPickerPlayerId(null);
    };

    const handleSaveEdit = (playerId) => {
        if (editNameText.trim()) {
            onUpdatePlayer(playerId, { name: editNameText.trim() });
        }
        setEditingPlayerId(null);
    };

    const handleCancelEdit = () => {
        setEditingPlayerId(null);
    };

    const handleSelectAvatar = (playerId, avatar) => {
        onUpdatePlayer(playerId, { avatar });
        setAvatarPickerPlayerId(null);
    };

    const handleQuickAdd = (e) => {
        e.preventDefault();
        const nextNum = players.length + 1;
        const nameToUse = newPlayerName.trim() || `Player ${nextNum}`;
        onAddPlayer(nameToUse, newAvatar, 0);
        setNewPlayerName('');
        setIsAddOpen(false);
    };

    const handlePresetClick = (count) => {
        if (gamesCount > 0) {
            const proceed = window.confirm(`Switching to ${count} players will reset current game history. Continue?`);
            if (!proceed) return;
        }
        onChangePlayerCount(count);
    };

    return (
        <div className="leaderboard-card">
            {/* Header */}
            <div className="leaderboard-header">
                <div className="leaderboard-title-group">
                    <div className="title-row">
                        <span className="trophy-icon">🏆</span>
                        <h3>Leaderboard</h3>
                    </div>
                    <span className="leaderboard-sub">Lowest score wins</span>
                </div>
                <div className="leaderboard-count-pill">
                    {players.length} Players
                </div>
            </div>

            {/* Quick Player Count Presets */}
            <div className="player-count-presets-bar">
                <span className="presets-label">Table:</span>
                <div className="preset-count-chips">
                    {[2, 3, 4, 5, 6, 7, 8].map(count => (
                        <button
                            key={count}
                            type="button"
                            className={`count-chip ${players.length === count ? 'active' : ''}`}
                            onClick={() => handlePresetClick(count)}
                            title={`Set to ${count} players`}
                            id={`quick-preset-${count}-players`}
                        >
                            {count}P
                        </button>
                    ))}
                </div>
            </div>

            {/* Minimalist Players Ranked List */}
            <div className="players-ranks-grid">
                {sorted.map((player, idx) => {
                    const score = scores[player.id] || 0;
                    const delta = lastGameDeltas[player.id];
                    const isLeading = idx === 0 && gamesCount > 0;
                    const isEditing = editingPlayerId === player.id;
                    const isPickingAvatar = avatarPickerPlayerId === player.id;

                    let rankClass = 'rank-other';
                    let rankDisplay = `${idx + 1}`;
                    if (idx === 0) {
                        rankClass = 'rank-1';
                        rankDisplay = '🥇';
                    } else if (idx === 1) {
                        rankClass = 'rank-2';
                        rankDisplay = '🥈';
                    } else if (idx === 2) {
                        rankClass = 'rank-3';
                        rankDisplay = '🥉';
                    }

                    return (
                        <div
                            key={player.id}
                            className={`player-rank-row ${isLeading ? 'is-leading' : ''}`}
                            id={`rank-card-${player.id}`}
                        >
                            {/* Rank Badge */}
                            <div className={`rank-indicator ${rankClass}`} title={`Rank ${idx + 1}`}>
                                <span>{rankDisplay}</span>
                            </div>

                            {/* Clickable Avatar to change emoji */}
                            <div className="rank-avatar-wrap">
                                <button
                                    type="button"
                                    className="rank-avatar-btn"
                                    onClick={() => setAvatarPickerPlayerId(isPickingAvatar ? null : player.id)}
                                    title="Click to change avatar icon"
                                >
                                    {player.avatar}
                                </button>

                                {/* Popup Avatar Picker */}
                                {isPickingAvatar && (
                                    <div className="avatar-mini-picker">
                                        <div className="avatar-picker-grid">
                                            {AVATAR_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    className={`avatar-opt-btn ${player.avatar === opt ? 'selected' : ''}`}
                                                    onClick={() => handleSelectAvatar(player.id, opt)}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Player Name - Editable */}
                            <div className="rank-name-box">
                                {isEditing ? (
                                    <div className="inline-edit-wrap">
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            className="inline-name-input"
                                            value={editNameText}
                                            onChange={(e) => setEditNameText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit(player.id);
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                            onBlur={() => handleSaveEdit(player.id)}
                                            maxLength={18}
                                        />
                                        <button
                                            type="button"
                                            className="inline-save-btn"
                                            onMouseDown={() => handleSaveEdit(player.id)}
                                            title="Save name"
                                        >
                                            <i className="fas fa-check"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="name-display-wrap">
                                        <span
                                            className="player-name-text"
                                            onClick={() => handleStartEdit(player)}
                                            title="Click to rename player"
                                        >
                                            {player.name}
                                        </span>
                                        <button
                                            type="button"
                                            className="player-edit-pencil"
                                            onClick={() => handleStartEdit(player)}
                                            title="Rename player"
                                        >
                                            <i className="fas fa-pen"></i>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Score & Delta */}
                            <div className="rank-score-cell">
                                <div className="score-number-group">
                                    <span className="rank-total-score">{score}</span>
                                    <span className="pts-suffix">pts</span>
                                </div>
                                {delta !== undefined && (
                                    <span className={`delta-tag ${delta === 0 ? 'delta-zero' : 'delta-plus'}`} title={`Last round change: ${delta >= 0 ? `+${delta}` : delta}`}>
                                        {delta === 0 ? '0' : `+${delta}`}
                                    </span>
                                )}
                            </div>

                            {/* Optional remove player if > 2 */}
                            {players.length > 2 && onDeletePlayer && (
                                <button
                                    type="button"
                                    className="player-remove-btn"
                                    onClick={() => onDeletePlayer(player.id)}
                                    title={`Remove ${player.name}`}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick Add Player (Simple & Compact) */}
            {players.length < 10 && (
                <div className="add-player-wrapper">
                    {!isAddOpen ? (
                        <button
                            type="button"
                            className="quick-add-btn"
                            onClick={() => {
                                setNewPlayerName(`Player ${players.length + 1}`);
                                setIsAddOpen(true);
                            }}
                            id="quick-add-player-btn"
                        >
                            <i className="fas fa-plus"></i> Add Player
                        </button>
                    ) : (
                        <form className="quick-add-form" onSubmit={handleQuickAdd}>
                            <div className="quick-add-inputs-row">
                                <select
                                    value={newAvatar}
                                    onChange={(e) => setNewAvatar(e.target.value)}
                                    className="quick-avatar-select"
                                    title="Choose Avatar"
                                >
                                    {AVATAR_OPTIONS.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="quick-name-input"
                                    placeholder={`Player ${players.length + 1}`}
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    autoFocus
                                    maxLength={16}
                                />
                            </div>
                            <div className="quick-add-actions-row">
                                <button
                                    type="button"
                                    className="quick-cancel-btn"
                                    onClick={() => setIsAddOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="quick-confirm-btn"
                                    id="confirm-add-player-btn"
                                >
                                    <i className="fas fa-plus"></i> Add Player
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
