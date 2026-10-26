import { useId, useState } from 'react';

export default function ScoreChart({ games, players }) {
    const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
    const [selectedGameIdx, setSelectedGameIdx] = useState(games.length > 0 ? games.length - 1 : 0);
    const filterId = useId();

    if (!games || games.length === 0) {
        return (
            <div className="insights-card empty-chart">
                <i className="fas fa-chart-line"></i>
                <p>Record your first game above to see visual score trends and performance charts.</p>
            </div>
        );
    }

    // Chart dimensions
    const width = 640;
    const height = 260;
    const padding = { top: 25, right: 30, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Calculate max cumulative score for Y-axis scale
    let maxCumulative = 20;
    games.forEach(g => {
        players.forEach(p => {
            const val = g.cumulativeTotals?.[p.id] || 0;
            if (val > maxCumulative) maxCumulative = val;
        });
    });
    // Add 10% breathing room to max
    const yMax = Math.ceil((maxCumulative + 5) / 10) * 10;

    // Helper coordinates for Line Chart
    const getX = (gameIdx) => {
        if (games.length === 1) return padding.left + chartW / 2;
        return padding.left + (gameIdx / (games.length - 1)) * chartW;
    };

    const getY = (score) => {
        const clamped = Math.max(0, score);
        return padding.top + chartH - (clamped / yMax) * chartH;
    };

    // Performance Insights
    const totals = {};
    players.forEach(p => { totals[p.id] = 0; });
    const lastGame = games[games.length - 1];
    players.forEach(p => {
        totals[p.id] = lastGame.cumulativeTotals?.[p.id] ?? 0;
    });

    // Current leader (lowest points)
    const sortedByScore = [...players].sort((a, b) => (totals[a.id] || 0) - (totals[b.id] || 0));
    const currentLeader = sortedByScore[0];

    // Best single round (lowest score in any single game)
    let bestSingleScore = 999;
    let bestSinglePlayer = null;
    let bestSingleGameNum = 1;

    games.forEach(g => {
        players.forEach(p => {
            const pts = g.points?.[p.id] ?? 999;
            if (pts < bestSingleScore) {
                bestSingleScore = pts;
                bestSinglePlayer = p;
                bestSingleGameNum = g.gameNumber;
            }
        });
    });

    return (
        <div className="insights-card">
            {/* Header & View Switcher */}
            <div className="insights-header">
                <div className="insights-title-group">
                    <h3><i className="fas fa-chart-line"></i> Score Trends & Insights</h3>
                    <span className="insights-subtitle">Visual score trajectory across {games.length} {games.length === 1 ? 'game' : 'games'}</span>
                </div>

                <div className="chart-type-toggle">
                    <button
                        type="button"
                        className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                        onClick={() => setChartType('line')}
                        id="chart-type-line-btn"
                    >
                        <i className="fas fa-chart-line"></i> Cumulative Trend
                    </button>
                    <button
                        type="button"
                        className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                        onClick={() => setChartType('bar')}
                        id="chart-type-bar-btn"
                    >
                        <i className="fas fa-chart-bar"></i> Per-Game Points
                    </button>
                </div>
            </div>

            {/* Quick Stat Insights Cards */}
            <div className="insights-stat-grid">
                <div className="stat-pill-card stat-winner">
                    <span className="stat-icon">👑</span>
                    <div className="stat-meta">
                        <span className="stat-label">Current Leader (Lowest)</span>
                        <strong>{currentLeader?.avatar} {currentLeader?.name}: {totals[currentLeader?.id] || 0} pts</strong>
                    </div>
                </div>

                {bestSinglePlayer && (
                    <div className="stat-pill-card stat-best">
                        <span className="stat-icon">🎯</span>
                        <div className="stat-meta">
                            <span className="stat-label">Best Single Game</span>
                            <strong>{bestSinglePlayer.avatar} {bestSinglePlayer.name} ({bestSingleScore} pts in G#{bestSingleGameNum})</strong>
                        </div>
                    </div>
                )}

                <div className="stat-pill-card stat-avg">
                    <span className="stat-icon">📊</span>
                    <div className="stat-meta">
                        <span className="stat-label">Games Tracked</span>
                        <strong>{games.length} Games Played</strong>
                    </div>
                </div>
            </div>

            {/* SVG Visual Chart */}
            <div className="chart-canvas-wrapper">
                {chartType === 'line' ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="score-svg-chart">
                        <defs>
                            {/* Grid lines filter */}
                            <linearGradient id={`chart-grid-${filterId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                            </linearGradient>
                        </defs>

                        {/* Y-Axis Grid Lines & Labels */}
                        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                            const val = Math.round(yMax * pct);
                            const y = padding.top + chartH - pct * chartH;
                            return (
                                <g key={idx}>
                                    <line
                                        x1={padding.left}
                                        y1={y}
                                        x2={padding.left + chartW}
                                        y2={y}
                                        stroke="rgba(255, 255, 255, 0.08)"
                                        strokeDasharray="4 4"
                                    />
                                    <text
                                        x={padding.left - 8}
                                        y={y + 4}
                                        textAnchor="end"
                                        fill="var(--text-muted)"
                                        fontSize="11"
                                    >
                                        {val}
                                    </text>
                                </g>
                            );
                        })}

                        {/* X-Axis Labels (Games) */}
                        {games.map((g, idx) => {
                            const x = getX(idx);
                            return (
                                <g key={g.gameNumber}>
                                    <line
                                        x1={x}
                                        y1={padding.top}
                                        x2={x}
                                        y2={padding.top + chartH}
                                        stroke="rgba(255, 255, 255, 0.04)"
                                    />
                                    <text
                                        x={x}
                                        y={padding.top + chartH + 20}
                                        textAnchor="middle"
                                        fill="var(--text-secondary)"
                                        fontSize="11"
                                        fontWeight="600"
                                    >
                                        G#{g.gameNumber}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Lines for Each Player */}
                        {players.map((player) => {
                            const color = player.color || '#e07a3f';
                            const pointsList = games.map((g, idx) => ({
                                x: getX(idx),
                                y: getY(g.cumulativeTotals?.[player.id] ?? 0),
                                total: g.cumulativeTotals?.[player.id] ?? 0,
                                gameNumber: g.gameNumber
                            }));

                            const pathD = pointsList.reduce((acc, pt, i) => (
                                i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
                            ), '');

                            return (
                                <g key={player.id} className="player-chart-series">
                                    {/* Line */}
                                    <path
                                        d={pathD}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity="0.9"
                                    />

                                    {/* Data Dots with tooltips */}
                                    {pointsList.map((pt, i) => (
                                        <g key={i} className="chart-dot-group">
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r="5"
                                                fill={color}
                                                stroke="#161926"
                                                strokeWidth="2"
                                            />
                                            {/* Score text above dot */}
                                            <text
                                                x={pt.x}
                                                y={pt.y - 9}
                                                textAnchor="middle"
                                                fill={color}
                                                fontSize="10"
                                                fontWeight="700"
                                            >
                                                {pt.total}
                                            </text>
                                        </g>
                                    ))}
                                </g>
                            );
                        })}
                    </svg>
                ) : (
                    /* Bar Chart: Comparison of Points for Selected Game */
                    <div className="bar-chart-view">
                        <div className="bar-game-picker">
                            <span className="picker-label">Select Game to View:</span>
                            <div className="game-select-chips">
                                {games.map((g, idx) => (
                                    <button
                                        key={g.gameNumber}
                                        type="button"
                                        className={`game-chip ${selectedGameIdx === idx ? 'active' : ''}`}
                                        onClick={() => setSelectedGameIdx(idx)}
                                    >
                                        Game #{g.gameNumber}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {games[selectedGameIdx] && (
                            <div className="bars-comparison-container">
                                {players.map(player => {
                                    const currentGame = games[selectedGameIdx];
                                    const pts = currentGame.points?.[player.id] ?? 0;
                                    const maxInThisGame = Math.max(1, ...players.map(p => currentGame.points?.[p.id] ?? 0));
                                    const heightPct = Math.min(100, Math.round((pts / maxInThisGame) * 100));
                                    const isLowest = pts === Math.min(...players.map(p => currentGame.points?.[p.id] ?? 0));

                                    return (
                                        <div key={player.id} className="bar-column-item">
                                            <span className="bar-value-label">
                                                {pts} pts {isLowest && '👑'}
                                            </span>
                                            <div className="bar-track">
                                                <div
                                                    className={`bar-fill ${isLowest ? 'bar-winner' : ''}`}
                                                    style={{
                                                        height: `${Math.max(10, heightPct)}%`,
                                                        backgroundColor: player.color || '#3b82f6'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="bar-player-label">
                                                <span className="bar-avatar">{player.avatar}</span>
                                                <span className="bar-name">{player.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="chart-legend-row">
                <span className="legend-label">Players:</span>
                <div className="legend-items">
                    {players.map(p => (
                        <div key={p.id} className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: p.color || '#e07a3f' }}></span>
                            <span className="legend-name">{p.avatar} {p.name} ({totals[p.id] || 0} pts)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
