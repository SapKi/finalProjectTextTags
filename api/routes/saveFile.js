var express = require("express");
var router = express.Router();
var fs = require("fs");

router.post("/", function (req, res, next) {
  var data = "New File Contents";
  data = req.body.data;
  //"C:\\Users\\Yifat\\finalProject\\files\\articles\\"
  //"C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\articles\\"

  var filename =
    "C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\articles\\" +
    req.body.filename;

  console.log("data = " + data);
  console.log("filename = " + filename);
  fs.writeFile(filename, data, "utf16le", (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
});

module.exports = router;
