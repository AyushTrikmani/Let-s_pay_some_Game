import { useState, useEffect } from 'react';
import Leaderboard from './components/Leaderboard';
import ManualScoreEntry from './components/ManualScoreEntry';
import ScoreChart from './components/ScoreChart';
import GameList from './components/GameList';
import { DEFAULT_PLAYERS, generatePlayersPreset } from './utils/CardUtils';
import { soundManager } from './utils/SoundEffects';
import './declare.css';

export default function App() {
    const STORAGE_KEY = 'simple_game_counter_v2';


    // Theme state: dark / light
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('declare_theme') || 'dark';
        } catch {
            return 'dark';
        }
    });

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        localStorage.setItem('declare_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    // Players state
    const [players, setPlayers] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.players && parsed.players.length > 0) return parsed.players;
            }
        } catch { /* ignore */ }
        return DEFAULT_PLAYERS;
    });

    // Games history: array of { gameNumber, label, points: { [pid]: number }, cumulativeTotals: { [pid]: number }, timestamp }
    const [games, setGames] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.games) return parsed.games;
            }
        } catch { /* ignore */ }
        return [];
    });

    // Cumulative scores state: { [pid]: number }
    const [scores, setScores] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.scores) return parsed.scores;
            }
        } catch { /* ignore */ }
        const init = {};
        DEFAULT_PLAYERS.forEach(p => { init[p.id] = 0; });
        return init;
    });

    // Save to LocalStorage
    useEffect(() => {
        try {
            const stateToSave = {
                players,
                games,
                scores
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch { /* ignore */ }
    }, [players, games, scores]);

    // Handle adding a new game/round
    const handleAddGame = ({ gameNumber, label, points }) => {
        const newCumulative = { ...scores };

        players.forEach(p => {
            const added = points[p.id] || 0;
            newCumulative[p.id] = (newCumulative[p.id] || 0) + added;
        });

        const newGameRecord = {
            gameNumber,
            label,
            points: { ...points },
            cumulativeTotals: { ...newCumulative },
            timestamp: Date.now()
        };

        setScores(newCumulative);
        setGames(prev => [...prev, newGameRecord]);

        soundManager.playRoundSubmit();
    };

    // Handle deleting a specific game
    const handleDeleteGame = (gameNum) => {
        const confirmDelete = window.confirm(`Delete Game #${gameNum}? All subsequent cumulative scores will be recalculated.`);
        if (!confirmDelete) return;

        const filtered = games.filter(g => g.gameNumber !== gameNum);

        // Recalculate cumulative totals from scratch
        const recalculatedScores = {};
        players.forEach(p => { recalculatedScores[p.id] = 0; });

        const recalculatedGames = filtered.map((g, idx) => {
            const roundCumul = { ...recalculatedScores };
            players.forEach(p => {
                const pts = g.points[p.id] || 0;
                roundCumul[p.id] = (roundCumul[p.id] || 0) + pts;
            });
            Object.assign(recalculatedScores, roundCumul);

            return {
                ...g,
                gameNumber: idx + 1,
                label: g.label.startsWith('Game #') ? `Game #${idx + 1}` : g.label,
                cumulativeTotals: { ...roundCumul }
            };
        });

        setScores(recalculatedScores);
        setGames(recalculatedGames);
    };

    // Handle updating player name or avatar
    const handleUpdatePlayer = (id, newProps) => {
        setPlayers(prev => prev.map(p => (p.id === id ? { ...p, ...newProps } : p)));
    };

    // Handle removing a player
    const handleDeletePlayer = (id) => {
        if (players.length <= 2) {
            alert('A minimum of 2 players is required.');
            return;
        }
        const player = players.find(p => p.id === id);
        if (!window.confirm(`Remove ${player?.name || 'this player'} from game?`)) return;

        setPlayers(prev => prev.filter(p => p.id !== id));
        setScores(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    // Handle adding a player (e.g. 5th player)
    const handleAddPlayer = (name, avatar, startScore = 0) => {
        if (players.length >= 10) {
            alert('Maximum 10 players supported!');
            return;
        }

        const newId = `p_${Date.now()}`;
        const newPlayer = {
            id: newId,
            name: name.trim() || `Player ${players.length + 1}`,
            avatar: avatar || '🦊',
            color: '#e07a3f'
        };

        setPlayers(prev => [...prev, newPlayer]);
        setScores(prev => ({ ...prev, [newId]: startScore }));
        soundManager.playRoundSubmit();
    };

    // Handle quick table count presets (e.g. 2P, 3P, 4P, 5P, etc.)
    const handleChangePlayerCount = (count) => {
        const newPreset = generatePlayersPreset(count);
        const newScores = {};
        newPreset.forEach(p => { newScores[p.id] = 0; });

        setPlayers(newPreset);
        setScores(newScores);
        setGames([]);
        soundManager.playRoundSubmit();
    };

    // Handle resetting all scores
    const handleResetAll = () => {
        const confirmReset = window.confirm('Start fresh? All games and points will be reset to 0.');
        if (!confirmReset) return;

        const resetScores = {};
        players.forEach(p => { resetScores[p.id] = 0; });

        setScores(resetScores);
        setGames([]);
    };

    // Last game point deltas for leaderboard
    const lastGame = games[games.length - 1];
    const lastGameDeltas = lastGame ? lastGame.points : {};

    return (
        <div className="declare-app-wrapper">
            {/* Top Navigation Bar */}
            <header className="declare-topbar">
                <div className="topbar-left">
                    <div className="declare-brand">
                        <span className="brand-cards">📊</span>
                        <div className="brand-title-wrap">
                            <h1>ScoreTracker<span>.</span></h1>
                            <span className="brand-subtitle">Manual Points Counter &bull; Lowest Score Wins</span>
                        </div>
                    </div>
                </div>

                {/* Topbar Actions */}
                <div className="topbar-actions">
                    <button
                        className="topbar-btn theme-toggle-btn"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                        id="theme-toggle-btn"
                    >
                        <span>{theme === 'light' ? '☀️' : '🌙'}</span>
                    </button>

                    <button
                        className="topbar-btn reset-game-btn"
                        onClick={handleResetAll}
                        title="Reset all games & start fresh"
                        id="reset-game-btn"
                    >
                        <i className="fas fa-redo"></i> Reset
                    </button>
                </div>
            </header>

            {/* Main Dashboard */}
            <main className="declare-main-content">
                <div className="container declare-container">
                    <div className="declare-layout-grid">
                        {/* Left Column: Live Standings (Lowest Score = Winner) */}
                        <div className="declare-col-standings">
                            <Leaderboard
                                players={players}
                                scores={scores}
                                lastGameDeltas={lastGameDeltas}
                                onAddPlayer={handleAddPlayer}
                                onUpdatePlayer={handleUpdatePlayer}
                                onDeletePlayer={handleDeletePlayer}
                                onChangePlayerCount={handleChangePlayerCount}
                                gamesCount={games.length}
                            />
                        </div>

                        {/* Right Column: Manual Entry, Chart Insights & Games List */}
                        <div className="declare-col-actions">
                            {/* 1. Manual Points Entry Form */}
                            <ManualScoreEntry
                                nextGameNumber={games.length + 1}
                                players={players}
                                onAddGame={handleAddGame}
                                onUpdatePlayer={handleUpdatePlayer}
                            />

                            {/* 2. Score Trends & Insights Visual Chart */}
                            <ScoreChart
                                games={games}
                                players={players}
                            />

                            {/* 3. Detailed Games List */}
                            <GameList
                                games={games}
                                players={players}
                                onDeleteGame={handleDeleteGame}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
