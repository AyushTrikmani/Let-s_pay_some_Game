import { useState } from 'react';
import { CARD_RANKS, SUITS, calculateCardPoints, calculateHandTotal } from '../utils/CardUtils';

export default function CardPickerModal({ isOpen, onClose, playerName, initialCards = [], onSaveHand, rules }) {
    const [selectedCards, setSelectedCards] = useState(initialCards);
    const [activeSuit, setActiveSuit] = useState('♠');

    if (!isOpen) return null;

    const addCard = (rankObj) => {
        const newCard = {
            id: `${rankObj.rank}-${activeSuit}-${Date.now()}-${Math.random()}`,
            rank: rankObj.rank,
            suit: activeSuit,
            name: rankObj.name,
            isJoker: !!rankObj.isJoker
        };
        setSelectedCards([...selectedCards, newCard]);
    };

    const removeCard = (index) => {
        setSelectedCards(selectedCards.filter((_, idx) => idx !== index));
    };

    const clearAll = () => {
        setSelectedCards([]);
    };

    const totalPoints = calculateHandTotal(selectedCards, rules);

    const handleSave = () => {
        onSaveHand(selectedCards, totalPoints);
        onClose();
    };

    return (
        <div className="declare-modal-overlay" onClick={onClose}>
            <div className="declare-modal-box card-picker-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <span className="card-badge">🃏 Visual Card Calculator</span>
                        <h3>Build Hand for <span className="highlight-name">{playerName}</span></h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} id="close-card-picker-btn">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Live Hand Display */}
                <div className="player-hand-tray">
                    <div className="tray-header">
                        <span className="tray-title">Cards in Hand ({selectedCards.length})</span>
                        <div className="tray-actions">
                            <span className="hand-points-pill">
                                Total: <strong>{totalPoints} pts</strong>
                            </span>
                            {selectedCards.length > 0 && (
                                <button className="clear-tray-btn" onClick={clearAll} title="Clear all cards">
                                    <i className="fas fa-trash-alt"></i> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="tray-cards-container">
                        {selectedCards.length === 0 ? (
                            <div className="empty-tray-msg">
                                <i className="fas fa-hand-holding"></i>
                                <p>Tap cards below to add them to {playerName}&apos;s hand</p>
                            </div>
                        ) : (
                            selectedCards.map((card, idx) => {
                                const pts = calculateCardPoints(card, rules);
                                const isRed = card.suit === '♥' || card.suit === '♦';
                                return (
                                    <div
                                        key={card.id || idx}
                                        className={`mini-card ${isRed ? 'red-card' : 'black-card'} ${card.isJoker ? 'joker-card' : ''}`}
                                        onClick={() => removeCard(idx)}
                                        title="Click to remove"
                                    >
                                        <span className="card-corner-top">{card.rank}</span>
                                        <span className="card-center-suit">{card.isJoker ? '★' : card.suit}</span>
                                        <span className="card-pts-tag">{pts}p</span>
                                        <span className="card-remove-x"><i className="fas fa-times"></i></span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Suit Selector */}
                <div className="suit-selector-row">
                    <span className="selector-label">Suit:</span>
                    <div className="suit-tabs">
                        {SUITS.map(suit => (
                            <button
                                key={suit.symbol}
                                className={`suit-tab ${activeSuit === suit.symbol ? 'active' : ''} ${suit.color === 'red' ? 'text-red' : ''}`}
                                onClick={() => setActiveSuit(suit.symbol)}
                                id={`suit-tab-${suit.name.toLowerCase()}`}
                            >
                                <span className="suit-icon">{suit.symbol}</span>
                                <span className="suit-name">{suit.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Available Card Ranks Grid */}
                <div className="card-deck-grid">
                    {CARD_RANKS.map(rankItem => {
                        const pts = calculateCardPoints({ rank: rankItem.rank, isJoker: rankItem.isJoker }, rules);
                        const isRed = activeSuit === '♥' || activeSuit === '♦';
                        return (
                            <button
                                key={rankItem.rank}
                                className={`deck-card-btn ${isRed ? 'card-red' : 'card-black'} ${rankItem.isJoker ? 'card-joker' : ''}`}
                                onClick={() => addCard(rankItem)}
                                id={`deck-card-${rankItem.rank}`}
                            >
                                <div className="deck-card-inner">
                                    <span className="deck-card-rank">{rankItem.rank}</span>
                                    <span className="deck-card-suit">{rankItem.isJoker ? '★' : activeSuit}</span>
                                    <span className="deck-card-pts">{pts}p</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer Save Action */}
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} id="cancel-card-picker-btn">
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave} id="save-card-picker-btn">
                        <i className="fas fa-check"></i> Apply {totalPoints} Points
                    </button>
                </div>
            </div>
        </div>
    );
}
