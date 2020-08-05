var fs = require("fs");
var express = require("express");
var router = express.Router();
var confLoader = require("../SettingsLoader");
var conf = new confLoader();

router.get("/:id", function (req, res, next) {
  var fileName = req.params.id;
  let filePath =
    conf.getRootFolder() + "\\" + conf.getConfigurationsFolder() + "\\";

  fs.readFile(
    //C:\\Users\\Yifat\\finalProject\\files\\configuration\\
    // "C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\configuration\\" + fileName,
    filePath + fileName,
    "utf-8",
    function (err, data) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(fileName + "\n");
      res.write(data);
      return res.end();
    }
  );

  //res.send("laaaaaaaaaaaaaaaaassssssssssssssss");
});

module.exports = router;
