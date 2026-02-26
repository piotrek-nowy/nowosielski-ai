'use client';

import React, { memo } from 'react';
import SolitaireCard, { EmptyPile } from './Card';
import { Card, CardLocation, HintMove } from '@/lib/solitaire/types';

interface TableauProps {
  columns: Card[][];
  onCardClick: (loc: CardLocation) => void;
  onCardDoubleClick: (loc: CardLocation) => void;
  onCardPointerDown: (e: React.PointerEvent, loc: CardLocation) => void;
  selectedCard: CardLocation | null;
  activeDropZone: string | null;
  hintMove: HintMove | null;
  dragSource: CardLocation | null;
  dragCardIndex: number;
}

function isLocationMatch(a: CardLocation | null, b: CardLocation): boolean {
  if (!a) return false;
  return a.pile === b.pile && a.index === b.index && a.cardIndex === b.cardIndex;
}

function cardTopCalc(column: Card[], index: number): string {
  let downCount = 0;
  let upCount = 0;
  for (let i = 0; i < index; i++) {
    if (column[i].faceUp) upCount++;
    else downCount++;
  }
  return `calc(${downCount} * var(--card-offset-down) + ${upCount} * var(--card-offset-up))`;
}

function columnHeightCalc(column: Card[]): string {
  if (column.length === 0) return 'var(--card-h)';
  let downCount = 0;
  let upCount = 0;
  for (let i = 0; i < column.length - 1; i++) {
    if (column[i].faceUp) upCount++;
    else downCount++;
  }
  return `calc(var(--card-h) + ${downCount} * var(--card-offset-down) + ${upCount} * var(--card-offset-up))`;
}

const Tableau = memo(function Tableau({
  columns,
  onCardClick,
  onCardDoubleClick,
  onCardPointerDown,
  selectedCard,
  activeDropZone,
  hintMove,
  dragSource,
  dragCardIndex,
}: TableauProps) {
  return (
    <div className="flex gap-3 justify-center">
      {columns.map((column, colIdx) => {
        const zoneId = `tableau-${colIdx}`;
        const isActive = activeDropZone === zoneId;
        const isHintTarget =
          hintMove?.to.pile === 'tableau' && hintMove.to.index === colIdx;

        return (
          <div
            key={colIdx}
            className="relative"
            style={{ minHeight: 'var(--card-h)', height: columnHeightCalc(column), width: 'var(--card-w)' }}
            data-drop-zone={zoneId}
          >
            {column.length === 0 ? (
              <EmptyPile
                label="K"
                highlight={isActive || isHintTarget}
                data-drop-zone={zoneId}
              />
            ) : (
              column.map((card, cardIdx) => {
                const loc: CardLocation = {
                  pile: 'tableau',
                  index: colIdx,
                  cardIndex: cardIdx,
                };
                const isDragging =
                  dragSource?.pile === 'tableau' &&
                  dragSource.index === colIdx &&
                  cardIdx >= dragCardIndex;
                const isHinted =
                  hintMove?.from.pile === 'tableau' &&
                  hintMove.from.index === colIdx &&
                  hintMove.from.cardIndex === cardIdx;

                return (
                  <div
                    key={card.id}
                    className="absolute left-0"
                    style={{
                      top: cardTopCalc(column, cardIdx),
                      zIndex: cardIdx,
                    }}
                  >
                    <SolitaireCard
                      card={card}
                      onClick={() => card.faceUp && onCardClick(loc)}
                      onDoubleClick={() => card.faceUp && onCardDoubleClick(loc)}
                      onPointerDown={e => card.faceUp && onCardPointerDown(e, loc)}
                      isSelected={isLocationMatch(selectedCard, loc)}
                      isDragging={isDragging}
                      isHinted={isHinted}
                    />
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
});

export default Tableau;
