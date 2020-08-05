var express = require("express");
var router = express.Router();
var fs = require("fs");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");

router.post("/", function (req, res, next) {
  var data = req.body.data;
  var filename = req.body.filename;
  var configurationFilename = req.body.confFileName;
  var configurationData = req.body.confData;
  makeReport(data, configurationData);
  //"C:\\Users\\Yifat\\finalProject\\files\\articles\\"
  //"C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\articles\\"

  console.log("data = " + data);
  console.log("filename = " + filename);
  fs.writeFile(filename, data, "utf16le", (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
});

function makeReport(filedata, confdata) {
  // Get all the tags from the configuration file.
  // let tags = confdata.split("\r");
  let tags = {};
  for (let i = 0; i < confdata.length; i++) {
    let separated = confdata[i].trim().split(":");
    tags[separated[0]] = separated[1];
  }

  // Creates the dictionary that will contain foir each tags its apperiance.
  // in the article.
  let dictTagsAppearnce = {};
  for (let i = 0; i < tags.length; i++) {
    // The keys in the dictionary are the tags names.
    // The value in the dictionary are a dictionary that maps
    // the tags text to the places its appeares.
    dictTagsAppearnce[tags[i]] = {};
  }

  // Separate the text to lines.
  let lines = filedata.split("\n");

  // Scan the text and find tgas.
  for (let i = 0; i < lines.length; i++) {
    let column = 0;

    // Declare regex that will help us find tags.
    let higlight = "<[^<]+>";
    let regexHiglight = RegExp(higlight);
    let closertag = "</[^<]+>";
    let regexclosetag = RegExp(closertag);

    // Find words suspected to be tags.
    let parts = text.split(new RegExp(`(${higlight})`, "gi"));

    for (let j = 0; j < parts.length; j++) {
      // If the current part is a tag.
      if (regexHiglight.test(parts[j])) {
        // Check if the next part is a text
      }
    }
  }
  var column = 0;
}
module.exports = router;
