var express = require("express");
var router = express.Router();
var fs = require("fs");
var confLoader = require("../SettingsLoader");
var conf = new confLoader();

router.post("/", function (req, res, next) {
  let action = req.body.action;
  let filename = req.body.filename;
  let confFileName = req.body.confFileName;

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
  }

  fs.readFile(filepath, "utf16le", function (err, data) {
    console.log("filecontent = " + data);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  });
});

module.exports = router;
