'use client';

import React, { memo } from 'react';
import SolitaireCard, { CardBack, EmptyPile } from './Card';
import { Card, CardLocation, HintMove } from '@/lib/solitaire/types';

interface StockAndWasteProps {
  stock: Card[];
  waste: Card[];
  drawMode: 1 | 3;
  onStockClick: () => void;
  onWasteCardClick: (loc: CardLocation) => void;
  onWasteCardDoubleClick: (loc: CardLocation) => void;
  onWasteCardPointerDown: (e: React.PointerEvent, loc: CardLocation) => void;
  selectedCard: CardLocation | null;
  hintMove: HintMove | null;
}

function isLocationMatch(a: CardLocation | null, b: CardLocation): boolean {
  if (!a) return false;
  return a.pile === b.pile && a.index === b.index && a.cardIndex === b.cardIndex;
}

const StockAndWaste = memo(function StockAndWaste({
  stock,
  waste,
  drawMode,
  onStockClick,
  onWasteCardClick,
  onWasteCardDoubleClick,
  onWasteCardPointerDown,
  selectedCard,
  hintMove,
}: StockAndWasteProps) {
  const isStockHinted =
    hintMove?.from.pile === 'stock' && hintMove.from.index === 0;

  const visibleWaste = drawMode === 3 ? waste.slice(-3) : waste.slice(-1);
  const wasteTop = waste.length > 0 ? waste[waste.length - 1] : null;

  return (
    <div className="flex gap-3">
      {/* Stock */}
      <div className="relative" onClick={onStockClick}>
        {stock.length > 0 ? (
          <div className="relative">
            <CardBack className={isStockHinted ? 'ring-2 ring-yellow-400 animate-pulse' : ''} />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-1.5 rounded-full">
              {stock.length}
            </div>
          </div>
        ) : (
          <EmptyPile
            label="↻"
            className="cursor-pointer"
          />
        )}
      </div>

      {/* Waste */}
      <div className="relative card-size">
        {waste.length === 0 ? (
          <EmptyPile />
        ) : drawMode === 3 ? (
          visibleWaste.map((card, i) => {
            const isTop = i === visibleWaste.length - 1;
            const wasteIdx = waste.length - visibleWaste.length + i;
            const loc: CardLocation = {
              pile: 'waste',
              index: 0,
              cardIndex: wasteIdx,
            };
            const isHinted =
              isTop &&
              hintMove?.from.pile === 'waste';

            return (
              <div
                key={card.id}
                className="absolute"
                style={{ left: i * 20, zIndex: i }}
              >
                <SolitaireCard
                  card={{ ...card, faceUp: true }}
                  onClick={isTop ? () => onWasteCardClick(loc) : undefined}
                  onDoubleClick={isTop ? () => onWasteCardDoubleClick(loc) : undefined}
                  onPointerDown={isTop ? e => onWasteCardPointerDown(e, loc) : undefined}
                  isSelected={isTop && isLocationMatch(selectedCard, loc)}
                  isHinted={isHinted}
                />
              </div>
            );
          })
        ) : wasteTop ? (
          (() => {
            const loc: CardLocation = {
              pile: 'waste',
              index: 0,
              cardIndex: waste.length - 1,
            };
            const isHinted = hintMove?.from.pile === 'waste';
            return (
              <SolitaireCard
                card={{ ...wasteTop, faceUp: true }}
                onClick={() => onWasteCardClick(loc)}
                onDoubleClick={() => onWasteCardDoubleClick(loc)}
                onPointerDown={e => onWasteCardPointerDown(e, loc)}
                isSelected={isLocationMatch(selectedCard, loc)}
                isHinted={isHinted}
              />
            );
          })()
        ) : null}
      </div>
    </div>
  );
});

export default StockAndWaste;
