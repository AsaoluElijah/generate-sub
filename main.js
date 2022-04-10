/* eslint-disable prefer-promise-reject-errors */

require("dotenv").config();
const { Deepgram } = require("@deepgram/sdk");

const deepgram = new Deepgram(process.env.DEEPGRAM_KEY);

const fs = require("fs");
const crypto = require("crypto");

const randomStr = crypto.randomBytes(5).toString("hex");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

// modules
const translateTranscript = require("./modules/translate-transcript");
const downloadFile = require("./modules/download");

/** *
 * convertToAudio - asynchronously convert a video to an audio file
 * @param {string} videoInput - the video to convert
 * @param {string} audioOutput - the audio file to output
 * @returns {string} - success or error
 */

function convertToAudio(videoInput) {
  console.log("Converting video to audio...");

  return new Promise((resolve, reject) => {
    ffmpeg(videoInput)
      .output(`temp/aud-${randomStr}.mp3`)
      .on("end", () => {
        console.log("Video to audio conversion successfull ✅");
        resolve({
          status: "success",
          audioOutput: `temp/aud-${randomStr}.mp3`,
        });
      })
      .on("error", (err) => {
        console.log("Video to audio conversion failed ❌");
        reject({ status: "error", error: err });
      })
      .run();
  });
}

/** *
 * addSubToVideo - asynchronously add a subtitle to a video
 * @param {string} videoInput - the video to add the subtitle to
 * @param {string} srtInput - the subtitle to add to the video
 * @param {string} vidOutputPath - the path to output the video to
 * @returns {string} - success or error

 */

async function addSubToVideo(videoInput, srtInput, vidOutputPath) {
  console.log("Adding subtitle to original video file...");

  return new Promise((resolve, reject) => {
    ffmpeg(videoInput)
      .outputOptions(`-vf subtitles=${srtInput}:force_style='Fontsize=24'`)
      .save(vidOutputPath)
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        console.log("Successfully added translated subtitle to video file ✅");
        resolve("success");
      });
  });
}

/** *
 * generateTranscript - generate transcript for a video
 * @param {object} args - an object containing the arguments
 * @returns {string} - success or error
 */

const generateTranscript = async (args) => {
  console.time("Total Time");

  const videoInput = args.isURL
    ? await downloadFile(args.videoInput).catch((err) => console.log(err))
    : args.videoInput;

  const vidOutputPath = `temp/output-${randomStr}.mp4`;
  const srtOutputPath = `temp/temp-${randomStr}.srt`;

  const conversionRes = await convertToAudio(videoInput).catch((err) => ({
    status: "error",
    error: err,
  }));

  if (conversionRes.status === "success") {
    const audioFile = conversionRes.audioOutput;
    const audioBuffer = await fs.promises.readFile(audioFile);
    const audioSource = { buffer: audioBuffer, mimetype: "audio/mpeg" };

    console.log("Generating subtitle Deepgram...");

    const response = await deepgram.transcription.preRecorded(audioSource, {
      punctuate: true,
      utterances: true,
      language: args.inputLanguage ? args.inputLanguage : "en",
    });
    const srtTranscript = response.toSRT();

    if (srtTranscript.trim() === "") {
      return { status: "error", message: "cannot generate transcript" };
    }

    const translatedTranscript = await translateTranscript(
      srtTranscript,
      args.outputLanguage
    );

    await fs.promises.writeFile(srtOutputPath, translatedTranscript);

    try {
      await addSubToVideo(videoInput, srtOutputPath, vidOutputPath);

      // delete temp files in the background
      fs.unlink(audioFile, () => {
        // console.log("delete audio file");
      });
      console.log("--------------");
      console.log("All done! 🎉");
      console.log("--------------");
      console.timeEnd("Total Time");

      return {
        status: "success",
        video_path: vidOutputPath,
        srt_path: srtOutputPath,
      };
    } catch (error) {
      return { status: "error", message: error };
    }
  }
  return { status: "error", message: "cannot convert video to audio" };
};

// async function main() {
//   const vidOutputPath = await generateTranscript({
//     outputLanguage: "spanish",
//     videoInput: "./input/sample.mp4",
//     isURL: false,
//   });

//   console.log(vidOutputPath);
// }
// main();

module.exports = generateTranscript;
