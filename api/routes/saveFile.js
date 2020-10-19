var express = require("express");
var router = express.Router();
var fs = require("fs");
var confLoader = require("../SettingsLoader");
var conf = new confLoader();

// saves an article on the server
router.post("/", function (req, res, next) {
  var data = "New File Contents";
  data = req.body.data;

  if (req.body.filename.endsWith("html")) {
    var pathOfFile =
      conf.getRootFolder() +
      "\\" +
      conf.getHtmlsFolder() +
      "\\" +
      req.body.filename;

    console.log(data);
    fs.writeFile(pathOfFile, data, "utf-8", (err) => {
      if (err) console.log(err);
      //console.log("Successfully Written to File.");
    });
  } else {
    var pathOfCleanText =
      conf.getRootFolder() +
      "\\" +
      conf.getCleanFilesFolder() +
      "\\" +
      req.body.filename;

    var pathOfTaggedText =
      conf.getRootFolder() +
      "\\" +
      conf.getArticlesFolder() +
      "\\" +
      req.body.filename;

    // If there is not a copy of the file at the clean files folder,
    // save the file to this folder as well.
    fs.exists(pathOfCleanText, (exist) => {
      if (!exist) {
        fs.writeFile(pathOfCleanText, data, "utf16le", (err) => {
          if (err) console.log(err);
          //console.log("Successfully Written to File.");
        });
      }
    });

    // Save the file in the acticles folder.
    fs.writeFile(pathOfTaggedText, data, "utf16le", (err) => {
      if (err) console.log(err);
      // console.log("Successfully Written to File.");
    });
  }
});

module.exports = router;
