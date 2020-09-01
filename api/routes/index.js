var express = require("express");
var router = express.Router();
var fs = require("fs");
var confLoader = require("../SettingsLoader");
var conf = new confLoader();

/* GET home page. */
router.get("/", function (req, res, next) {
  //res.render("index", { title: "Express" });

  async function getFilesInDirectoty(path) {
    var strArticles = "";
    var conpath = path + "\\" + conf.getArticlesFolder();
    const dirArticlies = await fs.promises.opendir(conpath);
    for await (const dirent of dirArticlies) {
      if (strArticles != "") {
        ` `;
        strArticles = strArticles + "," + dirent.name;
      } else {
        strArticles = dirent.name;
      }
    }

    var strConfig = "";
    conpath = path + "\\" + conf.getConfigurationsFolder();
    const dirConfig = await fs.promises.opendir(conpath);
    for await (const dirent of dirConfig) {
      if (strConfig != "") {
        strConfig = strConfig + "," + dirent.name;
      } else {
        strConfig = dirent.name;
      }
    }
    res.send(strArticles + "\n" + strConfig + "\n" + conf.getSpecialChars());
  }
  //"C:\\Users\\Yifat\\finalProject\\files"
  //"C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files"
  //("C:\\Users\\Sapir\\Documents\\GitHub\\finalProject\\files");
  getFilesInDirectoty(conf.getRootFolder()).catch(console.error());
});

module.exports = router;
