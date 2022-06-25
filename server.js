require("dotenv").config();
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParse = require("body-parser");
const users = require("./routers/users");
const util = require("util"); // import util
const exec = util.promisify(require("child_process").exec); // exec
const fs = require("fs");
const _ = require("lodash");

const getDirectories = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

//MiddleWare
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"),
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, PATCH, GET");
    return res.status(200).json({});
  }
  next();
});

//TEST
app.use(cors());
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());
app.use(morgan("dev"));

app.use("/users", users);

// HELLO
app.get("/", (req, res) => {
  res.status(200).send({ msg: "Hello" });
});

app.post("/sound", async (req, res) => {
  const { userInput } = req.body;

  const words = userInput.split(" ");
  const logger = fs.createWriteStream("log.txt");

  words.forEach((word) => {
    const newWord = word.toLowerCase().trim();
    const checkComma = newWord.split(",");

    checkComma.forEach(async (word) => {
      const finalWord = word === "" ? "delay_time" : word;
      console.log(finalWord);
      try {
        const files = await fs.promises.readdir(`./ed-sheeran/${finalWord}`);
        const wordVariant = _.sample(files);
        logger.write(`file ./ed-sheeran/${finalWord}/${wordVariant}\n`); // again
      } catch (error) {
        console.log(error);
      }
    });
  });

  await exec("ffmpeg -f concat -safe 0  -i log.txt -c copy -y -ac 1 out.wav");
});

(async () => {
  const userInput = "she kiss me, I love you";

  const words = userInput.split(" ");
  const logger = fs.createWriteStream("log.txt");

  words.forEach((word) => {
    const newWord = word.toLowerCase().trim();
    const checkComma = newWord.split(",");

    checkComma.forEach(async (word) => {
      const finalWord = word === "" ? "delay_time" : word;
      console.log(finalWord);
      try {
        const files = await fs.promises.readdir(`./ed-sheeran/${finalWord}`);
        const wordVariant = _.sample(files);
        logger.write(`file ./ed-sheeran/${finalWord}/${wordVariant}\n`);
      } catch (error) {
        console.log(error);
      }
    });
  });

  await exec("ffmpeg -f concat -safe 0  -i log.txt -c copy -y -ac 1 out.wav");
})();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Running Server at " + port));
