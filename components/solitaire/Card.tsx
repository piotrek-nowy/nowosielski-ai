'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/solitaire/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/solitaire/constants';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  isDragging?: boolean;
  isHinted?: boolean;
  isSelected?: boolean;
  style?: React.CSSProperties;
  className?: string;
  flipAnimation?: boolean;
}

const FACE_CARD_DISPLAY: Record<string, string> = {
  J: '♞',
  Q: '♛',
  K: '♚',
};

const SolitaireCard = memo(function SolitaireCard({
  card,
  onClick,
  onDoubleClick,
  onPointerDown,
  isDragging = false,
  isHinted = false,
  isSelected = false,
  style,
  className = '',
  flipAnimation = false,
}: CardProps) {
  if (!card.faceUp) {
    return (
      <CardBack
        style={style}
        className={className}
        onClick={onClick}
        onPointerDown={onPointerDown}
      />
    );
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const isFaceCard = card.rank === 'J' || card.rank === 'Q' || card.rank === 'K';

  return (
    <motion.div
      className={`
        relative card-size rounded-lg bg-white border border-gray-300
        shadow-md select-none cursor-pointer touch-none
        ${isDragging ? 'opacity-30' : ''}
        ${isHinted ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent' : ''}
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent' : ''}
        ${className}
      `}
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      initial={flipAnimation ? { rotateY: 180, opacity: 0 } : false}
      animate={flipAnimation ? { rotateY: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute top-0.5 left-1 flex flex-col items-center leading-none" style={{ color }}>
        <span className="text-base font-bold leading-tight">{card.rank}</span>
        <span className="text-sm -mt-0.5">{symbol}</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center" style={{ color }}>
        {isFaceCard ? (
          <div className="flex flex-col items-center leading-none">
            <span className="text-4xl">{FACE_CARD_DISPLAY[card.rank]}</span>
            <span className="text-lg -mt-0.5">{symbol}</span>
          </div>
        ) : (
          <span className="text-4xl">{symbol}</span>
        )}
      </div>

      <div
        className="absolute bottom-0.5 right-1 flex flex-col items-center leading-none rotate-180"
        style={{ color }}
      >
        <span className="text-base font-bold leading-tight">{card.rank}</span>
        <span className="text-sm -mt-0.5">{symbol}</span>
      </div>
    </motion.div>
  );
});

export default SolitaireCard;

export const CardBack = memo(function CardBack({
  style,
  className = '',
  onClick,
  onPointerDown,
}: {
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      className={`
        relative card-size rounded-lg border border-gray-700
        shadow-md select-none overflow-hidden cursor-pointer touch-none
        ${className}
      `}
      style={style}
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      <div
        className="absolute inset-[3px] rounded-md"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              #1e3a6f,
              #1e3a6f 4px,
              #2a5090 4px,
              #2a5090 8px
            )
          `,
          border: '2px solid #15295a',
        }}
      />
      <div className="absolute inset-[5px] rounded border border-white/10" />
    </div>
  );
});

export const EmptyPile = memo(function EmptyPile({
  label,
  className = '',
  onClick,
  highlight = false,
  ...rest
}: {
  label?: string;
  className?: string;
  onClick?: () => void;
  highlight?: boolean;
  'data-drop-zone'?: string;
}) {
  return (
    <div
      className={`
        card-size rounded-lg border-2 border-dashed
        flex items-center justify-center
        transition-colors duration-150
        ${highlight
          ? 'border-yellow-400/80 bg-yellow-400/10'
          : 'border-green-600/40 bg-green-900/20'
        }
        ${className}
      `}
      onClick={onClick}
      {...rest}
    >
      {label && (
        <span className="text-green-500/40 text-xl select-none">{label}</span>
      )}
    </div>
  );
});
