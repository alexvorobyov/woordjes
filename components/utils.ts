export const WORDS_PER_GROUP = 50;

export interface DataItem {
  word: string;
  translation: string;
  example: string;
}

export interface GameState {
  answerGiven?: DataItem | null;
  randomAnswers: DataItem[];
  groups: DataItem[][];
  currentGroupIndex: number;
  currentIndexInGroup: number;
  stats: { correct: number; total: number };
}

export function processData(data: any): DataItem[] {
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

export function getFiveRandomItems(words: DataItem[]): DataItem[] {
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

export function getEmptyGameState(): GameState {
  return {
    groups: [],
    currentGroupIndex: -1,
    currentIndexInGroup: 0,
    randomAnswers: [],
    stats: { correct: 0, total: 0 },
    answerGiven: null,
  };
}

export function getRandomAnswers(
  shuffled: DataItem[],
  currentWord: DataItem,
): DataItem[] {
  return getShuffledWords(getFiveRandomItems(shuffled).concat(currentWord));
}

export function getWordsGroups(words: DataItem[]): DataItem[][] {
  const groups: DataItem[][] = [];
  let currentGroup: DataItem[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    currentGroup.push(word);
    if (currentGroup.length >= WORDS_PER_GROUP) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }
  }
  if (currentGroup.length) {
    groups.push(currentGroup);
  }
  for (let i = 0; i < groups.length; i++) {
    groups[i] = getShuffledWords(groups[i]);
  }
  return groups;
}

function getShuffledWords(words: DataItem[]): DataItem[] {
  return [...words].sort(() => 0.5 - Math.random());
}
