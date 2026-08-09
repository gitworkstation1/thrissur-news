"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check, Eraser, ArrowLeft } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";
type Grid = (number | 0)[][];

const CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 26,
};

function cloneGrid(g: Grid): Grid {
  return g.map((row) => [...row]);
}

function isSafe(grid: Grid, row: number, col: number, num: number): boolean {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num || grid[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillGrid(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const solution: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillGrid(solution);

  const puzzle = cloneGrid(solution);
  const clues = CLUES[difficulty];
  const cellsToRemove = 81 - clues;

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= cellsToRemove) break;
    puzzle[r][c] = 0;
    removed++;
  }

  return { puzzle, solution };
}

export default function SudokuPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [{ puzzle, solution }, setPuzzleState] = useState(() => generatePuzzle("easy"));
  const [board, setBoard] = useState<Grid>(() => cloneGrid(puzzle));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<"playing" | "won" | "wrong">("playing");

  const fixedCells = useMemo(() => {
    const set = new Set<string>();
    puzzle.forEach((row, r) =>
      row.forEach((val, c) => {
        if (val !== 0) set.add(`${r}-${c}`);
      })
    );
    return set;
  }, [puzzle]);

  const newGame = useCallback((diff: Difficulty) => {
    const generated = generatePuzzle(diff);
    setDifficulty(diff);
    setPuzzleState(generated);
    setBoard(cloneGrid(generated.puzzle));
    setSelected(null);
    setStatus("playing");
  }, []);

  const handleCellClick = (r: number, c: number) => {
    if (fixedCells.has(`${r}-${c}`)) return;
    setSelected([r, c]);
  };

  const handleNumberInput = (num: number) => {
    if (!selected) return;
    const [r, c] = selected;
    if (fixedCells.has(`${r}-${c}`)) return;

    const newBoard = cloneGrid(board);
    newBoard[r][c] = num;
    setBoard(newBoard);
    setStatus("playing");
  };

  const handleClear = () => {
    if (!selected) return;
    const [r, c] = selected;
    if (fixedCells.has(`${r}-${c}`)) return;
    const newBoard = cloneGrid(board);
    newBoard[r][c] = 0;
    setBoard(newBoard);
  };

  const checkSolution = () => {
    const isComplete = board.every((row) => row.every((v) => v !== 0));
    if (!isComplete) {
      setStatus("wrong");
      return;
    }
    const isCorrect = board.every((row, r) => row.every((v, c) => v === solution[r][c]));
    setStatus(isCorrect ? "won" : "wrong");
  };

  // Physical keyboard support (desktop typing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selected) return;
      const [r, c] = selected;

      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        handleNumberInput(parseInt(e.key, 10));
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        handleClear();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected([Math.max(0, r - 1), c]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected([Math.min(8, r + 1), c]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected([r, Math.max(0, c - 1)]);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelected([r, Math.min(8, c + 1)]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, board, fixedCells]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#111] px-4 py-6 flex flex-col items-center">
      <div className="w-full max-w-[360px] flex items-center mb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider hover:text-[#e3000f] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1">
        Sudoku
      </h1>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
        Fill the grid — each row, column & box needs 1-9
      </p>

      {/* Difficulty selector */}
      <div className="flex gap-2 mb-4">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => newGame(d)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${
              difficulty === d
                ? "bg-[#e3000f] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Status banner */}
      {status !== "playing" && (
        <div
          className={`mb-3 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
            status === "won"
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {status === "won" ? "🎉 Solved! Well done." : "Not quite right — keep trying."}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-9 border-2 border-gray-800 dark:border-gray-300 mb-4 select-none">
        {board.map((row, r) =>
          row.map((val, c) => {
            const isFixed = fixedCells.has(`${r}-${c}`);
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const borderRight = c % 3 === 2 && c !== 8 ? "border-r-2 border-r-gray-800 dark:border-r-gray-300" : "border-r border-r-gray-200 dark:border-r-gray-700";
            const borderBottom = r % 3 === 2 && r !== 8 ? "border-b-2 border-b-gray-800 dark:border-b-gray-300" : "border-b border-b-gray-200 dark:border-b-gray-700";

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold transition-colors outline-none
                  ${borderRight} ${borderBottom}
                  ${isFixed ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" : "bg-white dark:bg-[#1a1a1a] text-[#e3000f]"}
                  ${isSelected ? "ring-2 ring-inset ring-[#e3000f] bg-red-50 dark:bg-red-900/20" : ""}
                `}
              >
                {val !== 0 ? val : ""}
              </button>
            );
          })
        )}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-9 gap-1 mb-3 max-w-[360px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleNumberInput(n)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm hover:bg-[#e3000f] hover:text-white transition-colors"
          >
            {n}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider"
        >
          <Eraser className="w-3.5 h-3.5" /> Clear
        </button>
        <button
          onClick={checkSolution}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Check
        </button>
        <button
          onClick={() => newGame(difficulty)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#e3000f] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New Game
        </button>
      </div>
    </div>
  );
}