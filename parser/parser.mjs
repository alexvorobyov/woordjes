import { readFileSync, writeFileSync } from "fs";

const extractorRegexp = /(.*)\(([^\)]+)\)\: (.*)/;
const content = readFileSync("words.txt", "utf8").split("\n");
const parsedData = {};

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

writeFileSync('../public/data.json', JSON.stringify(parsedData, null, 2));