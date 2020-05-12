import React, { Component } from "react";
import Background from "../images/sandbackground1.png";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import ReactDOM from "react-dom";
import { throwStatement } from "@babel/types";

class Main extends Component {
  state = {
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

  hadleClickOnUpload = () => {
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

  loadConfiguration = () => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      var preview = document.getElementById("temporaryPlace");
      var file = document.querySelector("input[id=config_file]").files[0];
      var reader = new FileReader();
      var textHolder = "File Content hasnot set";

      var textFile = /text.*/;
      if (file.type.match(textFile)) {
        reader.onload = this.tagsConvert;
      } else {
        preview.innerHTML =
          "<span class='error'>It doesn't seem to be a text file!</span>";
      }
      reader.readAsText(file);
    } else {
      alert("Your browser is too old to support HTML5 File API");
    }
  };
  //if (file.type.match(textFile)) {
  //  reader.onload = function(event) {
  //    preview.innerHTML = event.target.result;
  //    //this.setState({ fileContent: event.target.result });
  //  };
  //}
  tagsConvert = (eventTags) => {
    let conFileContent = eventTags.target.result;
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

  captureHighlightedText = (event, data) => {
    if (window.getSelection() == NaN) {
      return;
    }
    // The text is seperated to parts.
    // Get the index of the highlited text in his part.
    let leftIndexOfHighlightedChunkAtHisSpan = window.getSelection()
      .anchorOffset;
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

    let cleanText = this.state.fileContentClean;
    let preTag;
    let inTag;
    let postTag;

    // If the highlited text is not already tagged.
    if (this.state.formattedtext[spanOfHighlightedChunk][0] != "%") {
      indexOfCleanText += leftIndexOfHighlightedChunkAtHisSpan;
      preTag = cleanText.substring(0, indexOfCleanText);
      inTag = cleanText.substring(
        indexOfCleanText,
        indexOfCleanText + window.getSelection().toString().length
      );
      postTag = cleanText.substring(
        indexOfCleanText + window.getSelection().toString().length,
        cleanText.length
      );
      this.state.isHighlightedTextTagged = false;
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

    console.log("correct");

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
    this.setState({ fileContent: event.target.result });
    this.setState({ fileContentClean: event.target.result });
    this.setTags();
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
    return list.map((part, i) => (
      <li onClick={this.handleChoosefile}> {part} </li>
    ));
  };

  handleChoosefile = (eventArgs) => {
    var fileName = eventArgs.currentTarget.innerHTML.trim();
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

  acceptFilesFromServer = (text) => {
    this.setState({ fileContent: text });
    this.setState({ fileContentClean: text });
    this.setTags();
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
    //<button onClick={this.highlightText}> Highlight</button>
    //<input
    //id="tags"
    //type="text"
    //height="200"
    //width="200"
    //value={this.state.tagbox}
    //onChange={this.handleChange}
    //>
    //<button onClick={this.addTag}> Add tags</button>

    return (
      <React.Fragment>
        <div
          align="center"
          style={{ backgroundImage: `url(${Background})`, height: "100vh" }}
        >
          <br></br>
          <br></br>
          <h1> Manage Tags in Article</h1>
          <br></br>
          <div>
            <table>
              <tr>
                <td>
                  {" "}
                  <h5> Choose a file from the following files </h5>
                  {"          "}
                </td>
                <td>
                  {" "}
                  <h5>
                    {" "}
                    Choose a configutation file from the following files
                  </h5>{" "}
                </td>
              </tr>
              <tr>
                <td>
                  {" "}
                  <lu> {this.createList(this.state.filesList)} </lu>{" "}
                </td>
                <td>
                  {" "}
                  <lu> {this.createList(this.state.confFileList)} </lu>{" "}
                </td>
              </tr>
            </table>
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

/**
<p>
            Choose an article
            <input
              type="file"
              id="text_file"
              onChange={this.hadleClickOnUpload}
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
