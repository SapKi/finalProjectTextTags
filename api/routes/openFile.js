var fs = require("fs");
var express = require("express");
var router = express.Router();

router.get("/:id", function (req, res, next) {
  var fileName = req.params.id;
  console.log("in openFile:" + fileName);
  fs.readFile(
    //C:\\Users\\Yifat\\finalProject\\files\\articles\\
    //  "C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\articles\\"

    //C: \\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\articles\\
    "C:\\Users\\Yifat\\finalProject\\files\\articles\\" + fileName,
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
