import { useEffect, useState } from "react";

import classnames from "classnames";

import styles from "./Woordjes.module.css";
import {
  DataItem,
  GameState,
  getEmptyGameState,
  getWordsGroups,
  processData,
  getRandomAnswers,
  WORDS_PER_GROUP,
} from "./utils";

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
