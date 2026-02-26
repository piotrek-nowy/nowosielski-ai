'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import SolitaireCard from './Card';
import { Card } from '@/lib/solitaire/types';

interface DragLayerProps {
  cards: Card[];
  position: { x: number; y: number };
  offset: { x: number; y: number };
}

export default function DragLayer({ cards, position, offset }: DragLayerProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: position.x - offset.x,
        top: position.y - offset.y,
      }}
    >
      <div className="relative">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="absolute"
            style={{ top: `calc(${i} * var(--card-offset-up))` }}
          >
            <SolitaireCard
              card={{ ...card, faceUp: true }}
              className="shadow-2xl"
            />
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
