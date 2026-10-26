export default function RulesModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="declare-modal-overlay" onClick={onClose}>
            <div className="declare-modal-box rules-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <span className="card-badge">📖 Rulebook</span>
                        <h3>How to Play Declare (Least Count)</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} id="close-rules-modal-btn">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="rules-content-scroll">
                    {/* Goal */}
                    <div className="rule-card">
                        <div className="rule-card-icon">🎯</div>
                        <div className="rule-card-text">
                            <h4>Primary Objective</h4>
                            <p>
                                The goal of <strong>Declare</strong> (also called <em>Least Count</em> or <em>Low Card</em>) is to hold the <strong>minimum possible points</strong> in your hand across multiple rounds. The player with the fewest cumulative points when others get eliminated wins!
                            </p>
                        </div>
                    </div>

                    {/* Card Values */}
                    <div className="rule-card">
                        <div className="rule-card-icon">🃏</div>
                        <div className="rule-card-text">
                            <h4>Card Point Values</h4>
                            <div className="card-values-table">
                                <div className="val-row">
                                    <span className="val-pill">Ace (A)</span>
                                    <span className="val-desc"><strong>1 Point</strong></span>
                                </div>
                                <div className="val-row">
                                    <span className="val-pill">2 to 10</span>
                                    <span className="val-desc"><strong>Face Value</strong> (e.g. 5 = 5 pts, 9 = 9 pts)</span>
                                </div>
                                <div className="val-row">
                                    <span className="val-pill">Jack, Queen, King</span>
                                    <span className="val-desc"><strong>10 Points each</strong> (High danger cards to hold)</span>
                                </div>
                                <div className="val-row">
                                    <span className="val-pill">Joker (★)</span>
                                    <span className="val-desc"><strong>0 Points</strong> (Best card to reduce score)</span>
                                </div>
                                <div className="val-row highlight-row">
                                    <span className="val-pill">&quot;7 is Zero&quot; (House Rule)</span>
                                    <span className="val-desc">Optional rule where all 7s count as <strong>0 points</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The Declare Call */}
                    <div className="rule-card">
                        <div className="rule-card-icon">🗣️</div>
                        <div className="rule-card-text">
                            <h4>When Can You Declare?</h4>
                            <p>
                                When it is your turn, if the total sum of cards in your hand is <strong>≤ 7 points</strong> (or the agreed threshold like ≤ 5 or ≤ 10), you can shout <strong>&quot;DECLARE!&quot;</strong> without drawing or discarding. Everyone reveals their cards!
                            </p>
                        </div>
                    </div>

                    {/* Scenario A: Success */}
                    <div className="rule-card success-card">
                        <div className="rule-card-icon">🎉</div>
                        <div className="rule-card-text">
                            <h4>Scenario 1: Successful Declare (Declarer Wins)</h4>
                            <p>
                                If the declarer truly has strictly fewer points than everyone else at the table:
                            </p>
                            <ul>
                                <li><strong>Declarer scores:</strong> 0 points for this round! 🏆</li>
                                <li><strong>All other players:</strong> Add the points in their hand to their cumulative total.</li>
                            </ul>
                            <div className="example-box">
                                <em>Example:</em> Player 1 declares with <strong>4 pts</strong>. Player 2 has 6 pts, Player 3 has 9 pts. Player 1 has lowest! Player 1 gets <strong>0 pts</strong>, Player 2 gets <strong>6 pts</strong>, Player 3 gets <strong>9 pts</strong>.
                            </div>
                        </div>
                    </div>

                    {/* Scenario B: Caught / Bust */}
                    <div className="rule-card danger-card">
                        <div className="rule-card-icon">🚨</div>
                        <div className="rule-card-text">
                            <h4>Scenario 2: Failed Declare (Bust / Caught!)</h4>
                            <p>
                                If another player has points <strong>equal to or lower than</strong> the declarer:
                            </p>
                            <ul>
                                <li><strong>The Catcher (lowest player):</strong> Scores <strong>0 points</strong>!</li>
                                <li><strong>Failed Declarer:</strong> Penalized heavily! Takes <strong>Double their hand points (2x)</strong> (or fixed 40/50/80 pts depending on rules).</li>
                                <li><strong>Other players:</strong> Add their hand points normally.</li>
                            </ul>
                            <div className="example-box">
                                <em>Example:</em> Player 1 declares with <strong>5 pts</strong>. But Player 2 also has <strong>4 pts</strong>! Player 1 is CAUGHT. Player 2 gets <strong>0 pts</strong>. Player 1 receives a 2x penalty = <strong>10 pts</strong>!
                            </div>
                        </div>
                    </div>

                    {/* Elimination */}
                    <div className="rule-card">
                        <div className="rule-card-icon">💀</div>
                        <div className="rule-card-text">
                            <h4>Elimination & Game Over</h4>
                            <p>
                                When a player reaches or exceeds the target limit (e.g. <strong>100 points</strong>), they are eliminated. The last remaining player (or the one with the lowest score) is crowned champion!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose} id="got-it-rules-btn">
                        <i className="fas fa-check"></i> Got it, Let&apos;s Play!
                    </button>
                </div>
            </div>
        </div>
    );
}
