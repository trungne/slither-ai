import { CSSProperties } from "react";
import { DIMENSION } from "./constants";
import { Direction, Position, Worm } from "./types";

export const isSamePosition = (positionA: Position, positionB: Position) => {
  return (
    positionA.column === positionB.column && positionA.row === positionB.row
  );
};

export const getNewPosition = (
  curPosition: Position,
  curDirection: Direction
): Position => {
  const { column, row } = curPosition;
  let newColumn = column;
  let newRow = row;

  if (curDirection === "DOWN") {
    newRow++;
  }
  if (curDirection === "UP") {
    newRow--;
  }
  if (curDirection === "RIGHT") {
    newColumn++;
  }
  if (curDirection === "LEFT") {
    newColumn--;
  }

  if (newColumn >= DIMENSION) {
    newColumn = 0;
  } else if (newColumn < 0) {
    newColumn = DIMENSION - 1;
  }

  if (newRow >= DIMENSION) {
    newRow = 0;
  } else if (newRow < 0) {
    newRow = DIMENSION - 1;
  }

  return {
    row: newRow,
    column: newColumn,
  };
};

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const getRandomPosition = (): Position => {
  return {
    row: getRandomInt(0, DIMENSION),
    column: getRandomInt(0, DIMENSION),
  };
};

export const getRandomFoodPositions = (numberOfFood: number) => {
  const foodPositions: Position[] = [];
  for (let i = 0; i < numberOfFood; i++) {
    const position = getRandomPosition();
    if (!foodPositions.includes(position)) {
      foodPositions.push(position);
    }
  }

  return foodPositions;
};

export const createFoodPosition = (currentPositionList: Position[]) => {
  let position = getRandomPosition();

  while (currentPositionList.includes(position)) {
    position = getRandomPosition();
  }

  return position;
};

export const addFood = () => {};

export const getBoxBackgroundColor = ({
  boxPosition,
  worm,
  foodPositions,
}: {
  boxPosition: Position;
  worm: Worm;
  foodPositions: Position[];
}): CSSProperties["backgroundColor"] => {
  for (const foodPos of foodPositions) {
    if (isSamePosition(boxPosition, foodPos)) {
      return "orange";
    }
  }

  if (isSamePosition(boxPosition, worm[0])) {
    return "red";
  }

  for (let i = 1; i < worm.length; i++) {
    if (isSamePosition(boxPosition, worm[i])) {
      return "blue";
    }
  }

  return "gray";
};

