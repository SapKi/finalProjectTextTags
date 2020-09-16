import React, { Component } from "react";
import Background from "../images/backgroundabout.jpg";
import logo from "../images/logo.png";
import biulogo from "../images/biulogo.png";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import ReactDOM from "react-dom";
import { throwStatement } from "@babel/types";
import "react-s-alert/dist/s-alert-default.css";
import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";
//display: "none",
//  fontFamily: "Guttman Hatzvi",
//  width: "auto",
//  height: "25cm",
//  overflow: "scroll",
//  fontSize: "medium",
//  overflowY: "scroll",
//positionY: "absolute",
//positionX: "absolute",
//width: "auto",
//height: "100%",
//margin: "auto",

const divStyle = {
  color: "#5B6676",
  fontSize: "medium",
  fontFamily: "Arial",
  backgroundSize: "contain",
  overflowX: "hidden",
  height: "100vh",
  background: "url(shutterstock_125995700.jpg)",
  backgroundImage: `url(${Background})`,
};

const buttonStyle = {
  backgroundColor: "#74CDD1",
};
// backgroundSize: "100%",
class Main extends Component {
  state = {
    filename: "",
    conffilename: "",
    fileContent: "",
    fileContentClean: "",
    fileToUploadName: "",
    fileToUploadContent: "",
    newlyUploadedFileName: "",
    formattedparts: "",
    tags: {
      //person: "yellow",
      //place: "red",
      //bla: "lightpink",
      //date: "blue",
      //event: "purple"
    },
    configurationFileContentClean: "",
    tagsList: [],
    filesList: [],
    confFileList: [],
    specialCharsList: [],
    // Context menu
    contextMenu: "",
    // Used to keep the text the user marked
    preHighlightedText: "",
    highlightedText: "",
    postHighlightedText: "",
    //    leftIndex: -1,
    //    rightIndex: -1,
    //    begining: -1,
    //    end: -1,
    isHighlightedTextTagged: false,
    isUpTodate: true,
    apiResponse: "",
    pageLayout: "choose",
    actions: ["clean file", "tagged file", "report", "html"],
  };

  callAPI() {
    console.log("in callApi");
    fetch("http://localhost:9000/")
      .then((res) => res.text())
      .then((res) => this.arrageFileNamesRecivedFromServer(res));
  }

  componentWillMount() {
    this.callAPI();
  }

  arrageFileNamesRecivedFromServer = (fileNames) => {
    // Saperate the files to text files and configuration files.
    let files = fileNames.split("\n");

    // Seperate the text files names.
    let textFiles = files[0].split(",");

    // Seperates the configuration file names.
    let confFiles = files[1].split(",");

    // Seperate the spacial chars the marker will egnore.
    let spacialChars = files[2].split(" ");
    spacialChars.push(" ");
    spacialChars.push("\n");
    spacialChars.push("\r");

    this.setState({ filesList: textFiles });
    this.setState({ confFileList: confFiles });
    this.setState({ specialCharsList: spacialChars });
  };

  handleClickOnUpload = (event) => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // var preview = document.getElementById("temporaryPlace");
      var file = document.querySelector("input[id=text_file]").files[0];
      var reader = new FileReader();
      var textFile = /text.*/;

      var namefile = event.target.value;
      namefile = namefile.split("\\");
      this.state.fileToUploadName = namefile[namefile.length - 1];

