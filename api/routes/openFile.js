var fs = require("fs");
var express = require("express");
var router = express.Router();
var confLoader = require("../SettingsLoader");
var conf = new confLoader();

router.get("/:id", function (req, res, next) {
  let fileName = req.params.id;
  console.log("in openFile:" + fileName);

  let filePath = conf.getRootFolder() + "\\" + conf.getArticlesFolder() + "\\";
  fs.readFile(
    //C:\\Users\\Yifat\\finalProject\\files\\articles\\
    //C: \\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\articles\\
    filePath + fileName,
    "utf16le",
    function (err, data) {
      console.log("filecontent = " + data);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(fileName + "\n");
      res.write(data);
      return res.end();
    }
  );

  //res.send("laaaaaaaaaaaaaaaaassssssssssssssss");
});

module.exports = router;
