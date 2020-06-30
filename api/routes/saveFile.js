var express = require("express");
var router = express.Router();

router.post("/", function (req, res, next) {
  console.log("before");
  console.log(req.body);
  console.log("before");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("hi");
  return res.end();
});

module.exports = router;
