import { useEffect, useState } from "react";

import classnames from "classnames";

import styles from "./Woordjes.module.css";

const WORDS_PER_GROUP = 50;

interface DataItem {
  word: string;
  translation: string;
  example: string;
}

interface GameState {
  answerGiven?: DataItem | null;
  randomAnswers: DataItem[];
  groups: DataItem[][];
  currentGroupIndex: number;
  currentIndexInGroup: number;
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
    groups: [],
    currentGroupIndex: -1,
    currentIndexInGroup: 0,
    randomAnswers: [],
    stats: { correct: 0, total: 0 },
    answerGiven: null,
  };
}

function getRandomAnswers(
  shuffled: DataItem[],
  currentWord: DataItem,
): DataItem[] {
  return getShuffledWords(getFiveRandomItems(shuffled).concat(currentWord));
}

function getWordsGroups(words: DataItem[]): DataItem[][] {
  const groups: DataItem[][] = [];
  let currentGroup: DataItem[] = [];
  let counter = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (counter > WORDS_PER_GROUP) {
      currentGroup = [];
      groups.push(currentGroup);
      counter = 0;
    } else {
      currentGroup.push(word);
    }
    counter++;
  }
  if (currentGroup.length) {
    groups.push(currentGroup);
  }
  for (let i = 0; i < groups.length; i++) {
    groups[i] = getShuffledWords(groups[i]);
  }
  return groups;
}

export default function Woordjes() {
  const [words, setWords] = useState<DataItem[]>([]);
  const [gameState, setGameState] = useState<GameState>(getEmptyGameState());

  const currentWord =
    gameState.groups[gameState.currentGroupIndex]?.[
      gameState.currentIndexInGroup
    ] || null;

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        setWords(processData(data));
      });
  }, []);

  const resetGame = (groupIndexToSet?: number) => {
    const groups = getWordsGroups(words);
    const currentGroupIndex = groupIndexToSet || 0;
    setGameState({
      groups: groups,
      currentGroupIndex: currentGroupIndex,
      currentIndexInGroup: 0,
      randomAnswers: getRandomAnswers(words, groups[currentGroupIndex][0]),
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
    const currentGroup = gameState.groups[gameState.currentGroupIndex];
    let indexToSet = gameState.currentIndexInGroup + 1;
    if (indexToSet >= currentGroup.length) {
      indexToSet = 0;
    }

    setGameState((currentState) => ({
      ...currentState,
      currentIndexInGroup: indexToSet,
      randomAnswers: getRandomAnswers(words, currentGroup[indexToSet]),
      stats: stats,
      answerGiven: null,
    }));
  };

  if (!currentWord) {
    return (
      <button className={styles.newGame} onClick={() => resetGame()}>
        Go!
      </button>
    );
  }

  const stats = gameState.stats;
  return (
    <>
      <div className={styles.topMenu}>
        <button className={styles.startAgain} onClick={() => resetGame()}>
          Start again
        </button>
        <select
          className={styles.groupSelector}
          value={gameState.currentGroupIndex}
          onChange={(e) => resetGame(parseInt(e.target.value))}
        >
          {gameState.groups.map((group, index) => (
            <option key={index} value={index}>
              {`${WORDS_PER_GROUP * index + 1}-${WORDS_PER_GROUP * (index + 1)}`}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.stats}>
        {stats.correct}/{stats.total}
      </div>
      <div className={styles.gameContainer}>
        <div className={styles.currentWord}>{currentWord.word}</div>
        <div className={styles.buttonsContainer}>
          {gameState.randomAnswers.map((word, index) => (
            <button
              className={classnames(
                styles.button,
                gameState.answerGiven &&
                  currentWord.word === word.word &&
                  styles.correct,
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
          <>
            <div className={styles.answerExample}>
              {gameState.answerGiven.example}
            </div>
            <button
              className={classnames(styles.nextWord, styles.button)}
              onClick={() => nextWord()}
            >
              Next
            </button>
          </>
        )}
      </div>
    </>
  );
}
