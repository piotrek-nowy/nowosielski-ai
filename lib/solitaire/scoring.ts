import { SCORING } from './constants';
import { PileType } from './types';

export function calculateMoveScore(
  fromPile: PileType,
  toPile: PileType,
  revealedCard: boolean
): number {
  let score = 0;

  if (fromPile === 'waste' && toPile === 'tableau') score += SCORING.WASTE_TO_TABLEAU;
  if (fromPile === 'waste' && toPile === 'foundation') score += SCORING.WASTE_TO_FOUNDATION;
  if (fromPile === 'tableau' && toPile === 'foundation') score += SCORING.TABLEAU_TO_FOUNDATION;
  if (fromPile === 'foundation' && toPile === 'tableau') score += SCORING.FOUNDATION_TO_TABLEAU;
  if (revealedCard) score += SCORING.REVEAL_CARD;

  return score;
}

export function calculateTimeBonus(timeInSeconds: number): number {
  if (timeInSeconds <= 0) return 0;
  return Math.max(0, Math.floor(700000 / timeInSeconds));
}
