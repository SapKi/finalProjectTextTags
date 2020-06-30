var fs = require("fs");
var express = require("express");
var router = express.Router();

router.get("/:id", function (req, res, next) {
  var fileName = req.params.id;

  fs.readFile(
    // C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\configuration\\
    "C:\\Users\\Yifat\\finalProject\\files\\configuration\\" + fileName,
    function (err, data) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(data);
      return res.end();
    }
  );

  //res.send("laaaaaaaaaaaaaaaaassssssssssssssss");
});

module.exports = router;
