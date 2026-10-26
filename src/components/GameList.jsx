import { useState } from 'react';

export default function GameList({ games, players, onDeleteGame }) {
    const [copied, setCopied] = useState(false);
    const [sortDesc, setSortDesc] = useState(false); // false = chronological (Game 1, 2, 3...), true = latest first

    if (!games || games.length === 0) {
        return (
            <div className="game-list-card empty-games">
                <i className="fas fa-clipboard-list"></i>
                <h4>No Games Recorded Yet</h4>
                <p>Enter points above and click &quot;Save Round Scores&quot; to see your round-by-round scorecard.</p>
            </div>
        );
    }

    const displayedGames = sortDesc ? [...games].reverse() : [...games];

    // Latest cumulative totals
    const lastGame = games[games.length - 1];
    const latestTotals = lastGame ? lastGame.cumulativeTotals : {};
    const minTotalScore = Math.min(...players.map(p => latestTotals[p.id] ?? 0));

    const handleShare = () => {
        let text = `🎮 SCOREBOARD - ${games.length} ${games.length === 1 ? 'Game' : 'Games'} Played\n`;
        text += `Lowest total score wins!\n\n`;

        const sorted = [...players].sort((a, b) => (latestTotals[a.id] || 0) - (latestTotals[b.id] || 0));

        text += `🏆 Standings:\n`;
        sorted.forEach((p, i) => {
            const medal = i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `${i + 1}th`;
            text += `${medal}: ${p.avatar} ${p.name} - ${latestTotals[p.id] || 0} pts\n`;
        });

        text += `\n📋 Rounds:\n`;
        games.forEach(g => {
            const minPts = Math.min(...players.map(p => g.points?.[p.id] ?? 999));
            const winner = players.find(p => (g.points?.[p.id] ?? 999) === minPts);
            text += `• ${g.label || `Round ${g.gameNumber}`} (Won by ${winner?.name || 'Tie'} with ${minPts} pts):\n`;
            players.forEach(p => {
                const pts = g.points?.[p.id] ?? 0;
                const cum = g.cumulativeTotals?.[p.id] ?? 0;
                text += `   - ${p.name}: +${pts} pts (Tot: ${cum})\n`;
            });
        });

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="game-list-card">
            {/* Header */}
            <div className="game-list-header">
                <div className="list-title-group">
                    <div className="list-title-row">
                        <i className="fas fa-table-list"></i>
                        <h3>Scorecard Ledger</h3>
                        <span className="game-count-tag">{games.length} {games.length === 1 ? 'Round' : 'Rounds'}</span>
                    </div>
                    <span className="list-subtitle">Round-by-round points &amp; running totals</span>
                </div>

                <div className="list-actions">
                    <button
                        type="button"
                        className="list-action-btn sort-btn"
                        onClick={() => setSortDesc(!sortDesc)}
                        title="Toggle order"
                    >
                        <i className={`fas ${sortDesc ? 'fa-sort-numeric-down-alt' : 'fa-sort-numeric-down'}`}></i>{' '}
                        {sortDesc ? 'Latest First' : 'Round 1 First'}
                    </button>

                    <button
                        type="button"
                        className="list-action-btn share-btn"
                        onClick={handleShare}
                        title="Copy summary to clipboard"
                    >
                        <i className={`fas ${copied ? 'fa-check' : 'fa-share-alt'}`}></i>{' '}
                        {copied ? 'Copied!' : 'Share'}
                    </button>
                </div>
            </div>

            {/* Simple, Clean Scorecard Table */}
            <div className="scorecard-table-wrapper">
                <table className="scorecard-table">
                    <thead>
                        <tr>
                            <th className="th-round">Round</th>
                            {players.map(player => (
                                <th key={player.id} className="th-player">
                                    <div className="th-player-info">
                                        <span className="th-avatar">{player.avatar}</span>
                                        <span className="th-name">{player.name}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="th-winner">Winner</th>
                            <th className="th-action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedGames.map(game => {
                            const minPtsInGame = Math.min(...players.map(p => game.points?.[p.id] ?? 999));
                            const gameWinners = players.filter(p => (game.points?.[p.id] ?? 999) === minPtsInGame);

                            return (
                                <tr key={game.gameNumber} className="scorecard-row">
                                    {/* Round Label */}
                                    <td className="td-round">
                                        <span className="round-name-badge">
                                            {game.label || `R#${game.gameNumber}`}
                                        </span>
                                    </td>

                                    {/* Player Scores in this Round */}
                                    {players.map(player => {
                                        const pts = game.points?.[player.id] ?? 0;
                                        const cum = game.cumulativeTotals?.[player.id] ?? 0;
                                        const isRoundWinner = pts === minPtsInGame;

                                        return (
                                            <td
                                                key={player.id}
                                                className={`td-score ${isRoundWinner ? 'is-winner-cell' : ''}`}
                                            >
                                                <div className="cell-score-wrap">
                                                    <span className={`cell-round-pts ${isRoundWinner ? 'pts-zero' : ''}`}>
                                                        {pts === 0 ? '✓ 0' : `+${pts}`}
                                                    </span>
                                                    <span className="cell-cumul-pts" title={`Total score up to this round: ${cum}`}>
                                                        tot: {cum}
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    })}

                                    {/* Round Winner */}
                                    <td className="td-winner">
                                        <div className="winner-pill-cell">
                                            <span className="winner-crown">👑</span>
                                            <span className="winner-name-list">
                                                {gameWinners.map(w => w.name).join(', ')} ({minPtsInGame})
                                            </span>
                                        </div>
                                    </td>

                                    {/* Delete Action */}
                                    <td className="td-action">
                                        <button
                                            type="button"
                                            className="delete-round-icon-btn"
                                            onClick={() => onDeleteGame(game.gameNumber)}
                                            title={`Delete Round #${game.gameNumber}`}
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="scorecard-totals-row">
                            <td className="td-round total-label-cell">
                                <strong>TOTAL</strong>
                            </td>
                            {players.map(player => {
                                const total = latestTotals[player.id] ?? 0;
                                const isLeading = total === minTotalScore && games.length > 0;

                                return (
                                    <td
                                        key={player.id}
                                        className={`td-score total-cell ${isLeading ? 'is-total-leader' : ''}`}
                                    >
                                        <div className="total-cell-content">
                                            <span className="grand-total-pts">{total} pts</span>
                                            {isLeading && <span className="leader-crown-tag">👑 1st</span>}
                                        </div>
                                    </td>
                                );
                            })}
                            <td className="td-winner total-summary-cell" colSpan={2}>
                                <span className="overall-leader-text">
                                    🏆 Leader:{' '}
                                    <strong>
                                        {players.filter(p => (latestTotals[p.id] ?? 0) === minTotalScore).map(p => p.name).join(', ')}
                                    </strong>
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
