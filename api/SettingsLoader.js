var fs = require("fs");
const { runInThisContext } = require("vm");

class SettingsLoader {
  constructor() {
    this.appRootFolder = "";
    this.articlesFolder = "";
    this.confFileFolder = "";
    this.statisticsFolder = "";
    this.cleanFilesFolder = "";

    this.getRootFolder();
    //readFile
    fs.readFile("./appSetting.txt", "utf-8", this.readConfigurationFile);
  }

  readConfigurationFile = (err, data) => {
    let lines = data;
    lines = lines.split("\n");
    let dictSettings = {};

    // Read the files lines and add the settings in the lines
    // to the settings dictinary.
    for (let i = 0; i < lines.length; i++) {
      // Sepatate the line to a setting name and value.
      let separated = lines[i].split("=");

      if (!separated[0].startsWith("//") && separated.length >= 2) {
        // Get rid of accesive spaces.
        separated[0] = separated[0].trim();
        separated[1] = separated[1].trim();

        // Add the setting to the settings dictionaty.
        dictSettings[separated[0]] = separated[1];
      }
    }

    // Set the settings.
    this.appRootFolder = dictSettings["appRootFolder"];
    this.articlesFolder = dictSettings["articlesFolder"];
    this.confFileFolder = dictSettings["confFileFolder"];
    this.cleanFilesFolder = dictSettings["cleanFilesFolder"];
    this.statisticsFolder = dictSettings["statisticsFolder"];
  };

  getRootFolder() {
    return this.appRootFolder;
  }

  getArticlesFolder() {
    return this.articlesFolder;
  }

  getConfigurationsFolder() {
    return this.confFileFolder;
  }

  getCleanFilesFolder() {
    return this.cleanFilesFolder;
  }

  getstatisticsFolder() {
    return this.statisticsFolder;
  }
}
module.exports = SettingsLoader;
