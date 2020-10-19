var express = require("express");
var router = express.Router();
var fs = require("fs");
var confLoader = require("../SettingsLoader");
var conf = new confLoader();
//const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");

// get a tagged article and a configuration file and make an xml file with the
// appearance of the tags
router.post("/", function (req, res, next) {
  let data = req.body.data;
  let filename = req.body.filename;
  let configurationFilename = req.body.confFileName;
  let configurationData = req.body.confData;

  let taggsDictionary = makeTagAppearienceDictionary(data, configurationData);
  let xml = makeXML(filename, configurationFilename, taggsDictionary);

  let savepath =
    conf.getRootFolder() + "\\" + conf.getstatisticsFolder() + "\\";
  savepath += filename + "_" + configurationFilename + ".xml";

  fs.writeFile(savepath, xml, "utf16le", (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });

  console.log("data = " + data);
  console.log("filename = " + filename);
  fs.writeFile(filename, data, "utf16le", (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
});

// creates dictionary that for each tag contain the appearance in the text
function makeTagAppearienceDictionary(filedata, confdata) {
  // Get all the tags from the configuration file.
  let tags = [];
  for (let i = 0; i < confdata.length; i++) {
    let separated = confdata[i].trim().split(":");
    tags.push(separated[0]);
  }

  // Creates the dictionary that will contain for each tags its apperiance
  // in the article.
  let dictTagsAppearnce = {};
  for (let i = 0; i < tags.length; i++) {
    // The keys in the dictionary are the tags names.
    // The value in the dictionary are a dictionary that maps
    // the tags text to the places its appeares.
    dictTagsAppearnce[tags[i]] = {};
  }

  // Separate the text to lines.
  let lines = filedata.split("\r");

  // Scan the text and find tgas.
  for (let i = 0; i < lines.length; i++) {
    let column = 1;

    // Declare regex that will help us find tags.
    let higlight = "<[^<]+>";
    let regexHiglight = RegExp(higlight);
    let closertag = "</[^<]+>";
    let regexclosetag = RegExp(closertag);

    // Find words suspected to be tags.
    lines[i] = lines[i].trim();
    let parts = lines[i].split(new RegExp(`(${higlight})`, "gi"));

    for (let j = 0; j < parts.length; j++) {
      // If the current part is a not a tag.
      if (!regexHiglight.test(parts[j])) {
        // add the part length to the colums counter.
        column += parts[j].length;
        // This part is a tag.
        // Checkes if this tag is a closing tag
      } else if (regexclosetag.test(parts[j])) {
        // We dont need to hadle.
        continue;
        // This tag is an open tag.
        // Checks if there is a space for a matching tag.
      } else if (j + 2 < parts.length) {
        // Checks if a closing tag exists at the right palce.
        if (regexclosetag.test(parts[j + 2])) {
          let openTag = parts[j].slice(1, parts[j].length - 1);
          let closeTag = parts[j + 2].slice(2, parts[j + 2].length - 1);
          let taggedExpretion = parts[j + 1];

          //  Checks of the closing tag matches the opening tag.
          if (openTag == closeTag) {
            // If this current tag exists in the dictionary of tags.
            if (openTag in dictTagsAppearnce) {
              // Add the taged expression to the dictionarry of this tag.
              // If the tagged expression is not already in the tag's dictionary.
              if (!(taggedExpretion in dictTagsAppearnce[openTag])) {
                // Add the tagged expression to the tag dictionary.
                dictTagsAppearnce[openTag][taggedExpretion] = [];
              }
              // Add the tagged expression's apperiance
              // to the tagged expression array.
              dictTagsAppearnce[openTag][taggedExpretion].push(
                "line: " + (i + 1) + " colunm: " + column
              );
              // This current tag does not exist in the dictionary of tags.
            } else {
              // todo check the answer from pnina to this mikre katse.
              // What if the tag does not appeare in the dictionary (configuraition file).            }
            }
          } else {
            // todo Ask pnina what to do when the start tag does not natch the end tag.
          }
        }
      } else {
        // todo There is no place to the closing tag, ask pnnina ehat todo
      }
    }
  }
  return dictTagsAppearnce;
}

// get the dictionary mapping between the tags and their appearance and creates xml
function makeXML(filename, conffilename, dicttags) {
  let tab = 0;
  let tabString = "";
  let xml = '<?xml version="1.0"?>\n';
  xml += "<statistic file>\n";
  tab++;
  tabString = getTabString(tab);
  xml += tabString + "<file-name> " + filename + " </file-name>\n";
  xml += tabString + "<conffile-name> " + conffilename + " </conffile-name>\n";

  let tags = Object.keys(dicttags);

  for (let i = 0; i < tags.length; i++) {
    xml += tabString + "<tag>\n";
    tab++;
    tabString = getTabString(tab);
    xml += tabString + "<tag-name> " + tags[i] + " </tag-name>\n";

    let taggedTexts = Object.keys(dicttags[tags[i]]);
    for (let j = 0; j < taggedTexts.length; j++) {
      xml += tabString + "<tagged-text>\n";
      tab++;
      tabString = getTabString(tab);
      xml += tabString + "<text> " + taggedTexts[j] + " </text>\n";

      let apeariences = dicttags[tags[i]][taggedTexts[j]];
      for (let k = 0; k < apeariences.length; k++) {
        // xml += tabString + "<location> " + apeariences[k] + " </location>\n";

        lineandcol = apeariences[k].split(" ");
        xml += tabString + "<line>" + lineandcol[1] + "</line>\n";
        xml += tabString + "<column>" + lineandcol[3] + "</column>\n";
      }

      tab--;
      tabString = getTabString(tab);
      xml += tabString + "</tagged-text>\n";
    }

    tab--;
    tabString = getTabString(tab);
    xml += tabString + "</tag>\n";
  }

  xml += "</statistic file>\n";
  return xml;
}

function getTabString(num) {
  let str = "";
  for (let i = 0; i < num; i++) {
    str += "\t";
  }
  return str;
}
module.exports = router;