      if (file.type.match(textFile)) {
        reader.onload = this.uploadFileToServer;
      }
      reader.readAsText(file);
    } else {
      alert("Your browser is too old to support HTML5 File API");
    }
  };

  // previously called loadDataAndConfFiles
  handleClickLoadFiles = (eventArgs) => {
    var textFile = document.getElementById("fileChoser");
    textFile = textFile.value;
    this.getFileFromServer(textFile);
    var confFile = document.getElementById("conffileChoser");
    confFile = confFile.value;
    this.getFileFromServer(confFile);
    this.state.isUpTodate = true;
    this.setState({ pageLayout: "edit" });
  };

  handleStatisticsFile = (eventArgs) => {
    let address = "http://localhost:9000/makeReport";

    fetch(address, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        data: this.state.fileContentClean,
        filename: this.state.filename,
        confData: this.state.configurationFileContentClean,
        confFileName: this.state.conffilename,
      }),
    }).then(function (response) {
      let answer = response.body.getReader();
      console.log();
    });
  };

  handleSaveFile = (eventArgs) => {
    let request = this.state.filename + "\n" + this.state.fileContentClean;
    let address = "http://localhost:9000/saveFile";

    let fileTosaveData = "";
    let fileTosaveName = "";

    // If the the save is of a new file
    if (this.state.fileToUploadContent != "") {
      fileTosaveData = this.state.fileToUploadContent;
      fileTosaveName = this.state.fileToUploadName;
      this.state.fileToUploadContent = "";
      this.state.fileToUploadName = "";
    } else {
      fileTosaveName = this.state.filename;
      fileTosaveData = this.state.fileContentClean;
      this.handleStatisticsFile("");
      this.makeHtml();
    }

    fetch(address, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        data: fileTosaveData,
        filename: fileTosaveName,
      }),
    }).then(function (response) {
      let answer = response.body.getReader();
      console.log();
    });

    this.state.isUpTodate = true;

    //    var message = new Notification("RandomString");
    //    message.onclick = function () {
    //      alert("Random Message");
    //    };
    //.then(function (response) {
    //console.log(response);
    //});
  };

  // retrunToChooseFile
  handleClickRetrunToMainMenu = (eventArgs) => {
    if (!this.state.isUpTodate) {
      this.handleClick1(eventArgs);
    } else {
      this.setState({ pageLayout: "choose" });
    }
    this.state.isUpTodate = true;
  };

  handleClickOnDownload = (eventArgs) => {
    var action = document.getElementById("actionChooser");
    action = action.value;
    var filename = document.getElementById("fileToDownloadChooser");
    filename = filename.value;
    var conffilename = document.getElementById("conffileToDownloadChooser");
    conffilename = conffilename.value;

    let downloadedFileName = action + "_" + filename;
    if (action == "html") {
      downloadedFileName = filename + ".html";
    }

    let address = "http://localhost:9000/downloadfile";
    fetch(address, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        action: action,
        filename: filename,
        confFileName: conffilename,
      }),
    }).then((response) => {
      response.blob().then((blob) => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = downloadedFileName;
        a.click();
      });
    });
  };

  //  downloadEmployeeData = () => {
  //    fetch('http://localhost:8080/employees/download')
  //      .then(response => {
  //        response.blob().then(blob => {
  //          let url = window.URL.createObjectURL(blob);
  //          let a = document.createElement('a');
  //          a.href = url;
  //          a.download = 'employees.json';
  //          a.click();
  //        });
  //        //window.location.href = response.url;
  //    });
  //  }

  // previously called acceptFilesFromServer
  setCurrentTextFile = (text) => {
    let filename = text.split("\n");
    let fileData = text.slice(filename[0].length + 1, text.le);
    //first chunk of text is the name
    this.setState({ filename: filename[0] });
    //the rest of the text
    this.setState({ fileContent: fileData });
    this.setState({ fileContentClean: fileData });
    this.setTags();
    //note
  };

  // previously called acceptConfigurationFilesFromServer
  setCurrentConfigurationFile = (text) => {
    let filename = text.split("\n");
    this.setState({ conffilename: filename[0] });
    let conFileContent = filename.slice(1, filename.length);
    this.state.configurationFileContentClean = conFileContent;
    let newTags = {}; //person: "yellow", place: "red", bla: "lightpink", period: "green"};

    // Helps to create the context menu.
    let tagslist = [];

    for (let i = 0; i < conFileContent.length; i++) {
      let currentPair = conFileContent[i].split(":");
      tagslist.push(currentPair[0]);
      let pairKey = currentPair[0];
      let pairValue = currentPair[1];
      newTags[pairKey] = pairValue;
    }

    this.state.tags = newTags;
    this.state.tagsList = tagslist;
    this.setTags();
    // Initiate setState so the view will update.
    this.setState({ tags: newTags });
  };

  // previously called loadFile
  uploadFileToServer = (event) => {
    //this.state.fileContent = event.target.result;
    //this.state.fileContentClean = event.target.result;
    // this.state.fileToUploadContent =

    this.state.fileToUploadContent = event.target.result;
    this.state.newlyUploadedFileName = this.state.fileToUploadName;
    this.handleSaveFile(event);

    // Get the updated list of files on the server.
    fetch("http://localhost:9000/")
      .then((res) => res.text())
      .then((res) => this.arrageFileNamesRecivedFromServer(res))
      .then(() => this.UpdateChosenFile());
  };

  makeHtml = () => {
    var textFile = document.getElementById("text");
    textFile = textFile.innerHTML;
    var htmlFile = "";
    htmlFile += "<!DOCTYPE html>";
    htmlFile += "<html>";
    htmlFile += "<head>";
    htmlFile += "<title>";
    htmlFile += this.state.filename;
    htmlFile += "</title>";
    htmlFile += "</head>";
    htmlFile += "<body>";
    htmlFile += "<h3>";
    htmlFile += textFile;
    htmlFile += "</h3>";
    htmlFile += "</body>";
    htmlFile += "</html>";

    let address = "http://localhost:9000/saveFile";
    fetch(address, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        data: htmlFile,
        filename: this.state.filename + ".html",
      }),
    }).then(function (response) {
      let answer = response.body.getReader();
      console.log();
    });
  };

  UpdateChosenFile = (res) => {
    // If the list of files sent from the server had the file was added to the server.
    const exists = this.state.filesList.some(
      (v) => v == this.state.newlyUploadedFileName
    );
    if (exists) {
      var textFile = document.getElementById("fileChoser");
      textFile.value = this.state.newlyUploadedFileName;
    }
  };

  //previously called handleChoosefile.
  getFileFromServer = (filename) => {
    var fileName = filename; //eventArgs.currentTarget.innerHTML.trim();
    if (!fileName.endsWith(".txt")) {
      var request = "http://localhost:9000/openConfigurationFile/" + fileName;
      fetch(request)
        .then((res) => res.text())
        .then((res) => this.setCurrentConfigurationFile(res));
    } else {
      var request = "http://localhost:9000/openFile/" + fileName;
      fetch(request)
        .then((res) => res.text())
        .then((res) => this.setCurrentTextFile(res));
    }
  };

  // Recognise the text the user Highlights, and the text segments that
  // comes before and after the Highlighted text.
  captureHighlightedText = (event, data) => {
    if (window.getSelection() == NaN) {
      return;
    }

    // The text is seperated to parts.
    // Get the index of the highlited text in his part.
    let leftIndexOfHighlightedChunkAtHisSpan;
    let rightIndexOfHighlightedChunkAtHisSpan;
    if (
      window.getSelection().baseOffset <= window.getSelection().extentOffset
    ) {
      leftIndexOfHighlightedChunkAtHisSpan = window.getSelection().baseOffset;
      rightIndexOfHighlightedChunkAtHisSpan = window.getSelection()
        .extentOffset;
    } else if (
      window.getSelection().baseOffset > window.getSelection().extentOffset
    ) {
      leftIndexOfHighlightedChunkAtHisSpan = window.getSelection().extentOffset;
      rightIndexOfHighlightedChunkAtHisSpan = window.getSelection().baseOffset;
    }

    // Get the part number the highlited text is in.
    let spanOfHighlightedChunk = window.getSelection().anchorNode.parentElement
      .id;

    //calculate the offset from the beggining of the text
    let indexOfCleanText = 0;
    for (let i = 0; i < spanOfHighlightedChunk; i++) {
      //checking chunk if its not start with % we summing the length
      if (this.state.formattedtext[i][0] != "%") {
        indexOfCleanText += this.state.formattedtext[i].length;
      } else {
        let currentChunk = this.state.formattedtext[i].split("%");
        let tagLength = currentChunk[1].length;
        let textlength = currentChunk[2].length;
        indexOfCleanText = indexOfCleanText + textlength + 2 * tagLength + 5;
      }
    }

    // indexOfCleanTextc contains the location of the first caracter chosen in the text as
    // it in raw text.

    // Sreaching for the begining of the highlighted word.
    let cleanText = this.state.fileContentClean;
    let begining;
    // If the first chracter is in a begining of a chunk.
    if (leftIndexOfHighlightedChunkAtHisSpan == 0) {
      begining = indexOfCleanText;
    } else {
      let indexToFindTheHighligtedWordStart = leftIndexOfHighlightedChunkAtHisSpan;
      for (
        ;
        indexToFindTheHighligtedWordStart >= 0;
        indexToFindTheHighligtedWordStart--
      ) {
        // we reached the befining of the current paragraph.
        if (indexToFindTheHighligtedWordStart == 0) {
          begining = indexOfCleanText;
          // If we reached a space character.
        } else {
          let previousChar =
            cleanText[indexOfCleanText + indexToFindTheHighligtedWordStart - 1];
          //(!(previousChar.match(/[a-z]/i) || previousChar.match(/[0-9]/)))
          if (this.isSpecialChar(previousChar)) {
            //  previousChar == " " ||
            //  previousChar == "\n" ||
            //  previousChar == "\t"
            begining = indexOfCleanText + indexToFindTheHighligtedWordStart;
            break;
          }
        }
      }
    }

    let textInChunk = window.getSelection().baseNode.data;
    let end;
    //in case of automatic space added by clicking
    if (
      rightIndexOfHighlightedChunkAtHisSpan !=
        leftIndexOfHighlightedChunkAtHisSpan &&
      this.isSpecialChar(
        cleanText[indexOfCleanText + rightIndexOfHighlightedChunkAtHisSpan - 1]
      )
      //(cleanText[
      //  indexOfCleanText + rightIndexOfHighlightedChunkAtHisSpan - 1
      //] == " " ||
      //  cleanText[
      //    indexOfCleanText + rightIndexOfHighlightedChunkAtHisSpan - 1
      //  ] == "\t" ||
      //  cleanText[
      //    indexOfCleanText + rightIndexOfHighlightedChunkAtHisSpan - 1
      //  ] == "\n")
    ) {
      end = indexOfCleanText + rightIndexOfHighlightedChunkAtHisSpan - 1;
    } else if (rightIndexOfHighlightedChunkAtHisSpan == textInChunk.length) {
      // If the last chracter is in the end of a chunk.
      end = indexOfCleanText + textInChunk.length;
    } else {
      let indexToFindTheHighligtedWordEnd = rightIndexOfHighlightedChunkAtHisSpan;
      for (
        ;
        indexToFindTheHighligtedWordEnd <= textInChunk.length;
        indexToFindTheHighligtedWordEnd++
      ) {
        // If we reached the end of the paragraph.
        if (indexToFindTheHighligtedWordEnd == textInChunk.length) {
          end = indexOfCleanText + textInChunk.length;
          // If we reached a white space.
        } else {
          let nextChar =
            cleanText[indexOfCleanText + indexToFindTheHighligtedWordEnd];
          if (this.isSpecialChar(nextChar)) {
            //nextChar == " " || nextChar == "\n" || nextChar == "\t")
            end = indexOfCleanText + indexToFindTheHighligtedWordEnd;
            break;
          }
        }
      }
    }

    let preTag;
    let inTag;
    let postTag;

    // If the highlited text is not already tagged.
    if (this.state.formattedtext[spanOfHighlightedChunk][0] != "%") {
      preTag = cleanText.substring(0, begining);
      inTag = cleanText.substring(begining, end);
      postTag = cleanText.substring(end, cleanText.length);
      this.state.isHighlightedTextTagged = false;
      //indexOfCleanText += leftIndexOfHighlightedChunkAtHisSpan;
      //preTag = cleanText.substring(0, indexOfCleanText);
      //inTag = cleanText.substring(
      //  indexOfCleanText,
      //  indexOfCleanText + window.getSelection().toString().length
      //);
      //postTag = cleanText.substring(
      //  indexOfCleanText + window.getSelection().toString().length,
      //  cleanText.length
      //);
      //this.state.isHighlightedTextTagged = false;
    } else {
      let currentChunk = this.state.formattedtext[spanOfHighlightedChunk].split(
        "%"
      );
      let tagLength = currentChunk[1].length;
      preTag = cleanText.substring(0, indexOfCleanText);
      inTag = cleanText.substring(
        indexOfCleanText + tagLength + 2,
        indexOfCleanText +
          this.state.formattedtext[spanOfHighlightedChunk].length
      );
      postTag = cleanText.substring(
        indexOfCleanText +
          this.state.formattedtext[spanOfHighlightedChunk].length +
          tagLength +
          3,
        cleanText.length
      );
      this.state.isHighlightedTextTagged = true;
    }
    this.state.leftIndex = leftIndexOfHighlightedChunkAtHisSpan;
    this.state.rightIndex = rightIndexOfHighlightedChunkAtHisSpan;
    this.state.begining = begining;
    this.state.end = end;
    this.setState({ preHighlightedText: preTag });
    this.setState({ highlightedText: inTag });
    this.setState({ postHighlightedText: postTag });
  };

  // When a user Highlights text segment and choose to tag that segment,
  // this function is called.
  // Tthe funtion update the whole text so the highlight segment will be
  // serroiunded by a tag.
  addTag = (event, data) => {
    this.state.isUpTodate = false;
    let tagName = window.getSelection().anchorNode.parentElement.id;
    let text;
    if (tagName != "no_tag") {
      text =
        this.state.preHighlightedText +
        "<" +
        tagName +
        ">" +
        this.state.highlightedText +
        "</" +
        tagName +
        ">" +
        this.state.postHighlightedText;
    } else {
      text =
        this.state.preHighlightedText +
        this.state.highlightedText +
        this.state.postHighlightedText;
    }
    this.state.fileContentClean = text;
    this.setTags();
    this.setState({ fileContentClean: text });
  };

  // This funtiuos reads the clean text (with the tags), and turns it to the
  // form which the text is representd to the user.
  setTags = () => {
    let text = this.state.fileContentClean;
    let higlight = "<[^<]+>";
    let regexHiglight = RegExp(higlight);
    let closertag = "</[^<]+>";
    let regexclosetag = RegExp(closertag);
    let par;
    let spanIndex = 0;

    //Split on higlight term and include term into parts, ignore case
    let parts = text.split(new RegExp(`(${higlight})`, "gi"));
    let formattedparts = [];

    for (let index = 0; index < parts.length; index++) {
      //cheking that the current part is not a tag
      if (
        !(regexHiglight.test(parts[index]) && !regexclosetag.test(parts[index]))
      ) {
        if (parts[index] != "") formattedparts.push(parts[index]);
      }
      // handeling an open tag
      else {
        let currenttag = parts[index];
        //building the inner tag - cuts inner text
        currenttag = currenttag.substring(1, currenttag.length - 1);
        let rightclosertag = "</" + currenttag + ">";
        let regExpRightcloser = RegExp(rightclosertag);
        //we want to keep running on string until we'll meet the right closer tag
        let newindex = index + 1;
        while (
          !regExpRightcloser.test(parts[newindex]) &&
          newindex < parts.length
        ) {
          newindex++;
        }
        //if the closing tag matches the opening tag found
        if (newindex < parts.length) {
          //builds the new string for injection
          let newstring = "%" + currenttag + "%";

          for (
            let innerindex = index + 1;
            innerindex < newindex;
            innerindex++
          ) {
            newstring = newstring + parts[innerindex];
          }

          formattedparts.push(newstring);
          index = newindex;
        } else {
          //if theres no closing tag to a tag so we copy the opening tag as it is
          formattedparts.push(parts[index]);
        }
      }
    }

    //console.log("correct");

    let tagRegex = RegExp("%.+%.+");
    let taggedText = (
      <div>
        {" "}
        {formattedparts.map((part, i) => (
          <span
            key={i}
            id={i}
            style={
              tagRegex.test(part)
                ? //divopentag.test(part.toLowerCase()) || divclosingtag.test(part.toLowerCase())
                  //part.toLowerCase() === higlight.toLowerCase()
                  {
                    fontWeight: "bold",
                    backgroundColor: this.state.tags[part.split("%")[1]],
                  }
                : {}
            }
          >
            {part.split("%").reverse()[0]}
          </span>
        ))}
      </div>
    );
    this.setState({ formattedtext: formattedparts });
    this.setState({ fileContent: taggedText });
  };

  isSpecialChar = (character) => {
    if (character == "\n") {
      let i = 0;
    }
    for (let i = 0; i < this.state.specialCharsList.length; i++) {
      if (this.state.specialCharsList[i] == character) {
        return true;
      }
    }
    return false;
  };

  //alert capara
  handleClick1(e) {
    e.preventDefault();
    Alert.info(
      "Make sure to save your changes before returning to the Main Menu",
      {
        position: "top",
        timeout: "none",
        onClose: function () {
          console.log("onClose Fired!");
        },
      }
    );
  }

  // Render the frame of the site and get the cueent page from the method this.returnPageLayout()
  render() {
    return (
      <React.Fragment>
        <div align="center" style={divStyle}>
          <img
            align="right"
            src={biulogo}
            alt="biulogo"
            style={{ width: "auto", height: "0.75cm" }}
          />
          <img align="left" src={logo} alt="logo" />
          <br></br>
          <br></br>
          <h2>
            {" "}
            <b>Jerusalem Knowledge Center</b>{" "}
          </h2>
          <h1>
            <b>Tag Editor</b>
          </h1>
          {this.returnPageLayout()}
          <div>
            <span>{this.props.children}</span>
            <Alert stack={{ limit: 3 }} />
          </div>
        </div>
      </React.Fragment>
    );
  }

  // Returns the current page the web sites has to present.
  returnPageLayout = () => {
    if (this.state.pageLayout == "choose") {
      return this.returnMainMenuLayout();
    } else if (this.state.pageLayout == "edit") {
      return this.returnEditFileLayout();
    }
  };
  // Returns the page
  returnMainMenuLayout = () => {
    let page = (
      <div>
        <br></br>
        <table>
          <tr>
            <td align="center">
              {" "}
              <b>1. Select an existing document</b>{" "}
            </td>
            <td>
              <select name="fileChoser" id="fileChoser">
                {" "}
                {this.createList(this.state.filesList)}
              </select>{" "}
            </td>
          </tr>
          <tr>
            <td align="center">
              <b> -or- </b>{" "}
            </td>
            <td> </td>
          </tr>
          <tr>
            <td align="center">
              <b>
                Upload New File to Server <br></br>{" "}
              </b>
            </td>
            <td>
              {" "}
              <input
                type="file"
                id="text_file"
                onChange={this.handleClickOnUpload}
              ></input>
            </td>
          </tr>
          <br></br>
          <tr>
            <td>
              <b> 2. Choose a configuration file: </b>
            </td>
            <td>
              <select name="conffileChoser" id="conffileChoser">
                {this.createList(this.state.confFileList)}{" "}
              </select>
            </td>
          </tr>
          <tr>
            <td> </td>
            <td align="left">
              <br></br>
              <button style={buttonStyle} onClick={this.handleClickLoadFiles}>
                {" "}
                Load files
              </button>
            </td>
          </tr>
        </table>
        <br></br>
        <p>
          <b>Download file</b>
          <br></br>
          <select name="actionChooser" id="actionChooser">
            {" "}
            {this.createList(this.state.actions)}
          </select>{" "}
          <select name="fileToDownloadChooser" id="fileToDownloadChooser">
            {" "}
            {this.createList(this.state.filesList)}
          </select>{" "}
          <select
            name="conffileToDownloadChooser"
            id="conffileToDownloadChooser"
          >
            {this.createList(this.state.confFileList)}{" "}
          </select>
          {"  "}
          <button style={buttonStyle} onClick={this.handleClickOnDownload}>
            {" "}
            Download file{" "}
          </button>
        </p>
        <table>
          <td align="left">
            {" "}
            <h6>
              {" "}
              <b>© Sapir Kikoz, Yifat Yankovich - </b>
            </h6>{" "}
          </td>
          <td align="right">
            {" "}
            <h6> September 2020 </h6>
          </td>
        </table>
      </div>
    );
    return page;
  };
  //colspan="2">
  returnEditFileLayout = () => {
    let page = (
      <div>
        <h6>
          {" "}
          <b>
            Choosen Article: {this.state.filename}
            <br></br>
            Choosen Configuration File: {this.state.conffilename}
          </b>
        </h6>

        <br></br>
        <h6>
          {" "}
          <b>Add or edit tags by selecting and right clicking the text.</b>{" "}
        </h6>
        <table length="100%">
          <tr length="100%">
            <td length="25%"> </td>
            <td length="50%">
              {" "}
              <ContextMenuTrigger id="some_unique_identifier">
                <div
                  id="text"
                  onClickCapture={this.captureHighlightedText}
                  style={{
                    backgroundColor: "white",
                    borderStyle: "solid",
                    height: "8cm",
                    width: "30cm",
                    overflowY: "scroll",
                    overflowX: "hidden",
                  }}
                >
                  {this.state.fileContent}
                </div>{" "}
              </ContextMenuTrigger>
              <ContextMenu id="some_unique_identifier">
                {this.createMenu()}
              </ContextMenu>
            </td>
            <td length="25%"> </td>
          </tr>
        </table>
        <p>
          <button style={buttonStyle} onClick={this.handleSaveFile}>
            {" "}
            Save Work on System
          </button>
          {"     "}
          <button
            style={buttonStyle}
            onClick={this.handleClickRetrunToMainMenu}
          >
            {" "}
            Return to Main Menu
          </button>
          <div>
            <a
              href="#"
              onClick={this.handleClick1}
              onClose={this.handleOnClose}
            ></a>
          </div>
        </p>
      </div>
    );
    return page;
  };

  // Creates a menu that appears when the user press the right click.
  // Creates only the menu items and not the menu itself.
  // The menu created depends on the value of this.state.isHighlightedTextTagged
  // that dends on the valye of this.state.highlightedText
  // If the highlighted text is not serrounded by a tag, the menu contains
  // all the tags avaliable, and if not, the menu contains only the option
  // "remove tag:.
  createMenu = () => {
    let menu;
    if (this.state.isHighlightedTextTagged == false) {
      menu = this.state.tagsList.map((part, i) => (
        <MenuItem key={i} id={part} onClick={this.addTag}>
          {" "}
          <div id={part} style={{ backgroundColor: "white" }}>
            Set as {part}{" "}
          </div>
        </MenuItem>
      ));
    } else {
      menu = (
        <MenuItem id="no_tag" onClick={this.addTag}>
          {" "}
          <div id="no_tag" style={{ backgroundColor: "white" }}>
            Remove tag{" "}
          </div>
        </MenuItem>
      );
    }
    return menu;
  };

  // Gets a list of string and make a drop down option list of them.
  // Creates only the list of the drop down list <option>
  // and not the <select> drop down list itself.
  createList = (list) => {
    return list.map((part, i) => <option value={part}> {part}</option>);
  };
}
export default Main;

