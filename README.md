# 🃏 Declare Master — Card Game Point Counter & Scorekeeper

A web application designed for scoring and tracking points in the **Declare** (also known as *Least Count* / *Low Card*) card game, featuring custom house rules, interactive visual card calculators, and an Indian Rummy (13-card) declare points calculator.

---

## 🌟 Key Features

1. **Least Count / Declare Game Mode**:
   - **Live Standings & Elimination Bar**: Visual progress towards target limit (50, 100, 150, 200, 250, or custom pts) with color-coded safety indicators.
   - **Dealer Tracking**: Automatic rotating dealer badge `🎴 Dealer`.
   - **Visual Card Deck Calculator**: Tap on realistic physical cards (A, 2-10, J, Q, K, Joker) across ♠, ♥, ♦, ♣ to calculate hand points dynamically.
   - **Quick Numeric Keypad**: Rapid adjustments (`-5`, `-1`, `+1`, `+5`, and `0`).
   - **Live Declare Verdict Preview**: Dynamic prediction highlighting **SUCCESSFUL DECLARE (0 pts)** or **WRONG DECLARE / BUST (2x penalty)** before submitting.
   - **Sound Effects (Web Audio API)**: Zero-dependency sound synthesizer with victory chimes, bust buzzers, and card taps.
   - **Scorecard Ledger**: Complete round-by-round history with single-click clipboard share for WhatsApp/Discord and "Undo Last Round" protection.
   - **Buy-In / Re-Entry**: Re-enter eliminated players with highest active score + 1 point.
   - **Custom House Rules**:
     - Declare threshold (≤ 5, 7, 10, or custom pts).
     - Penalty modes (Double 2x, Fixed 40, Fixed 50, Fixed 80, Hand + 25).
     - "7 is Zero" toggle (hostel variation).
     - Strict Face Cards (J=11, Q=12, K=13) toggle.
   - **Victory Celebration**: Canvas confetti animation with 1st, 2nd, and 3rd place podium and game superlative awards.

2. **Indian Rummy (13-Card) Calculator Tab**:
   - Calculate ungrouped points on declare/show.
   - Presets for First Drop (20 pts), Middle Drop (40 pts), and Full Count (80 pts max cap).
   - Card adder (+10, +2 to +9) with strict 80-point ceiling.

3. **Theme Support**:
   - Seamless Dark Mode (Obsidian Casino) & Light Mode (Off-white, orange, green, red, yellow, and blue).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The app will open automatically at:
```
http://localhost:5174
```

### 3. Build for Production
```bash
npm run build
```
The optimized bundle will be created in the `dist/` directory.

---

## 📖 Basic Rules of Declare

- **Goal**: Minimize points in your hand. Lowest cumulative score wins!
- **Card Values**:
  - Ace = 1 pt
  - 2 to 10 = Face value
  - Jack, Queen, King = 10 pts each
  - Joker = 0 pts
- **Declaring**: Call "Declare" when your hand total is ≤ 7 points.
- **Successful Declare**: If you have strictly the lowest points, you score **0 points** for the round! Others take hand points.
- **Failed Declare (Bust)**: If anyone has equal or lower points, you are CAUGHT! Lowest player gets 0, and you take **double hand points** as penalty!
