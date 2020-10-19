import React, { Component } from "react";
import Background from "../images/backgroundabout.jpg";
import logo from "../images/logo.png";
import biulogo from "../images/biulogo.png";
import TaggedTextArea from "./taggedTextArea";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import ReactDOM from "react-dom";
import { throwStatement } from "@babel/types";
import "react-s-alert/dist/s-alert-default.css";
import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";

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
    // Holds infornation on the files are cuurently being worked on.
    filename: "",
    conffilename: "",
    fileContent: "",
    configurationFileContent: "",
    isUpTodate: true,

    // Holds te lists of files, configuration files, and spesial character,
    // the server have sent. ****
    filesList: [],
    confFileList: [],
    specialCharsList: [],

    // Holds the tags' names the user can tag the text with.
    // Each tag has its color.
    tagsList: [],
    tagsAndColors: {},

    // Used when a new file is uploaded to the server.
    fileToUploadName: "",
    fileToUploadContent: "",
    newlyUploadedFileName: "",
    
    // 
    pageLayout: "choose",
    actions: ["clean file", "tagged file", "report", "html"],
  };

  //the function thats doing the first fetch with th server
  callAPI() {
    console.log("in callApi");
    fetch("http://localhost:9000/")
      .then((res) => res.text())
      .then((res) => this.arrageFileNamesRecivedFromServer(res));
  }

  //this function lunches automaticly with the built in when the websie is running
  componentWillMount() {
    this.callAPI();
  }

  //initialize the articles list, the configuration files, and special cases based
  //on the data that received from server and held by filnames
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

  //lunches when the user clicks on the upload bottun -
  //saves the chosen file name and reads the dat of the file
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
  //saves the chosen fils name - calls to function that reads the file and transfer the appliction to
  //he edit screen
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

  //asks the server to generate statistic file to the file that the function describes
  handleStatisticsFile = (eventArgs) => {
    let address = "http://localhost:9000/makeReport";

    fetch(address, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        data: this.state.fileContent,
        filename: this.state.filename,
        confData: this.state.configurationFileContent,
        confFileName: this.state.conffilename,
      }),
    }).then(function (response) {
      let answer = response.body.getReader();
      console.log();
    });
  };

  //the function sends a request to the server to save the changes the user did in the text
  handleSaveFile = (eventArgs) => {
    let request = this.state.filename + "\n" + this.state.fileContent;
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
      fileTosaveData = this.state.fileContent;
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

  };

  //returns to the main menu screen of the application
  // retrunToChooseFile
  handleClickRetrunToMainMenu = (eventArgs) => {
    if (!this.state.isUpTodate) {
      this.handleClick1(eventArgs);
    } else {
      this.setState({ pageLayout: "choose" });
    }
    this.state.isUpTodate = true;
  };

  //describes a post request to server in order to download the chosen file type
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

  //recieved the file name with the file content and saves on local variables
  // previously called acceptFilesFromServer
  setCurrentTextFile = (text) => {
    let filename = text.split("\n");
    let fileData = text.slice(filename[0].length + 1, text.lenth);
    //first chunk of text is the name
    this.setState({ filename: filename[0] });
    //the rest of the text
    this.setState({ fileContent: fileData });
    //this.setTags();
    //note
  };

  //recives configurtion file name and this file content and saves to local variables
  // previously called acceptConfigurationFilesFromServer
  setCurrentConfigurationFile = (text) => {
    let filename = text.split("\n");
    this.setState({ conffilename: filename[0] });
    let conFileContent = filename.slice(1, filename.length);
    this.state.configurationFileContent = conFileContent;
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

    this.state.tagsAndColors = newTags;
    this.state.tagsList = tagslist;
    //this.setTags();
    // Initiate setState so the view will update.
    this.setState({ tagsAndColors: newTags });
  };

  //uploads new file to server and uses fetch request
  // previously called loadFile
  uploadFileToServer = (event) => {

    this.state.fileToUploadContent = event.target.result;
    this.state.newlyUploadedFileName = this.state.fileToUploadName;
    this.handleSaveFile(event);

    // Get the updated list of files on the server.
    fetch("http://localhost:9000/")
      .then((res) => res.text())
      .then((res) => this.arrageFileNamesRecivedFromServer(res))
      .then(() => this.UpdateChosenFile());
  };

  //describes the html form of the highlighted file
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
    });
  };

  /////#
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
      return this.returnTaggedTextArea();
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

  returnTaggedTextArea = () => {
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
        <TaggedTextArea
          tagsAndColors={this.state.tagsAndColors}
          tagsList={this.state.tagsList}
          specialCharsList={this.state.specialCharsList}
          fileContent={this.state.fileContent}
          updateFileContent={this.updateFileContent}
        />
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

  updateFileContent = (content) => {
    this.state.isUpTodate = false;
    this.setState({ fileContent: content });
  };

  // Gets a list of string and make a drop down option list of them.
  // Creates only the list of the drop down list <option>
  // and not the <select> drop down list itself.
  createList = (list) => {
    return list.map((part, i) => <option value={part}> {part}</option>);
  };
}
export default Main;
