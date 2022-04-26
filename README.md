# Captio: Video Subtitles in Different Languages

![](https://res.cloudinary.com/practicaldev/image/fetch/s--str7eEYy--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9zeekvbyhflxrmfm0xmv.png)
<br /><br />
Twitter bot x Cli program to generate subtitles in different languages.

## Installation

```bash
git clone https://github.com/AsaoluElijah/generate-sub captio
cd captio
npm install
```

### API Keys

Once the installation is completed, make sure to rename `.env.example` to `.env` and replace all the Twitter API keys and the Deepgram API key with yours.

> Learn how to retrieve your Twitter API keys [here](https://developer.twitter.com), and Deepgram's [here](https://developers.deepgram.com/) too. 

## Usage

### Cli

```bash
npm run start:cli video="path/to/video" language='spanish'
# Replace spanish with preferred language.
```

### Twitter Bot

```bash
npm start:bot
```

## License

MIT
