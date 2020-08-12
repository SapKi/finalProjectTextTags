var express = require("express");
var router = express.Router();
var fs = require("fs");
var confLoader = require("../SettingsLoader");
var conf = new confLoader();

router.post("/", function (req, res, next) {
  var data = "New File Contents";
  data = req.body.data;

  var filename =
    conf.getRootFolder() +
    "\\" +
    conf.getArticlesFolder() +
    "\\" +
    req.body.filename;

  console.log("data = " + data);
  console.log("filename = " + filename);
  fs.writeFile(filename, data, "utf16le", (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
});

module.exports = router;
