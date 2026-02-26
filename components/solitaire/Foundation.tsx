'use client';

import React, { memo } from 'react';
import SolitaireCard, { EmptyPile } from './Card';
import { Card, CardLocation, HintMove } from '@/lib/solitaire/types';
import { SUIT_SYMBOLS, FOUNDATION_SUITS } from '@/lib/solitaire/constants';

interface FoundationProps {
  piles: Card[][];
  onCardDoubleClick: (loc: CardLocation) => void;
  onCardPointerDown: (e: React.PointerEvent, loc: CardLocation) => void;
  onCardClick: (loc: CardLocation) => void;
  selectedCard: CardLocation | null;
  activeDropZone: string | null;
  hintMove: HintMove | null;
}

function isLocationMatch(a: CardLocation | null, b: CardLocation): boolean {
  if (!a) return false;
  return a.pile === b.pile && a.index === b.index && a.cardIndex === b.cardIndex;
}

const Foundation = memo(function Foundation({
  piles,
  onCardDoubleClick,
  onCardPointerDown,
  onCardClick,
  selectedCard,
  activeDropZone,
  hintMove,
}: FoundationProps) {
  return (
    <div className="flex gap-3">
      {piles.map((pile, i) => {
        const zoneId = `foundation-${i}`;
        const isActive = activeDropZone === zoneId;
        const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
        const loc: CardLocation = {
          pile: 'foundation',
          index: i,
          cardIndex: pile.length - 1,
        };
        const isHinted =
          hintMove?.to.pile === 'foundation' && hintMove.to.index === i;

        return (
          <div key={i} className="relative" data-drop-zone={zoneId}>
            {topCard ? (
              <SolitaireCard
                card={topCard}
                onClick={() => onCardClick(loc)}
                onDoubleClick={() => onCardDoubleClick(loc)}
                onPointerDown={e => onCardPointerDown(e, loc)}
                isSelected={isLocationMatch(selectedCard, loc)}
                isHinted={isHinted}
              />
            ) : (
              <EmptyPile
                label={SUIT_SYMBOLS[FOUNDATION_SUITS[i]]}
                highlight={isActive || isHinted}
                data-drop-zone={zoneId}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

export default Foundation;
