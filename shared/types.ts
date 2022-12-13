export type Position = {
  column: number;
  row: number;
};

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type TailNode = Position & { direction: Direction };
export type Snake = {
  head: Position;
  tail: TailNode[];
};

export type Worm = (Position & { direction: Direction })[];
