var express = require("express");
var router = express.Router();
var fs = require("fs");
var confLoader = require("../SettingsLoader");
var conf = new confLoader();

// sends files to the client by request
router.post("/", function (req, res, next) {
  let action = req.body.action;
  let filename = req.body.filename;
  let confFileName = req.body.confFileName;
  let encoding = "utf16le";

  let filepath = conf.getRootFolder() + "\\";
  if (action == "clean file") {
    filepath += conf.getCleanFilesFolder() + "\\";
    filepath += filename;
  } else if (action == "tagged file") {
    filepath += conf.getArticlesFolder() + "\\";
    filepath += filename;
  } else if (action == "report") {
    filepath += conf.getstatisticsFolder() + "\\";
    filepath += filename + "_" + confFileName + ".xml";
  } else if (action == "html") {
    filepath += conf.getHtmlsFolder() + "\\";
    filepath += filename + ".html";
    encoding = "utf-8";
  }

  fs.readFile(filepath, encoding, function (err, data) {
    console.log("filecontent = " + data);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  });
});

module.exports = router;
