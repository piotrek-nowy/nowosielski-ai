'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateTimeBonus } from '@/lib/solitaire/scoring';

interface WinScreenProps {
  score: number;
  timeElapsed: number;
  moves: number;
  onNewGame: () => void;
}

interface FallingCard {
  id: number;
  x: number;
  suit: string;
  delay: number;
  rotation: number;
}

export default function WinScreen({ score, timeElapsed, moves, onNewGame }: WinScreenProps) {
  const [cards, setCards] = useState<FallingCard[]>([]);
  const timeBonus = calculateTimeBonus(timeElapsed);
  const totalScore = score + timeBonus;

  useEffect(() => {
    const suits = ['♠', '♥', '♦', '♣'];
    const falling: FallingCard[] = [];
    for (let i = 0; i < 30; i++) {
      falling.push({
        id: i,
        x: Math.random() * 100,
        suit: suits[Math.floor(Math.random() * 4)],
        delay: Math.random() * 3,
        rotation: (Math.random() - 0.5) * 720,
      });
    }
    setCards(falling);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute inset-0 bg-black/70" />

        {/* Falling cards */}
        {cards.map(card => (
          <motion.div
            key={card.id}
            className="absolute text-4xl pointer-events-none"
            style={{
              left: `${card.x}%`,
              color: card.suit === '♥' || card.suit === '♦' ? '#e53935' : '#ffffff',
            }}
            initial={{ y: -100, rotate: 0, opacity: 0 }}
            animate={{
              y: ['0vh', '110vh'],
              rotate: card.rotation,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              delay: card.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {card.suit}
          </motion.div>
        ))}

        {/* Win dialog */}
        <motion.div
          className="relative bg-green-950 border border-green-600/50 rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 15 }}
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            🏆
          </motion.div>

          <h2 className="text-white font-bold text-2xl mb-1">You Win!</h2>
          <p className="text-green-400/70 text-sm mb-6">Congratulations!</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-left">
            <div>
              <div className="text-green-500/50 text-xs uppercase">Score</div>
              <div className="text-white font-mono font-bold text-lg">{score}</div>
            </div>
            <div>
              <div className="text-green-500/50 text-xs uppercase">Time Bonus</div>
              <div className="text-white font-mono font-bold text-lg">+{timeBonus}</div>
            </div>
            <div>
              <div className="text-green-500/50 text-xs uppercase">Moves</div>
              <div className="text-white font-mono font-bold text-lg">{moves}</div>
            </div>
            <div>
              <div className="text-green-500/50 text-xs uppercase">Total</div>
              <div className="text-yellow-400 font-mono font-bold text-lg">{totalScore}</div>
            </div>
          </div>

          <button
            onClick={onNewGame}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
