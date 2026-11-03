/** The rack grid from section 4: 10 x 10 cells, numbered 01-100 row by row from the top left. */
export const RACK_SIDE = 10;
export const RACK_CELLS = RACK_SIDE * RACK_SIDE;

/** The cell number at a 1-based row and column: row 1 is 01-10, row 2 is 11-20 and so on. */
export function rackCell(row: number, col: number): number {
  return (row - 1) * RACK_SIDE + col;
}

/** The 1-based row and column of a cell number. */
export function rackPosition(cell: number): { row: number; col: number } {
  return { row: Math.floor((cell - 1) / RACK_SIDE) + 1, col: ((cell - 1) % RACK_SIDE) + 1 };
}

/** How a cell number is written in a marking: always two digits, except 100. */
export function rackLabel(cell: number): string {
  return String(cell).padStart(2, "0");
}

/**
 * Where a key moves the focus in the grid, or undefined for keys the grid does not use.
 * Arrows stop at the edges; Home and End go to the ends of the row.
 */
export function rackMove(cell: number, key: string): number | undefined {
  const { row, col } = rackPosition(cell);
  switch (key) {
    case "ArrowLeft":
      return rackCell(row, Math.max(1, col - 1));
    case "ArrowRight":
      return rackCell(row, Math.min(RACK_SIDE, col + 1));
    case "ArrowUp":
      return rackCell(Math.max(1, row - 1), col);
    case "ArrowDown":
      return rackCell(Math.min(RACK_SIDE, row + 1), col);
    case "Home":
      return rackCell(row, 1);
    case "End":
      return rackCell(row, RACK_SIDE);
    default:
      return undefined;
  }
}
