const generateTranscript = require("../main");

const args = process.argv.slice(2);
const videoPath = args[0].split("=")[1];
const language = args[1].split("=")[1];

console.log("Video path is", videoPath);
console.log("preferred lang is", language);

generateTranscript({
  outputLanguage: language,
  videoInput: videoPath,
});
