var express = require("express");
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get("/", function (req, res, next) {
  //res.render("index", { title: "Express" });

  async function getFilesInDirectoty(path) {
    var strArticles = "";
    const dirArticlies = await fs.promises.opendir(path + "//articles");
    for await (const dirent of dirArticlies) {
      if (strArticles != "") {
        ` `;
        strArticles = strArticles + "," + dirent.name;
      } else {
        strArticles = dirent.name;
      }
    }

    var strConfig = "";
    const dirConfig = await fs.promises.opendir(path + "//configuration");
    for await (const dirent of dirConfig) {
      if (strConfig != "") {
        strConfig = strConfig + "," + dirent.name;
      } else {
        strConfig = dirent.name;
      }
    }
    res.send(strArticles + "\n" + strConfig);
  }
  //C:\\Users\\Yifat\\finalProject\\files
  getFilesInDirectoty(
    "C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files"
  ).catch(console.error);
});

module.exports = router;
