import { useEffect, useRef, useState } from "react";
import { Direction, Position, Worm } from "../shared/types";
import { DIMENSION, MAX_FOODS } from "../shared/constants";
import {
  convertDirectionToInt,
  getBoxBackgroundColor,
  getNewPosition,
  getRandomFoodPositions,
  isSamePosition,
} from "../shared/utils";
import styles from "../styles/Home.module.css";

const ONE_SECOND = 1 * 100;
const Game = () => {
  const lastTimeStampRef = useRef<number>(0);

  const mainDirectionRef = useRef<Direction>("DOWN");
  const [mainWorm, setMainWorm] = useState<Worm>([
    { column: 5, row: 5, direction: mainDirectionRef.current },
  ]);
  const foodPositionsRef = useRef<Position[]>(
    getRandomFoodPositions(MAX_FOODS)
  );
  useEffect(() => {
    const listener = (e: globalThis.KeyboardEvent) => {
      if (!e || !e.key) {
        return;
      }
      switch (e.key) {
        case "ArrowUp":
          if (mainDirectionRef.current !== "DOWN") {
            mainDirectionRef.current = "UP";
          }
          break;
        case "ArrowDown":
          if (mainDirectionRef.current !== "UP") {
            mainDirectionRef.current = "DOWN";
          }
          break;
        case "ArrowLeft":
          if (mainDirectionRef.current !== "RIGHT") {
            mainDirectionRef.current = "LEFT";
          }
          break;
        case "ArrowRight":
          if (mainDirectionRef.current !== "LEFT") {
            mainDirectionRef.current = "RIGHT";
          }
          break;
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);
  useEffect(() => {
    const updateTimer = (timeStamp?: number) => {
      if (!timeStamp) {
        return;
      }
      if (timeStamp - lastTimeStampRef.current >= ONE_SECOND) {
        lastTimeStampRef.current = timeStamp;
        setMainWorm((prev) => {
          if (prev.length === 0) {
            return prev;
          }
          const newWorm = [...prev];

          for (let i = 1; i < newWorm.length; i++) {
            newWorm[i].column = newWorm[i - 1].column;
            newWorm[i].row = newWorm[i - 1].row;
            newWorm[i].direction = newWorm[i - 1].direction;
          }
          const newHead = getNewPosition(newWorm[0], mainDirectionRef.current);

          newWorm[0] = {
            ...newHead,
            direction: mainDirectionRef.current,
          };

          const foodIdx = foodPositionsRef.current.findIndex((e) =>
            isSamePosition(e, newWorm[0])
          );

          if (foodIdx > -1) {
            foodPositionsRef.current.splice(foodIdx, 1);
            const last = newWorm[newWorm.length - 1];
            const newNode = { ...last };
            if (newNode.direction === "DOWN" || newNode.direction === "UP") {
              const delta = convertDirectionToInt(newNode.direction);
              newNode.row += delta;
            } else {
              const delta = convertDirectionToInt(newNode.direction);
              newNode.column += delta;
            }
            newWorm.push(newNode);
          }
          return newWorm;
        });
      }
      requestAnimationFrame(updateTimer);
    };

    requestAnimationFrame(updateTimer);
  }, []);
  return (
    <div className={styles.container}>
      <main
        style={{
          gridTemplateRows: `repeat(${DIMENSION}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${DIMENSION}, minmax(0, 1fr))`,
          gridAutoFlow: "column",
        }}
        className="grid"
      >
        {Array.from(Array(DIMENSION).keys()).map((column) => {
          return Array.from(Array(DIMENSION).keys()).map((row) => {
            const backgroundColor = getBoxBackgroundColor({
              boxPosition: { column: column, row: row },
              worm: mainWorm,
              foodPositions: foodPositionsRef.current,
            });

            return (
              <div
                id={`column-${column}-row-${row}`}
                key={`column-${column}-row-${row}`}
                className=" aspect-square border border-solid border-gray-500"
                style={{ backgroundColor }}
              ></div>
            );
          });
        })}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Game;
