const express = require("express");
const streamTweets = require("./bot");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/start-bot", (req, res) => {
  streamTweets("@generate_sub");
  res.send("Starting bot...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Example app listening on port 5000!"));
