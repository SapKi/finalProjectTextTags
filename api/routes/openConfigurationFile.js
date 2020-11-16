var fs = require("fs");
var express = require("express");
var router = express.Router();
var confLoader = require("../SettingsLoader");
var conf = new confLoader();

// returns to client the content of configuration file
router.get("/:id", function (req, res, next) {
  var fileName = req.params.id;
  let filePath =
    conf.getRootFolder() + "\\" + conf.getConfigurationsFolder() + "\\";

  fs.readFile(
    filePath + fileName,
    "utf-8",
    function (err, data) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(fileName + "\n");
      res.write(data);
      return res.end();
    }
  );
});

module.exports = router;