// UI before sepsration to pages.
//<div
//align="center"
//style={{ backgroundImage: `url(${Background})`, height: "100vh" }}
//>
//<br></br>
//<br></br>
//<h1>
//  {" "}
//  <b>Welcome to Tags Manager</b>{" "}
//</h1>
//<br></br>
//<div>
//  <h5>
//    Choose article and configutation file or upload new atricle to the
//    from local computer
//  </h5>
//  <table>
//    <tr>
//      <td> Choose an article: </td>
//      <td>
//        <select name="fileChoser" id="fileChoser">
//          {" "}
//          {this.createList(this.state.filesList)}
//        </select>{" "}
//      </td>
//    </tr>
//    <tr>
//      <td>Choose a configuration file</td>
//      <td>
//        <select name="conffileChoser" id="conffileChoser">
//          {this.createList(this.state.confFileList)}{" "}
//        </select>
//      </td>
//    </tr>
//    <tr>
//      <td align="center" colspan="2">
//        <button onClick={this.handleClickLoadFiles}>
//          {" "}
//          Load files
//        </button>
//      </td>
//      <td> </td>
//    </tr>
//  </table>
//  <br></br>
//</div></div>  <p>
//    Upload New File to Server
//</p>    <input
//      type="file"
//      id="text_file"
//      onChange={this.handleClickOnUpload}
//    ></input>
//  </p>
//</div>
//</div><table length="100%">
//</table>  <tr length="100%">
//    <td length="25%"> </td>
//</tr>    <td length="50%">
//      {" "}
//</td>      <ContextMenuTrigger id="some_unique_identifier">
//</ContextMenuTrigger>       <div
//          id="text"
//          onClickCapture={this.captureHighlightedText}
//          style={{ backgroundColor: "white" }}
//        >
//          {this.state.fileContent}
//        </div>{" "}
//      </ContextMenuTrigger>
//      <ContextMenu id="some_unique_identifier">
//        {this.createMenu()}
//      </ContextMenu>
//    </td>
//    <td length="25%"> </td>
//  </tr>
//</table>
//<p>
//  <button onClick={this.handleSaveFile}> Save Work on System</button>
//</p>
//</div>

