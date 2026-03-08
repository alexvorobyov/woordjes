import { readFileSync, writeFileSync } from "fs";

const parsedData = {};

const readFromFile = (filePath, isReverse = false) => {
  const content = readFileSync(filePath, "utf8").split("\n")[isReverse ? "reverse" : "slice"]();
  for (const line of content) {
    if (line.match(extractorRegexp)) {
      const [, dutchWord, translation, example] = extractorRegexp.exec(line);
      if (dutchWord && translation && example) {
        parsedData[dutchWord.trim()] = {
          translation: translation.trim(),
          example: example.trim(),
        };
      }
    }
  }
};

const extractorRegexp = /(.*)\(([^\)]+)\)\: (.*)/;
readFromFile("words.txt");
readFromFile("words2.txt", true);

writeFileSync("../public/data.json", JSON.stringify(parsedData, null, 2));
