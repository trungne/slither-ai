import { useEffect, useRef, useState } from "react";
import { Direction, Position, Worm } from "../shared/types";
import { ARROW_KEYS, DIMENSION, MAX_FOODS } from "../shared/constants";
import {
  createFoodPosition,
  getBoxBackgroundColor,
  getNewPosition,
  getRandomFoodPositions,
  isSamePosition,
} from "../shared/utils";
import styles from "../styles/Home.module.css";
import lodash from "lodash";

const FPS = 1 * 60;
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

        e.preventDefault();
      }
      switch (e.key) {
        case "ArrowUp":
          if (mainDirectionRef.current === "UP") {
            return;
          }
          if (mainDirectionRef.current !== "DOWN") {
            mainDirectionRef.current = "UP";
          }
          break;
        case "ArrowDown":
          if (mainDirectionRef.current === "DOWN") {
            return;
          }
          if (mainDirectionRef.current !== "UP") {
            mainDirectionRef.current = "DOWN";
          }
          break;
        case "ArrowLeft":
          if (mainDirectionRef.current === "LEFT") {
            return;
          }
          if (mainDirectionRef.current !== "RIGHT") {
            mainDirectionRef.current = "LEFT";
          }
          break;
        case "ArrowRight":
          if (mainDirectionRef.current === "RIGHT") {
            return;
          }
          if (mainDirectionRef.current !== "LEFT") {
            mainDirectionRef.current = "RIGHT";
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

          const newHead = getNewPosition(newWorm[0], mainDirectionRef.current);
          let nextPosition: typeof newWorm[0] = newWorm[0];
          newWorm[0] = {
            ...newHead,
            direction: mainDirectionRef.current,
          };

          // assume the next position.
          // node 1 will assume position of node 0 (head)
          // node 2 will assume position of node 1, so on and so on
          for (let i = 1; i < newWorm.length; i++) {
            const temp = newWorm[i];
            newWorm[i] = nextPosition;
            nextPosition = temp;
          }

          const foodIdx = foodPositionsRef.current.findIndex((e) =>
            isSamePosition(e, newWorm[0])
          );

          if (foodIdx > -1) {
            newWorm.push(last);
            // remove food
            foodPositionsRef.current.splice(foodIdx, 1);

            // add new food
            const newFood = createFoodPosition([
              ...foodPositionsRef.current,
              ...newWorm,
            ]);
            foodPositionsRef.current.push(newFood);
          }
          blockChangeDirectionRef.current = false;
          const headDiv = document.querySelector(
            `#column-${newWorm[0].column}-row-${newWorm[0].row}`
          );
          headDiv?.scrollIntoView({ block: "center", inline: "center" });

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
    <main
      style={{
        gridTemplateRows: `repeat(${DIMENSION}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${DIMENSION}, minmax(0, 1fr))`,
      }}
      className="grid  grid-flow-dense"
    >
      {Array.from(Array(DIMENSION).keys()).map((row) => {
        return Array.from(Array(DIMENSION).keys()).map((column) => {
          const backgroundColor = getBoxBackgroundColor({
            boxPosition: { column: column, row: row },
            worm: mainWorm,
            foodPositions: foodPositionsRef.current,
          });

          return (
            <div
              id={`column-${column}-row-${row}`}
              key={`column-${column}-row-${row}`}
              className="aspect-square outline outline-1 outline-gray-500 "
              style={{ backgroundColor }}
            ></div>
          );
        });
      })}
    </main>
  );
};

export default Game;
