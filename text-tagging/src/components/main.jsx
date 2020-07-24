import React, { Component } from "react";
import Background from "../images/sandbackground1.png";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import ReactDOM from "react-dom";
import { throwStatement } from "@babel/types";

class Main extends Component {
  state = {
    filename: "",
    fileContent: "",
    fileContentClean: "",
    tagbox: "Enter text to mark",
    formattedparts: "",
    tags: {
      //person: "yellow",
      //place: "red",
      //bla: "lightpink",
      //date: "blue",
      //event: "purple"
    },
    tagsList: [],
    filesList: [],
    confFileList: [],
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
    apiResponse: "",
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
    let textFiles = files[0].split(",");
    let confFiles = files[1].split(",");
    this.setState({ filesList: textFiles });
    this.setState({ confFileList: confFiles });
    console.log("in arrageFileNamesRecivedFromServer");
  };

  handleClickOnUpload = () => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      var preview = document.getElementById("temporaryPlace");
      var file = document.querySelector("input[id=text_file]").files[0];
      var reader = new FileReader();
      var textHolder = "File Content hasnot set";

      var textFile = /text.*/;
      if (file.type.match(textFile)) {
        reader.onload = this.loadFile;
      } else {
        preview.innerHTML =
          "<span class='error'>It doesn't seem to be a text file!</span>";
      }
      reader.readAsText(file);
    } else {
      alert("Your browser is too old to support HTML5 File API");
    }
  };

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

  isSpecialChar = (character) => {
    let charArray = [" ", "\n", "\t", ".", ","];
    for (let i = 0; i < charArray.length; i++) {
      if (charArray[i] == character) {
        return true;
      }
    }
    return false;
  };

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

  addTag = (event, data) => {
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

  loadFile = (event) => {
    this.state.fileContent = event.target.result;
    this.state.filename = "tryUploadFile.txt";
    this.handleSaveFile(event);
    fetch("http://localhost:9000/")
      .then((res) => res.text())
      .then((res) => this.arrageFileNamesRecivedFromServer(res));
    //  this.fileContent = "";
    //  this.fileContentClean = "";
    //this.setState({ fileContent: event.target.result });
    //this.setState({ fileContentClean: event.target.result });
    //this.setTags();
  };

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

  createList = (list) => {
    return list.map((part, i) => <option value={part}> {part}</option>);
  };

  loadDataAndConfFiles = (eventArgs) => {
    var textFile = document.getElementById("fileChoser");
    textFile = textFile.value;
    this.handleChoosefile(textFile);
    var confFile = document.getElementById("conffileChoser");
    confFile = confFile.value;
    this.handleChoosefile(confFile);
  };

  handleChoosefile = (filename) => {
    var fileName = filename; //eventArgs.currentTarget.innerHTML.trim();
    if (!fileName.endsWith(".txt")) {
      var request = "http://localhost:9000/openConfigurationFile/" + fileName;
      fetch(request)
        .then((res) => res.text())
        .then((res) => this.acceptConfigurationFilesFromServer(res));
    } else {
      var request = "http://localhost:9000/openFile/" + fileName;
      fetch(request)
        .then((res) => res.text())
        .then((res) => this.acceptFilesFromServer(res));
    }
  };

  handleSaveFile = (eventArgs) => {
    let request = this.state.filename + "\n" + this.state.fileContentClean;
    let address = "http://localhost:9000/saveFile";

    fetch(address, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        data: this.state.fileContentClean,
        filename: this.state.filename,
      }),
    }).then(function (response) {
      let bla = response.body.getReader();
      console.log();
    });
    //.then(function (response) {
    //console.log(response);
    //});
  };

  acceptFilesFromServer = (text) => {
    let filename = text.split("\n", 2);
    //first chunk of text is the name
    this.setState({ filename: filename[0] });
    //the rest of the text
    this.setState({ fileContent: filename[1] });
    this.setState({ fileContentClean: filename[1] });
    this.setTags();
    //note
  };

  acceptConfigurationFilesFromServer = (text) => {
    let conFileContent = text;
    let newTags = {}; //person: "yellow", place: "red", bla: "lightpink", period: "green"};
    // Helps to create the context menu.
    let tagslist = [];

    let lines = conFileContent.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let currentPair = lines[i].split(":");
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

  render() {
    return (
      <React.Fragment>
        <div
          align="center"
          style={{ backgroundImage: `url(${Background})`, height: "100vh" }}
        >
          <br></br>
          <br></br>
          <h1>
            {" "}
            <b>Welcome to Tags Manager</b>{" "}
          </h1>
          <br></br>
          <div>
            <p>
              Choose article and configutation file or upload new atricle to the
              from local computer
            </p>
            <table>
              <tr>
                <td> Choose an article: </td>
                <td>
                  <select name="fileChoser" id="fileChoser">
                    {" "}
                    {this.createList(this.state.filesList)}
                  </select>{" "}
                </td>
              </tr>
              <tr>
                <td>Choose a configuration file</td>
                <td>
                  <select name="conffileChoser" id="conffileChoser">
                    {this.createList(this.state.confFileList)}{" "}
                  </select>
                </td>
              </tr>
              <tr>
                <td align="center" colspan="2">
                  <button onClick={this.loadDataAndConfFiles}>
                    {" "}
                    Load files
                  </button>
                </td>
                <td> </td>
              </tr>
            </table>
            <p>
              <button onClick={this.handleSaveFile}>
                {" "}
                Save Work on System
              </button>
            </p>
            <p>
              Upload New File to Server
              <input
                type="file"
                id="text_file"
                onChange={this.handleClickOnUpload}
              ></input>
            </p>
          </div>
          <table length="100%">
            <tr length="100%">
              <td length="25%"> </td>
              <td length="50%">
                {" "}
                <ContextMenuTrigger id="some_unique_identifier">
                  <div
                    id="text"
                    onClickCapture={this.captureHighlightedText}
                    style={{ backgroundColor: "white" }}
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
        </div>
      </React.Fragment>
    );
  }
}
export default Main;
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
