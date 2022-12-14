import { useEffect, useRef, useState } from "react";
import { Direction, Position, Worm } from "../shared/types";
import { ARROW_KEYS, DIMENSION, MAX_FOODS } from "../shared/constants";
import {
  convertDirectionToInt,
  createFoodPosition,
  getBoxBackgroundColor,
  getNewPosition,
  getRandomFoodPositions,
  isSamePosition,
} from "../shared/utils";
import styles from "../styles/Home.module.css";
import lodash from "lodash";

const FPS = 1 * 100;
const Game = () => {
  const lastTimeStampRef = useRef<number>(0);
  const blockChangeDirectionRef = useRef<boolean>(false);
  const mainDirectionRef = useRef<Direction>("DOWN");
  const [mainDirection, setMainDireciton] = useState<Direction>("DOWN");
  const [mainWorm, setMainWorm] = useState<Worm>([
    { column: 5, row: 5, direction: mainDirectionRef.current },
  ]);
  const foodPositionsRef = useRef<Position[]>(
    getRandomFoodPositions(MAX_FOODS)
  );
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const listener = (e: globalThis.KeyboardEvent) => {
      if (!e || !e.key || blockChangeDirectionRef.current) {
        return;
      }
      if (ARROW_KEYS.includes(e.key)) {
        blockChangeDirectionRef.current = true;
        timerId = setTimeout(() => {
          blockChangeDirectionRef.current = false;
        }, FPS);
      }
      switch (e.key) {
        case "ArrowUp":
          if (mainDirectionRef.current !== "DOWN") {
            mainDirectionRef.current = "UP";
            setMainDireciton("UP");
          }
          break;
        case "ArrowDown":
          if (mainDirectionRef.current !== "UP") {
            mainDirectionRef.current = "DOWN";
            setMainDireciton("DOWN");
          }
          break;
        case "ArrowLeft":
          if (mainDirectionRef.current !== "RIGHT") {
            mainDirectionRef.current = "LEFT";
            setMainDireciton("LEFT");
          }
          break;
        case "ArrowRight":
          if (mainDirectionRef.current !== "LEFT") {
            mainDirectionRef.current = "RIGHT";
            setMainDireciton("RIGHT");
          }
          break;
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, []);
  useEffect(() => {
    const updateTimer = (timeStamp?: number) => {
      if (!timeStamp) {
        return;
      }
      if (timeStamp - lastTimeStampRef.current >= FPS) {
        lastTimeStampRef.current = timeStamp;
        setMainWorm((prev) => {
          if (prev.length === 0) {
            return prev;
          }
          // do not remove clone deep here, trust me!
          const newWorm = lodash.cloneDeep(prev);

          const last = newWorm[newWorm.length - 1];

          const foodIdx = foodPositionsRef.current.findIndex((e) =>
            isSamePosition(e, newWorm[0])
          );

          const newHead = getNewPosition(newWorm[0], mainDirectionRef.current);
          let nextPosition: typeof newWorm[0] = newWorm[0];
          newWorm[0] = {
            ...newHead,
            direction: mainDirectionRef.current,
          };

          for (let i = 1; i < newWorm.length; i++) {
            const temp = newWorm[i];
            newWorm[i] = nextPosition;
            nextPosition = temp;
          }

          if (foodIdx > -1) {
            // remove food
            foodPositionsRef.current.splice(foodIdx, 1);

            // add new food
            const newFood = createFoodPosition(foodPositionsRef.current);
            foodPositionsRef.current.push(newFood);
            newWorm.push(last);
          }
          blockChangeDirectionRef.current = false;
          return newWorm;
        });
      }
      requestAnimationFrame(updateTimer);
    };

    const id = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(id);
    };
  }, [mainDirection]);
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
