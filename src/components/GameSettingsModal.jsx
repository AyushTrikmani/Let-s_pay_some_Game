import { useState } from 'react';
import { AVATAR_OPTIONS, generatePlayersPreset } from '../utils/CardUtils';

export default function GameSettingsModal({
    isOpen,
    onClose,
    rules,
    onSaveRules,
    players,
    onSavePlayers,
    gameStarted
}) {
    const [localRules, setLocalRules] = useState({ ...rules });
    const [localPlayers, setLocalPlayers] = useState([...players]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerAvatar, setNewPlayerAvatar] = useState('🦊');

    if (!isOpen) return null;

    const handleAddPlayer = (e) => {
        e.preventDefault();
        const trimmed = newPlayerName.trim();
        const nextNum = localPlayers.length + 1;
        const nameToUse = trimmed || `Player ${nextNum}`;
        if (localPlayers.length >= 10) {
            alert('Maximum 10 players supported!');
            return;
        }

        const newP = {
            id: `p_${Date.now()}`,
            name: nameToUse,
            avatar: newPlayerAvatar,
            color: '#e07a3f'
        };

        setLocalPlayers([...localPlayers, newP]);
        setNewPlayerName('');
    };

    const handleApplyPresetCount = (count) => {
        if (gameStarted) {
            const proceed = window.confirm(`Applying ${count} players will reset current player roster. Continue?`);
            if (!proceed) return;
        }
        setLocalPlayers(generatePlayersPreset(count));
    };

    const handleRemovePlayer = (id) => {
        if (localPlayers.length <= 2) {
            alert('A minimum of 2 players is required!');
            return;
        }
        setLocalPlayers(localPlayers.filter(p => p.id !== id));
    };

    const handleUpdatePlayerName = (id, newName) => {
        setLocalPlayers(localPlayers.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    const handleSave = () => {
        onSaveRules(localRules);
        onSavePlayers(localPlayers);
        onClose();
    };

    return (
        <div className="declare-modal-overlay" onClick={onClose}>
            <div className="declare-modal-box settings-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <span className="card-badge">⚙️ Custom House Rules</span>
                        <h3>Game Settings & Players</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} id="close-settings-modal-btn">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="settings-body-scroll">
                    {/* Players Management Section */}
                    <div className="settings-section">
                        <div className="section-title-between">
                            <h4 className="settings-sec-title">
                                <i className="fas fa-users"></i> Table Players ({localPlayers.length}/10)
                            </h4>
                            <span className="player-count-badge">{localPlayers.length} Active</span>
                        </div>

                        {/* Quick Count Preset Selector */}
                        <div className="quick-player-presets-row">
                            <span className="quick-presets-label">Quick Player Count:</span>
                            <div className="preset-buttons-row">
                                {[2, 3, 4, 5, 6, 7, 8].map(count => (
                                    <button
                                        key={count}
                                        type="button"
                                        className={`preset-btn ${localPlayers.length === count ? 'active' : ''} ${count === 5 ? 'highlight-btn' : ''}`}
                                        onClick={() => handleApplyPresetCount(count)}
                                        id={`settings-preset-${count}-players`}
                                    >
                                        {count} Players {count === 5 && '⭐'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Player List */}
                        <div className="players-config-list">
                            {localPlayers.map((player) => (
                                <div className="player-config-row" key={player.id}>
                                    <span className="player-config-avatar">{player.avatar}</span>
                                    <input
                                        type="text"
                                        className="player-config-name-input"
                                        value={player.name}
                                        onChange={(e) => handleUpdatePlayerName(player.id, e.target.value)}
                                        placeholder="Player name"
                                        maxLength={16}
                                        id={`player-name-input-${player.id}`}
                                    />
                                    {localPlayers.length > 2 && (
                                        <button
                                            className="remove-player-btn"
                                            onClick={() => handleRemovePlayer(player.id)}
                                            title="Remove player"
                                            id={`remove-player-btn-${player.id}`}
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Player Form */}
                        {localPlayers.length < 10 && (
                            <form className="add-player-form" onSubmit={handleAddPlayer}>
                                <div className="avatar-mini-picker">
                                    <select
                                        value={newPlayerAvatar}
                                        onChange={(e) => setNewPlayerAvatar(e.target.value)}
                                        className="avatar-select"
                                        id="new-player-avatar-select"
                                    >
                                        {AVATAR_OPTIONS.map(a => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    className="add-player-input"
                                    placeholder={`e.g. Player ${localPlayers.length + 1}`}
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    maxLength={16}
                                    id="new-player-name-input"
                                />
                                <button type="submit" className="add-player-btn" id="add-player-submit-btn">
                                    <i className="fas fa-plus"></i> + Add Player {localPlayers.length + 1}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Elimination Target Limit */}
                    <div className="settings-section">
                        <h4 className="settings-sec-title">
                            <i className="fas fa-flag-checkered"></i> Elimination Target Score
                        </h4>
                        <p className="settings-desc">Players who reach or exceed this score are eliminated (lowest points wins).</p>
                        <div className="preset-buttons-row">
                            {[50, 100, 150, 200, 250].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    className={`preset-btn ${localRules.targetLimit === val ? 'active' : ''}`}
                                    onClick={() => setLocalRules({ ...localRules, targetLimit: val })}
                                    id={`limit-preset-${val}`}
                                >
                                    {val} pts
                                </button>
                            ))}
                        </div>
                        <div className="custom-input-group">
                            <label htmlFor="custom-target-input">Custom Target:</label>
                            <input
                                id="custom-target-input"
                                type="number"
                                min="20"
                                max="1000"
                                value={localRules.targetLimit}
                                onChange={(e) => setLocalRules({ ...localRules, targetLimit: Math.max(10, parseInt(e.target.value) || 100) })}
                                className="custom-number-input"
                            />
                        </div>
                    </div>

                    {/* Declare Threshold */}
                    <div className="settings-section">
                        <h4 className="settings-sec-title">
                            <i className="fas fa-bullhorn"></i> Declare Threshold (Max Points to Declare)
                        </h4>
                        <p className="settings-desc">A player may only say &quot;Declare&quot; if their hand points are less than or equal to this limit.</p>
                        <div className="preset-buttons-row">
                            {[5, 7, 10, 15].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    className={`preset-btn ${localRules.declareThreshold === val ? 'active' : ''}`}
                                    onClick={() => setLocalRules({ ...localRules, declareThreshold: val })}
                                    id={`threshold-preset-${val}`}
                                >
                                    ≤ {val} pts
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Penalty on Wrong Declare */}
                    <div className="settings-section">
                        <h4 className="settings-sec-title">
                            <i className="fas fa-gavel"></i> Penalty for Wrong Declare (Bust)
                        </h4>
                        <p className="settings-desc">When a player declares but another player has an equal or lower hand score:</p>
                        <div className="radio-options-grid">
                            <label className={`radio-card ${localRules.penaltyType === 'double' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="penaltyType"
                                    value="double"
                                    checked={localRules.penaltyType === 'double'}
                                    onChange={() => setLocalRules({ ...localRules, penaltyType: 'double' })}
                                />
                                <div className="radio-content">
                                    <strong>Double Hand Points (2x)</strong>
                                    <span>Most popular. If declared with 6 pts, penalized with 12 pts.</span>
                                </div>
                            </label>

                            <label className={`radio-card ${localRules.penaltyType === 'fixed40' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="penaltyType"
                                    value="fixed40"
                                    checked={localRules.penaltyType === 'fixed40'}
                                    onChange={() => setLocalRules({ ...localRules, penaltyType: 'fixed40' })}
                                />
                                <div className="radio-content">
                                    <strong>Fixed 40 Points</strong>
                                    <span>Standard tournament penalty for a failed declaration.</span>
                                </div>
                            </label>

                            <label className={`radio-card ${localRules.penaltyType === 'fixed50' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="penaltyType"
                                    value="fixed50"
                                    checked={localRules.penaltyType === 'fixed50'}
                                    onChange={() => setLocalRules({ ...localRules, penaltyType: 'fixed50' })}
                                />
                                <div className="radio-content">
                                    <strong>Fixed 50 Points</strong>
                                    <span>Heavy penalty for reckless declarations.</span>
                                </div>
                            </label>

                            <label className={`radio-card ${localRules.penaltyType === 'handPlus25' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="penaltyType"
                                    value="handPlus25"
                                    checked={localRules.penaltyType === 'handPlus25'}
                                    onChange={() => setLocalRules({ ...localRules, penaltyType: 'handPlus25' })}
                                />
                                <div className="radio-content">
                                    <strong>Hand + 25 Points</strong>
                                    <span>Hand points plus an additional 25 point fine.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Special House Rules Toggles */}
                    <div className="settings-section">
                        <h4 className="settings-sec-title">
                            <i className="fas fa-magic"></i> Regional & House Rules
                        </h4>
                        
                        <div className="toggle-row">
                            <div className="toggle-text">
                                <strong>&quot;7 is Zero&quot; Rule</strong>
                                <span>All number 7 cards count as 0 points (Popular Indian hostel variation)</span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={localRules.sevenIsZero}
                                    onChange={(e) => setLocalRules({ ...localRules, sevenIsZero: e.target.checked })}
                                    id="seven-zero-toggle"
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="toggle-row">
                            <div className="toggle-text">
                                <strong>Strict Face Cards (J=11, Q=12, K=13)</strong>
                                <span>Default is 10 points each for J, Q, K. Enable for strictly graded face cards.</span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={localRules.faceCardStrict}
                                    onChange={(e) => setLocalRules({ ...localRules, faceCardStrict: e.target.checked })}
                                    id="face-strict-toggle"
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="toggle-row">
                            <div className="toggle-text">
                                <strong>Allow Buy-In / Re-Entry</strong>
                                <span>Eliminated players can re-enter with Highest Active Score + 1</span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={localRules.allowBuyIn}
                                    onChange={(e) => setLocalRules({ ...localRules, allowBuyIn: e.target.checked })}
                                    id="buy-in-toggle"
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} id="cancel-settings-btn">
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave} id="save-settings-btn">
                        <i className="fas fa-save"></i> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
