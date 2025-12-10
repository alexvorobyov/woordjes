import { useEffect, useState } from "react";

import styles from "./Woordjes.module.css";

function processData(data) {
  const processed = [];
  for (const word in data) {
    processed.push({
      word: word,
      translation: data[word].translation,
      example: data[word].example,
    });
  }
  return processed;
}

function getShuffledWords(words) {
  return [...words].sort(() => 0.5 - Math.random());
}

function getFiveRandomItems(words) {
  const result = [];
  const length = words.length;

  if (length <= 5) {
    return words;
  }

  const usedIndices = new Set();

  while (result.length < 5) {
    const randomIndex = Math.floor(Math.random() * length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      result.push(words[randomIndex]);
    }
  }

  return result;
}

export default function Woordjes() {
  const [words, setWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [shuffledWordsIndex, setShuffledWordsIndex] = useState(-1);
  const [currentStats, setCurrentStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        setWords(processData(data));
      });
  }, []);

  const resetGame = () => {
    const newShuffled = getShuffledWords(words);
    setShuffledWords(newShuffled);
    setShuffledWordsIndex(0);
    setCurrentStats({ correct: 0, total: 0 });
  };

  const nextWord = (chosenWord) => {
    console.log(currentWord.word, chosenWord);
    if (currentWord.word === chosenWord) {
      setCurrentStats({
        correct: currentStats.correct + 1,
        total: currentStats.total + 1,
      });
    } else {
      setCurrentStats({
        correct: currentStats.correct,
        total: currentStats.total + 1,
      });
    }
    let indexToSet = shuffledWordsIndex + 1;
    if (indexToSet >= shuffledWords.length) {
      indexToSet = 0;
    }
    setShuffledWordsIndex(indexToSet);
  };

  const currentWord = shuffledWords[shuffledWordsIndex] || null;

  if (!currentWord) {
    return <button onClick={() => resetGame()}>Start again</button>;
  }

  const randomWords = getShuffledWords(
    getFiveRandomItems(shuffledWords).concat(currentWord)
  );

  return (
    <>
      <button className={styles.startAgain} onClick={() => resetGame()}>
        Start again
      </button>
      <div className={styles.stats}>
        {currentStats.correct}/{currentStats.total}
      </div>
      <div className={styles.gameContainer}>
        <div className={styles.currentWord}>{currentWord.word}</div>
        <div className={styles.buttonsContainer}>
          {randomWords.map((word, index) => (
            <button
              className={styles.button}
              key={index}
              onClick={() => nextWord(word.word)}
            >
              {word.translation}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
