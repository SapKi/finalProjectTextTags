var fs = require("fs");
var express = require("express");
var router = express.Router();

router.get("/:id", function (req, res, next) {
  var fileName = req.params.id;

  fs.readFile(
    "C:\\Users\\Yifat\\finalProject\\files\\articles\\" + fileName,
    function (err, data) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(data);
      return res.end();
    }
  );

  //res.send("laaaaaaaaaaaaaaaaassssssssssssssss");
});

module.exports = router;
