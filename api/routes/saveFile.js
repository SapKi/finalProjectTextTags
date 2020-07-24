var express = require("express");
var router = express.Router();
var fs = require("fs");

router.post("/", function (req, res, next) {
  //console.log("before");
  //console.log(req.body);
  //console.log("before");
  //res.writeHead(200, { "Content-Type": "text/html" });
  //res.write("hi");
  //return res.end();

  var data = "New File Contents";
  data = req.body.data;
  //"C:\\Users\\Yifat\\finalProject\\files\\articles\\"
  //"C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files\\articles\\"

  var filename =
    "C:\\Users\\Yifat\\finalProject\\files\\articles\\" + req.body.filename;

  console.log("data = " + data);
  console.log("filename = " + filename);
  fs.writeFile(filename, data, (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
});

module.exports = router;
