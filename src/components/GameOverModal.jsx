import { useEffect, useRef } from 'react';
import { soundManager } from '../utils/SoundEffects';

export default function GameOverModal({ isOpen, onClose, winner, players, scores, rounds, onRematch, targetLimit }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        soundManager.playVictoryFanfare();

        // Canvas Confetti animation
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#f97316', '#3b82f6', '#10b981', '#fbbf24', '#ec4899', '#8b5cf6', '#ffffff'];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 4 - 2,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 6 - 3
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;

                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isOpen]);

    if (!isOpen || !winner) return null;

    // Sort players by score
    const rankedPlayers = [...players].sort((a, b) => (scores[a.id] || 0) - (scores[b.id] || 0));

    // Stats calculations
    let chiefCatcher = null;
    let maxCatches = 0;
    const catchCounts = {};

    rounds.forEach(r => {
        if (!r.isSuccess && r.catchers) {
            r.catchers.forEach(cid => {
                catchCounts[cid] = (catchCounts[cid] || 0) + 1;
                if (catchCounts[cid] > maxCatches) {
                    maxCatches = catchCounts[cid];
                    chiefCatcher = players.find(p => p.id === cid);
                }
            });
        }
    });

    return (
        <div className="declare-modal-overlay game-over-overlay" onClick={onClose}>
            <canvas ref={canvasRef} className="confetti-canvas"></canvas>

            <div className="declare-modal-box game-over-modal" onClick={e => e.stopPropagation()}>
                <div className="game-over-header">
                    <div className="trophy-bounce">🏆</div>
                    <span className="winner-tag">VICTORY ROYALE</span>
                    <h2>Game Over!</h2>
                    <p className="champion-announce">
                        Champion: <strong>{winner.avatar} {winner.name}</strong> with only <strong>{scores[winner.id] || 0} pts</strong>!
                    </p>
                </div>

                {/* Podium */}
                <div className="podium-container">
                    {/* 2nd Place */}
                    {rankedPlayers[1] && (
                        <div className="podium-step step-2">
                            <span className="step-badge">🥈 2nd</span>
                            <span className="step-avatar">{rankedPlayers[1].avatar}</span>
                            <span className="step-name">{rankedPlayers[1].name}</span>
                            <span className="step-pts">{scores[rankedPlayers[1].id] || 0} pts</span>
                            <div className="podium-pillar pillar-2">2</div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {rankedPlayers[0] && (
                        <div className="podium-step step-1">
                            <span className="step-crown">👑</span>
                            <span className="step-badge">🥇 Winner</span>
                            <span className="step-avatar">{rankedPlayers[0].avatar}</span>
                            <span className="step-name">{rankedPlayers[0].name}</span>
                            <span className="step-pts">{scores[rankedPlayers[0].id] || 0} pts</span>
                            <div className="podium-pillar pillar-1">1</div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {rankedPlayers[2] && (
                        <div className="podium-step step-3">
                            <span className="step-badge">🥉 3rd</span>
                            <span className="step-avatar">{rankedPlayers[2].avatar}</span>
                            <span className="step-name">{rankedPlayers[2].name}</span>
                            <span className="step-pts">{scores[rankedPlayers[2].id] || 0} pts</span>
                            <div className="podium-pillar pillar-3">3</div>
                        </div>
                    )}
                </div>

                {/* Awards / Highlights */}
                <div className="game-awards-row">
                    <div className="award-card">
                        <span className="award-icon">🛡️</span>
                        <div className="award-info">
                            <strong>Least Points</strong>
                            <p>{winner.name} ({scores[winner.id]} pts)</p>
                        </div>
                    </div>
                    {chiefCatcher && maxCatches > 0 && (
                        <div className="award-card">
                            <span className="award-icon">🎯</span>
                            <div className="award-info">
                                <strong>Chief Catcher</strong>
                                <p>{chiefCatcher.name} ({maxCatches} catches)</p>
                            </div>
                        </div>
                    )}
                    <div className="award-card">
                        <span className="award-icon">⚡</span>
                        <div className="award-info">
                            <strong>Rounds Played</strong>
                            <p>{rounds.length} Rounds (Target: {targetLimit}p)</p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} id="review-scorecard-btn">
                        <i className="fas fa-list-ol"></i> View Scorecard
                    </button>
                    <button className="btn-primary" onClick={onRematch} id="rematch-btn">
                        <i className="fas fa-redo"></i> Play Rematch
                    </button>
                </div>
            </div>
        </div>
    );
}
