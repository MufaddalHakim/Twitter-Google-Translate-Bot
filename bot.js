require('dotenv').config({path: __dirname + '/.env'})

const Twit = require("twit");
const {Translate} = require("@google-cloud/translate").v2;
const keys = require("./keys");
const config = require("./config");

const T = new Twit(config);
console.log("bot is running");
let translate = new Translate({projectId:keys.project_id, keyFilename:"./keys.json"});

const translateText = async (text, lang) => {
  try {
    let [response] = await translate.translate(text, lang);        
    return response;
  }
  catch (error) {
    console.log("error in translation- " + error);
  }
}

let user_id = process.env.user_id;
let params = {
  follow: [user_id],
  tweet_mode: "extended"
}

let stream = T.stream('statuses/filter', params);

stream.on('tweet', function(tweet) {
  if (tweet.user.id_str == user_id) {
      
    if (Object.getOwnPropertyNames(tweet).includes("retweeted_status") || Object.getOwnPropertyNames(tweet).includes("extended_tweet")) {
      return;
    }

    let text = tweet.extended_tweet.full_text;
    
    translateText(text, process.env.lang)
    .then((res) => {              
      T.post("statuses/update", {status: res}, (err, tweet, response) => {
        if (err) {
          console.log("error at post- " + err);
        }
        else {
          console.log(tweet.text);
        }
        return;
      })
    })
    .catch((err) => {
      console.log(err);
    })        

  }
})