// for debug
//          <dir> startIndex: {this.state.leftIndex} </dir>
//          <dir> endIndex: {this.state.rightIndex} </dir>
//          <dir> begining: {this.state.begining} </dir>
//          <dir> end: {this.state.end} </dir>
//          <dir> pre: {this.state.preHighlightedText} </dir>
//          <dir> in: {this.state.highlightedText} </dir>
//          <dir> post: {this.state.postHighlightedText}</dir>

//onClick={this.captureHighlightedText}

/**
<p>
            Choose an article
            <input
              type="file"
              id="text_file"
              onChange={this.handleClickOnUpload}
            ></input>
          </p>
          <p>
            Choose Configuration file
            <input
              type="file"
              id="config_file"
              onChange={this.loadConfiguration}
            ></input>
          </p>
           */
//onDoubleClickCapture={this.captureHighlightedText}

// loadConfiguration = () => {
//   if (window.File && window.FileReader && window.FileList && window.Blob) {
//    var preview = document.getElementById("temporaryPlace");
//   var file = document.querySelector("input[id=config_file]").files[0];
//   var reader = new FileReader();
//   var textHolder = "File Content hasnot set";

//  var textFile = /text.*/;
//  if (file.type.match(textFile)) {
//   reader.onload = this.tagsConvert;
// } else {
//  preview.innerHTML =
//   "<span class='error'>It doesn't seem to be a text file!</span>";
// }
// reader.readAsText(file);
//} else {
//  alert("Your browser is too old to support HTML5 File API");
// }
// };
//if (file.type.match(textFile)) {
//  reader.onload = function(event) {
//    preview.innerHTML = event.target.result;
//    //this.setState({ fileContent: event.target.result });
//  };
//}
// tagsConvert = (eventTags) => {
// let conFileContent = eventTags.target.result;
// let newTags = {}; //person: "yellow", place: "red", bla: "lightpink", period: "green"};
// Helps to create the context menu.
// let tagslist = [];

