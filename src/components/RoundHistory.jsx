import { useState } from 'react';

export default function RoundHistory({ rounds, players, onUndoLastRound, targetLimit }) {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (latest first) or 'asc' (oldest first)

    if (!rounds || rounds.length === 0) {
        return (
            <div className="round-history-card empty-history">
                <div className="empty-history-icon"><i className="fas fa-clipboard-list"></i></div>
                <h4>No Rounds Played Yet</h4>
                <p>Record your first round above to see the detailed scorecard and points ledger.</p>
            </div>
        );
    }

    const handleCopyScores = () => {
        let text = `🃏 DECLARE CARD GAME - Round ${rounds.length}\n`;
        text += `Target Limit: ${targetLimit} pts\n\n`;
        text += `🏆 Current Standings:\n`;

        // Calculate latest totals
        const lastRound = rounds[rounds.length - 1];
        const latestTotals = lastRound ? lastRound.cumulativeTotals : {};

        const sortedPlayers = [...players].sort((a, b) => (latestTotals[a.id] || 0) - (latestTotals[b.id] || 0));

        sortedPlayers.forEach((p, idx) => {
            const medal = idx === 0 ? '👑 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `${idx + 1}th`;
            const score = latestTotals[p.id] ?? 0;
            const status = score >= targetLimit ? '💀 OUT' : `${score} pts`;
            text += `${medal}: ${p.avatar} ${p.name} - ${status}\n`;
        });

        text += `\n📜 Round History (Latest to Oldest):\n`;
        [...rounds].reverse().forEach(r => {
            const dec = players.find(p => p.id === r.declarerId);
            const verdict = r.isSuccess ? '✅ Successful Declare' : '🚨 BUST / CAUGHT';
            text += `• Rnd #${r.roundNumber}: ${dec?.name || 'Player'} (${verdict})\n`;
            players.forEach(p => {
                const awarded = r.pointsAwarded?.[p.id] ?? 0;
                const cum = r.cumulativeTotals?.[p.id] ?? 0;
                text += `   - ${p.name}: +${awarded} (Total: ${cum})\n`;
            });
        });

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // Sorted rounds for display
    const displayedRounds = sortOrder === 'desc' ? [...rounds].reverse() : [...rounds];

    // Stats
    const successfulDeclaresCount = rounds.filter(r => r.isSuccess).length;
    const bustsCount = rounds.length - successfulDeclaresCount;

    return (
        <div className="round-history-card">
            {/* Header */}
            <div className="history-header">
                <div className="title-with-pill">
                    <h3><i className="fas fa-history"></i> Round History & Scorecard</h3>
                    <div className="history-meta-tags">
                        <span className="round-count-pill">{rounds.length} {rounds.length === 1 ? 'Round' : 'Rounds'}</span>
                        <span className="success-rate-pill">
                            <i className="fas fa-check"></i> {successfulDeclaresCount} Won • <i className="fas fa-times"></i> {bustsCount} Caught
                        </span>
                    </div>
                </div>

                <div className="history-controls-row">
                    {/* View Switcher: List vs Table */}
                    <div className="view-toggle-group">
                        <button
                            type="button"
                            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Detailed Round Cards View"
                            id="view-mode-list-btn"
                        >
                            <i className="fas fa-th-list"></i> Detailed List
                        </button>
                        <button
                            type="button"
                            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Spreadsheet Table View"
                            id="view-mode-table-btn"
                        >
                            <i className="fas fa-table"></i> Table View
                        </button>
                    </div>

                    {/* Sort Order */}
                    <button
                        type="button"
                        className="sort-order-btn"
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        title={`Sort by ${sortOrder === 'desc' ? 'Oldest First' : 'Newest First'}`}
                        id="sort-rounds-btn"
                    >
                        <i className={`fas ${sortOrder === 'desc' ? 'fa-sort-numeric-down-alt' : 'fa-sort-numeric-down'}`}></i> {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                    </button>

                    {/* Actions */}
                    <button
                        className="history-action-btn share-btn"
                        onClick={handleCopyScores}
                        title="Copy scoreboard to clipboard"
                        id="share-scores-btn"
                    >
                        <i className={`fas ${copied ? 'fa-check' : 'fa-share-alt'}`}></i> {copied ? 'Copied!' : 'Share'}
                    </button>

                    <button
                        className="history-action-btn undo-btn"
                        onClick={onUndoLastRound}
                        title="Undo the most recent round"
                        id="undo-round-btn"
                    >
                        <i className="fas fa-undo"></i> Undo
                    </button>
                </div>
            </div>

            {/* View Mode 1: Detailed Round Cards List */}
            {viewMode === 'list' && (
                <div className="rounds-cards-feed">
                    {displayedRounds.map(round => {
                        const declarer = players.find(p => p.id === round.declarerId);
                        const declarerRaw = round.rawPoints?.[round.declarerId];
                        const declarerAwarded = round.pointsAwarded?.[round.declarerId] ?? 0;
                        const catchers = round.catchers || [];

                        return (
                            <div
                                key={round.roundNumber}
                                className={`round-feed-item ${round.isSuccess ? 'feed-success' : 'feed-bust'}`}
                                id={`round-card-${round.roundNumber}`}
                            >
                                {/* Round Header Bar */}
                                <div className="feed-item-top">
                                    <div className="feed-item-title">
                                        <span className="feed-round-badge">Round #{round.roundNumber}</span>
                                        <div className="feed-declarer-tag">
                                            <span className="feed-dec-avatar">{declarer?.avatar}</span>
                                            <span><strong>{declarer?.name || 'Player'}</strong> declared</span>
                                            {declarerRaw !== undefined && (
                                                <span className="feed-hand-pts">({declarerRaw} pts in hand)</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="feed-outcome-badge">
                                        {round.isSuccess ? (
                                            <span className="badge-win">
                                                <i className="fas fa-trophy"></i> Won (Awarded 0 pts)
                                            </span>
                                        ) : (
                                            <span className="badge-bust">
                                                <i className="fas fa-exclamation-triangle"></i> CAUGHT (+{declarerAwarded} penalty)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Players Breakdown in this Round */}
                                <div className="feed-players-row">
                                    {players.map(player => {
                                        const isDeclarer = player.id === round.declarerId;
                                        const isCatcher = catchers.includes(player.id);
                                        const awarded = round.pointsAwarded?.[player.id];
                                        const raw = round.rawPoints?.[player.id];
                                        const cumulative = round.cumulativeTotals?.[player.id];
                                        const isElim = cumulative !== undefined && cumulative >= targetLimit;

                                        let roleBadge = null;
                                        if (isDeclarer) {
                                            roleBadge = round.isSuccess ? '👑 Winner' : '🚨 Bust';
                                        } else if (isCatcher) {
                                            roleBadge = '🎯 Catcher (0p)';
                                        }

                                        return (
                                            <div
                                                key={player.id}
                                                className={`feed-player-chip ${isDeclarer ? 'chip-declarer' : ''} ${isCatcher ? 'chip-catcher' : ''}`}
                                            >
                                                <div className="chip-header">
                                                    <span className="chip-avatar">{player.avatar}</span>
                                                    <span className="chip-player-name">{player.name}</span>
                                                    {roleBadge && (
                                                        <span className={`chip-role-tag ${isCatcher || (isDeclarer && round.isSuccess) ? 'role-win' : 'role-penalty'}`}>
                                                            {roleBadge}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="chip-scores-line">
                                                    {raw !== undefined && (
                                                        <span className="chip-hand-held" title="Cards points held">
                                                            Hand: <strong>{raw}p</strong>
                                                        </span>
                                                    )}
                                                    <span className={`chip-awarded ${awarded === 0 ? 'awarded-zero' : 'awarded-plus'}`}>
                                                        {awarded === 0 ? '0 pts' : `+${awarded ?? 0} pts`}
                                                    </span>
                                                    {cumulative !== undefined && (
                                                        <span className={`chip-cumul ${isElim ? 'cumul-out' : ''}`}>
                                                            (Total: {cumulative})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View Mode 2: Table Ledger View */}
            {viewMode === 'table' && (
                <div className="history-table-container">
                    <table className="scorecard-table">
                        <thead>
                            <tr>
                                <th>Round</th>
                                <th>Declarer</th>
                                <th>Outcome</th>
                                {players.map(p => (
                                    <th key={p.id} className="player-col-header">
                                        <div className="th-player-wrap">
                                            <span className="th-avatar">{p.avatar}</span>
                                            <span className="th-name">{p.name}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayedRounds.map(round => {
                                const declarer = players.find(p => p.id === round.declarerId);
                                const declarerAwarded = round.pointsAwarded?.[round.declarerId] ?? 0;

                                return (
                                    <tr key={round.roundNumber}>
                                        <td className="round-num-cell">#{round.roundNumber}</td>
                                        <td className="declarer-cell">
                                            <span className="table-avatar">{declarer?.avatar}</span>
                                            <span className="table-dec-name">{declarer?.name || 'Player'}</span>
                                        </td>
                                        <td className="outcome-cell">
                                            {round.isSuccess ? (
                                                <span className="outcome-tag success-tag">
                                                    <i className="fas fa-check"></i> Won (0)
                                                </span>
                                            ) : (
                                                <span className="outcome-tag bust-tag">
                                                    <i className="fas fa-times"></i> Caught (+{declarerAwarded})
                                                </span>
                                            )}
                                        </td>
                                        {players.map(p => {
                                            const awarded = round.pointsAwarded?.[p.id];
                                            const cumulative = round.cumulativeTotals?.[p.id];
                                            const isElim = cumulative !== undefined && cumulative >= targetLimit;

                                            return (
                                                <td key={p.id} className={`score-cell ${awarded === 0 ? 'score-zero-cell' : ''}`}>
                                                    <div className="score-cell-inner">
                                                        <span className={`round-awarded ${awarded === 0 ? 'awarded-zero' : ''}`}>
                                                            {awarded === undefined ? '-' : awarded === 0 ? '0' : `+${awarded}`}
                                                        </span>
                                                        <span className={`round-cumul ${isElim ? 'cumul-elim' : ''}`}>
                                                            {cumulative !== undefined ? `(Total: ${cumulative})` : ''}
                                                        </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
