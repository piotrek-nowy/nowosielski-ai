export type PieceColor = 'white' | 'black';
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface CastlingRights {
  white: { kingside: boolean; queenside: boolean };
  black: { kingside: boolean; queenside: boolean };
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isEnPassant?: boolean;
  isCastling?: 'kingside' | 'queenside';
  promotion?: PieceType;
  isCheck?: boolean;
  isCheckmate?: boolean;
  prevCastlingRights?: CastlingRights;
  prevEnPassantTarget?: Position | null;
  prevHalfMoveClock?: number;
  notation?: string;
}

export type Board = (Piece | null)[][];

export type GameMode = 'pvp' | 'pvc';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type BoardSkin = 'brown' | 'blue' | 'green' | 'purple' | 'marble';
export type PieceSkin = 'cburnett' | 'staunty' | 'alpha' | 'fantasy';

export interface TimeControl {
  minutes: number;
  increment: number;
}

export interface BoardColors {
  light: string;
  dark: string;
}

export const BOARD_SKINS: Record<BoardSkin, BoardColors> = {
  brown: { light: '#f0d9b5', dark: '#b58863' },
  blue: { light: '#dee3e6', dark: '#8ca2ad' },
  green: { light: '#ffffdd', dark: '#86a666' },
  purple: { light: '#f0e9f0', dark: '#9b72b0' },
  marble: { light: '#e8e0d8', dark: '#9e8b6b' },
};

const PIECE_FILE_MAP: Record<PieceType, string> = {
  king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: 'P',
};

export function getPieceImageUrl(piece: Piece, skin: PieceSkin): string {
  const prefix = piece.color === 'white' ? 'w' : 'b';
  return `https://lichess1.org/assets/piece/${skin}/${prefix}${PIECE_FILE_MAP[piece.type]}.svg`;
}

export const TIME_CONTROLS: (TimeControl | null)[] = [
  null,
  { minutes: 1, increment: 0 },
  { minutes: 1, increment: 1 },
  { minutes: 1, increment: 2 },
  { minutes: 2, increment: 0 },
  { minutes: 2, increment: 1 },
  { minutes: 2, increment: 2 },
  { minutes: 2, increment: 5 },
  { minutes: 5, increment: 0 },
  { minutes: 5, increment: 1 },
  { minutes: 5, increment: 2 },
  { minutes: 5, increment: 5 },
  { minutes: 10, increment: 0 },
  { minutes: 10, increment: 5 },
  { minutes: 15, increment: 0 },
  { minutes: 30, increment: 0 },
];

export function formatTimeControl(tc: TimeControl | null): string {
  if (!tc) return '∞';
  if (tc.increment === 0) return `${tc.minutes} min`;
  return `${tc.minutes}+${tc.increment}`;
}

export const CHESS_QUOTES = [
  { text: "Zawsze istnieje właściwe posunięcie. Trzeba je tylko znaleźć.", textEn: "There is always a correct move. You just have to find it.", author: "Ksawery Tartakower" },
  { text: "Gdy widzisz dobre posunięcie — poczekaj. Nie wykonuj go. Może znajdziesz lepsze.", textEn: "When you see a good move — wait. Don't play it. You might find a better one.", author: "Emanuel Lasker" },
  { text: "Mówi się, że życie jest zbyt krótkie, by je poświęcić szachom. Ale to już wina życia, a nie szachów.", textEn: "They say life is too short for chess. But that's life's fault, not chess's.", author: "W. E. Napier" },
  { text: "Szachy to życie w miniaturze. Szachy to walka, szachowe bitwy.", textEn: "Chess is life in miniature. Chess is struggle, chess is battles.", author: "Garry Kasparow" },
  { text: "Nauczcie dzieci grać w szachy, a o ich przyszłość możecie być spokojni.", textEn: "Teach children to play chess and you can be calm about their future.", author: "Paul Morphy" },
  { text: "Każdy mistrz szachowy był kiedyś początkującym.", textEn: "Every chess master was once a beginner.", author: "Irving Chernev" },
  { text: "Wszyscy szachiści są artystami.", textEn: "All chess players are artists.", author: "Marcel Duchamp" },
  { text: "Życie jest jak gra w szachy: po skończonej partii i królowie, i zwykłe pionki składane są do tego samego pudełka.", textEn: "Life is like a game of chess: after the game, both kings and pawns go into the same box.", author: "nieznany" },
  { text: "Szachy uczą życia. Uczą jak walczyć, jak iść na kompromis, jak się wycofać, by potem ruszyć do ataku.", textEn: "Chess teaches life. It teaches how to fight, compromise, retreat, and then attack.", author: "Frank Marshall" },
  { text: "Szachy przypominają życie, z tą różnicą, że w życiu myśląc, że jesteś królem, bywasz najczęściej pionkiem.", textEn: "Chess resembles life, except in life, when you think you're the king, you're usually a pawn.", author: "nieznany" },
  { text: "Dla mnie szachy są zarazem grą, sportem, nauką i sztuką. A może nawet czymś więcej.", textEn: "For me, chess is at once a game, a sport, a science, and an art. And perhaps even more.", author: "Bobby Fischer" },
  { text: "Nikt jeszcze nie wygrał partii przez poddanie się.", textEn: "Nobody ever won a game by resigning.", author: "nieznany" },
  { text: "Musisz zabrać przeciwnika w głąb ciemnego lasu, gdzie 2+2=5, a wyjście jest wystarczająco szerokie tylko dla jednego.", textEn: "You must take your opponent into a deep dark forest where 2+2=5 and the path out is only wide enough for one.", author: "Mikhail Tal" },
  { text: "Szachy to zwierciadło duszy — patrząc jak ktoś gra, widzisz jego istotę.", textEn: "Chess is a mirror of the soul — watching someone play, you see their essence.", author: "Miguel Najdorf" },
  { text: "W szachach — podobnie jak w każdym innym konflikcie — sukces opiera się na ataku.", textEn: "In chess — as in any other conflict — success is based on attack.", author: "Max Euwe" },
  { text: "Możesz powalić przeciwnika szachownicą, ale nie udowodnisz w ten sposób, że jesteś lepszym szachistą.", textEn: "You can knock your opponent out with the chessboard, but that doesn't prove you're a better player.", author: "nieznany" },
];
