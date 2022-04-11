/* eslint-disable operator-linebreak */
const { ETwitterStreamEvent, TwitterApi } = require("twitter-api-v2");
const config = require("./modules/config");
const generateTranscript = require("./main");

const userClient = new TwitterApi(config);

/**
 * Get a tweet information by id
 * @param {string} id - the id of the tweet
 * @returns {Promise<object>}
 */

const getTweet = async (tweetIdStr) => {
  const tweet = await userClient.v1.singleTweet(tweetIdStr);
  return tweet;
};

/**
 * Send a tweet with a video attached
 * @param {string} videoPath - the path to the video
 * @param {string} srtPath - the path to the srt file
 * @returns {Promise<boolean>}
 */

const sendVideoTweet = async (toTweetId, tweetText, videoPath) => {
  const mediaIdVideo = await userClient.v1.uploadMedia(videoPath, {
    mimeType: "video/mp4",
  });

  const response = await userClient.v1.reply(tweetText, toTweetId, {
    media_ids: mediaIdVideo,
  });
  return response;
};

/**
 * Stream tweets from user, check if they contain a video, and send a tweet with the video attached
 * @param {string} tweetsFrom - the user name to stream tweets from
 * @returns {Promise<void>}
 */
const streamTweets = async (tweetsFrom) => {
  console.log(`Started streaming tweets from ${tweetsFrom}`);
  try {
    const stream = await userClient.v1.filterStream({
      track: tweetsFrom,
    });
    stream.autoReconnect = true;

    stream.on(ETwitterStreamEvent.Data, async (tweet) => {
      const senderName = tweet.user.screen_name;
      const senderTweetId = tweet.id_str;

      console.log(`New mention from @${senderName} 🔔`);

      // get preferred language from tweet
      let language = tweet.text.trim().split(" ");
      language = language[language.length - 1];

      console.log(`Language: ${language}`);

      // get original tweet
      const ogTweet = await getTweet(tweet.in_reply_to_status_id_str);
      // Check if original tweet contains a video

      if (
        ogTweet.extended_entities &&
        ogTweet.extended_entities.media[0].type === "video"
      ) {
        console.log("Original tweet contains a video 🎬");

        // get video url with type mp4
        const ogTweetVidURL =
          ogTweet.extended_entities.media[0].video_info.variants.filter(
            (res) => res.content_type === "video/mp4"
          )[0].url;

        // console.log("ogTweetVidURL: ", ogTweetVidURL);

        const response = await generateTranscript({
          outputLanguage: language,
          videoInput: ogTweetVidURL,
          isURL: true,
        });

        // update generateTranscript to send response as object and do:
        if (response.status === "success") {
          const videoPath = response.video_path;
          const srtPath = response.srt_path;
          const tweetText = `Hi @${senderName} here's your video with translated transcript:`;

          const replyResult = sendVideoTweet(
            senderTweetId,
            tweetText,
            videoPath,
            srtPath
          );
          if (replyResult) {
            console.log("Tweet sent ✅\n");
          }
        }
      } else {
        console.log("Original tweet does not contain a video 🚫");
        // tweet does not contain video
      }
    });
  } catch (error) {
    console.log(`Error code: ${error.code}\nError: ${error.error}`);

    // error is mostly caused by twitter exceeded connection limit.
    // reconnect after 15min
    setTimeout(() => {
      streamTweets(tweetsFrom);
    }, 1000 * 60 * 15);
  }
};

streamTweets("@generate_sub");
