const translate = require("@vitalets/google-translate-api");
const { languages } = require("./languages");

/** *
 * getLanguageCode - get the language code for the desired language
 * @param {string} language - the language to get the code for
 * @returns {string} - the language code
 */

const getLanguageCode = (_language) => {
  let language = _language.toLowerCase();
  language = language.charAt(0).toUpperCase() + language.slice(1);

  if (languages.find((lang) => lang.name === language)) {
    return languages.find((lang) => lang.name === language).code;
  }
  return "not found";
};

/** *
 * translateTranscript - translate the transcript to the desired language
 * @param {string} srtTranscript - the srt transcript
 * @param {string} outputLanguage - the language to translate to
 * @returns {string} - the translated transcript
 */

const translateTranscript = async (srtTranscript, outputLanguage) => {
  console.log(`Translating subtitle to ${outputLanguage}`);
  const languageCode = getLanguageCode(outputLanguage);

  if (languageCode !== "not found") {
    try {
      const res = await translate(srtTranscript, { to: languageCode });

      // Format the transcript to a valid subtitle format
      let translatedTranscript = res.text;
      translatedTranscript = translatedTranscript
        .replace(/^ +/gm, "")
        .replace(/\:\s/g, ":");

      // formatting for ru and fr
      if (languageCode === "ru" || languageCode === "fr") {
        translatedTranscript = translatedTranscript.replace(
          /\s\d+\s/g,
          Math.floor(Math.random() * (999 - 100 + 1) + 100)
        );
      }

      // Replace the "->" with "-->"
      const find = "->";
      const re = new RegExp(find, "g");
      const formattedTranscript = translatedTranscript.replace(re, "-->");

      console.log("Subtitle translated successfully ✅");
      return formattedTranscript;
    } catch (err) {
      console.log("Error translating subtitle ❌\n", err);
    }
  }
  console.log(
    `Subtitle translation failed ❌\n${outputLanguage} language code is not found`
  );
  return null;
};

module.exports = translateTranscript;