//let lines = conFileContent.split("\n");
//for (let i = 0; i < lines.length; i++) {
//  let currentPair = lines[i].split(":");
//  tagslist.push(currentPair[0]);
//  let pairKey = currentPair[0];
//  let pairValue = currentPair[1];
//  newTags[pairKey] = pairValue;
//}

//this.state.tags = newTags;
//this.state.tagsList = tagslist;
//this.setTags();
// Initiate setState so the view will update.
//this.setState({ tags: newTags });
//};

// highlightText = () => {
//   let textHolder = this.fileContentClean;
//   this.setState({
//     fileContent: this.getHighlightedText(textHolder, this.state.tagbox)
//   });
// };

//handleChange = event => {
//  this.setState({ tagbox: event.target.value });
//};

//getHighlightedText = (data, mark) => {
//  //console.log(this);
//  let text = data;
//  let higlight = mark; //this.state.tagbox;
//  // Split on higlight term and include term into parts, ignore case
//  let parts = text.split(new RegExp(`(${higlight})`, "gi"));
//  let taggedText = (
//    <div>
//      {" "}
//      {parts.map((part, i) => (
//        <span
//          key={i}
//          id={i}
//          style={
//            part.toLowerCase() === higlight.toLowerCase()
//              ? {
//                  fontWeight: "bold",
//                  backgroundColor: this.state.tagbox[part]
//                }
//              : {}
//          }
//        >
//          {part}
//        </span>
//      ))}{" "}
//    </div>
//  );
//  return taggedText;
//};
//
