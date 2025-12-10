import { useEffect, useState } from "react";

import classnames from "classnames";

import styles from "./Woordjes.module.css";

interface DataItem {
  word: string;
  translation: string;
  example: string;
}

interface GameState {
  answerGiven?: DataItem | null;
  randomWords: DataItem[];
  shuffledWords: DataItem[];
  shuffledWordsIndex: number;
  stats: { correct: number; total: number };
}

function processData(data: any): DataItem[] {
  const processed: DataItem[] = [];
  for (const word in data) {
    processed.push({
      word: word,
      translation: data[word].translation,
      example: data[word].example,
    });
  }
  return processed;
}

function getShuffledWords(words: DataItem[]): DataItem[] {
  return [...words].sort(() => 0.5 - Math.random());
}

function getFiveRandomItems(words: DataItem[]): DataItem[] {
  const result: DataItem[] = [];
  const length = words.length;

  if (length <= 5) {
    return words;
  }

  const usedIndices = new Set<number>();

  while (result.length < 5) {
    const randomIndex = Math.floor(Math.random() * length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      result.push(words[randomIndex]);
    }
  }

  return result;
}

function getEmptyGameState(): GameState {
  return {
    shuffledWords: [],
    shuffledWordsIndex: -1,
    randomWords: [],
    stats: { correct: 0, total: 0 },
    answerGiven: null,
  };
}

function getRandomWords(shuffled: DataItem[], index: number): DataItem[] {
  const currentWord = shuffled[index];
  return getShuffledWords(getFiveRandomItems(shuffled).concat(currentWord));
}

export default function Woordjes() {
  const [words, setWords] = useState<DataItem[]>([]);
  const [gameState, setGameState] = useState<GameState>(getEmptyGameState());

  const currentWord =
    gameState.shuffledWords[gameState.shuffledWordsIndex] || null;

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        setWords(processData(data));
      });
  }, []);

  const resetGame = () => {
    const newShuffled = getShuffledWords(words);
    setGameState({
      shuffledWords: newShuffled,
      shuffledWordsIndex: 0,
      randomWords: getRandomWords(newShuffled, 0),
      stats: { correct: 0, total: 0 },
    });
  };

  const giveAnswer = (answer: DataItem) => {
    const stats = {
      ...gameState.stats,
    };
    if (currentWord.word === answer.word) {
      stats.correct += 1;
    }
    stats.total += 1;
    setGameState((currentState) => ({
      ...currentState,
      answerGiven: answer,
      stats: stats,
    }));
  };

  const nextWord = () => {
    let indexToSet = gameState.shuffledWordsIndex + 1;
    if (indexToSet >= gameState.shuffledWords.length) {
      indexToSet = 0;
    }

    setGameState((currentState) => ({
      ...currentState,
      shuffledWordsIndex: indexToSet,
      randomWords: getRandomWords(gameState.shuffledWords, indexToSet),
      stats: stats,
      answerGiven: null,
    }));
  };

  if (!currentWord) {
    return (
      <button className={styles.newGame} onClick={() => resetGame()}>
        Start again
      </button>
    );
  }

  const stats = gameState.stats;
  return (
    <>
      <button className={styles.startAgain} onClick={() => resetGame()}>
        Start again
      </button>
      <div className={styles.stats}>
        {stats.correct}/{stats.total}
      </div>
      <div className={styles.gameContainer}>
        <div className={styles.currentWord}>{currentWord.word}</div>
        <div className={styles.buttonsContainer}>
          {gameState.randomWords.map((word, index) => (
            <button
              className={classnames(
                styles.button,
                gameState.answerGiven &&
                  currentWord.word === word.word &&
                  styles.correct
              )}
              disabled={Boolean(gameState.answerGiven)}
              key={index}
              onClick={() => giveAnswer(word)}
            >
              {word.translation}
            </button>
          ))}
        </div>
        {gameState.answerGiven && (
          <button
            className={classnames(styles.answerGiven, styles.button)}
            onClick={() => nextWord()}
          >
            Next
          </button>
        )}
      </div>
    </>
  );
}
