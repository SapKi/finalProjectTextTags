import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

class taggedTextArea extends Component {
  state = {
    // Used to keep the text the user marked
    preHighlightedText: "",
    highlightedText: "",
    postHighlightedText: "",

    preHtmlFormatedText: [],
    newLineCharacterLength: 1,

    isHighlightedTextTagged: false,
    isUpTodate: true,
  };

  isSpecialChar = (character) => {
    if (character == "\n") {
      let i = 0;
    }
    for (let i = 0; i < this.props.specialCharsList.length; i++) {
      if (this.props.specialCharsList[i] == character) {
        return true;
      }
    }
    return false;
  };

  // This funtiuos reads the clean text (with the tags), and turns it to the
  // form which the text is representd to the user.
  // separateTaggedFromUntaggedText
  setTags = () => {
    if (this.props.fileContent === "") {
      return;
    }

    let text = this.props.fileContent;
    let lines = this.separateIntoLines(text);

    // Work on each line seperately.
    // Convert every line to a format that later will be converted,
    // to an html format.
    let convertedLine = "";
    let convertedLines = [];
    let htmlFormLines = [];
    for (let index = 0; index < lines.length; index++) {
      convertedLine = this.separateTaggedFromUntaggedText(lines[index]);
      convertedLines.push(convertedLine);
      htmlFormLines.push(this.makeHtmlForm(index, convertedLine));
    }

    this.state.preHtmlFormatedText = convertedLines;

    let htmlForm = (
      <React.Fragment>
        {htmlFormLines.map((line, i) => (
          <span key={i} id={i}>
            {line}
            <br />
          </span>
        ))}
        <br />
      </React.Fragment>
    );

    return htmlForm;
  };

  separateIntoLines = (text) => {
    // Fist check if the new line character is \n\r
    let regexIsSpace = RegExp("\r\n");
    let lines = text.split(regexIsSpace);
    this.state.newLineCharacterLength = 2;

    // If the new line character is not \n\r
    if (lines.length == 1) {
      // The new line character is \n or \r.
      regexIsSpace = RegExp("\n|\r");
      lines = text.split(regexIsSpace);
      this.state.newLineCharacterLength = 1;
    }

    return lines;
  };

  separateTaggedFromUntaggedText = (text) => {
    let higlight = "<[^<]+>";
    let regexIstag = RegExp(higlight);
    let regexIsCloseTag = RegExp("</[^<]+>");
    let formattedparts = [];

    // Seperates plain text from tags.
    let parts = text.split(new RegExp(`(${higlight})`, "gi"));

    // Handle each part.
    for (let index = 0; index < parts.length; index++) {
      // If the tag is a plain text.
      // (or a closing tag without an opening tag matches it).
      if (
        (!regexIstag.test(parts[index]) && parts[index] != "") ||
        regexIsCloseTag.test(parts[index])
      ) {
        // Add the text to the proccesd text.
        formattedparts.push(parts[index]);
      }
      // If the tag is an open tag.
      else if (
        regexIstag.test(parts[index]) &&
        !regexIsCloseTag.test(parts[index])
      ) {
        // Create a regex that checks for the closer tag matches the current tag.
        let currenttag = parts[index].substring(1, parts[index].length - 1);
        let regexIsSearchedTag = RegExp("</" + currenttag + ">");

        // Search the closer tag matches the currnt tag.
        let serchingIndex = index + 1;
        while (
          !regexIsSearchedTag.test(parts[serchingIndex]) &&
          serchingIndex < parts.length
        ) {
          serchingIndex++;
        }

        // If a matching closer tag was not found.
        if (serchingIndex >= parts.length) {
          // Consider the tag as a plain text.
          // Add the text to the proccesd text.
          formattedparts.push(parts[index]);
        }
        // If a matching closer tag was found.
        else {
          // Make a string contains all the plain text surrounded by the tag.
          let currentTaggedText = "";
          for (
            let copyingIndex = index + 1;
            copyingIndex < serchingIndex;
            copyingIndex++
          ) {
            currentTaggedText += parts[copyingIndex];
          }

          // Add the text to the proccesd text, with a prefix that tells the tag name.
          formattedparts.push("%" + currenttag + "%" + currentTaggedText);
          index = serchingIndex;
        }
      }
    }

    return formattedparts;
  };

  makeHtmlForm = (lineNumber, line) => {
    let regexIsTagged = RegExp("%.+%.+");
    let htmlForm = (
      <React.Fragment>
        {" "}
        {line.map((part, i) => (
          <span
            key={lineNumber + "," + i}
            id={lineNumber + "," + i}
            style={
              regexIsTagged.test(part)
                ? //divopentag.test(part.toLowerCase()) || divclosingtag.test(part.toLowerCase())
                  //part.toLowerCase() === higlight.toLowerCase()
                  {
                    fontWeight: "bold",
                    backgroundColor: this.props.tagsAndColors[
                      part.split("%")[1]
                    ],
                  }
                : {}
            }
          >
            {part.split("%").reverse()[0]}
          </span>
        ))}
      </React.Fragment>
    );

    return htmlForm;
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

    this.props.updateFileContent(text);

    this.state.preHighlightedText = "";
    this.state.higlight = "";
    this.state.postHighlightedText = "";
  };

  captureHighlightedText = (event, data) => {
    if (window.getSelection() == NaN) {
      return;
    }

    let base = window.getSelection().baseOffset;
    let extent = window.getSelection().extentOffset;
    let formatedText = this.state.preHtmlFormatedText;

    // Get the part number the highlited text is in.
    let lineAndparagraph = window.getSelection().anchorNode.parentElement.id;
    lineAndparagraph = lineAndparagraph.split(",");
    console.log("lineAndparagraph = " + lineAndparagraph);
    let line = lineAndparagraph[0];
    let paragraph = lineAndparagraph[1];

    // If the highlighted text is not valid.
    if (
      typeof line === "undefined" ||
      typeof paragraph === "undefined" ||
      typeof lineAndparagraph === "undefined" ||
      line === "" ||
      paragraph === "" ||
      lineAndparagraph === ""
    ) {
      return;
    }

    let borders = this.calcBordersOfHighlightedText(base, extent);
    borders = this.extendHighlightToEntireWord(
      formatedText,
      line,
      paragraph,
      borders[0],
      borders[1]
    );

    let offset = this.clacOfsetFromTheStartOfTheText(
      formatedText,
      line,
      paragraph
    );

    borders[0] += offset;
    borders[1] += offset;

    let preTag;
    let inTag;
    let postTag;

    let fileContent = this.props.fileContent;

    // If the highlited text is not already tagged.
    if (formatedText[line][paragraph][0] != "%") {
      preTag = fileContent.substring(0, borders[0]);
      inTag = fileContent.substring(borders[0], borders[1]);
      postTag = fileContent.substring(borders[1], fileContent.length);
      this.state.isHighlightedTextTagged = false;
    } else {
      let textParagraph = formatedText[line][paragraph].split("%");
      let tagLength = textParagraph[1].length;
      preTag = fileContent.substring(0, offset);
      inTag = fileContent.substring(
        offset + tagLength + 2,
        offset + tagLength + 2 + textParagraph[2].length
      );
      postTag = fileContent.substring(
        offset + textParagraph[2].length + 2 * tagLength + 5,
        fileContent.length
      );
      this.state.isHighlightedTextTagged = true;
    }

    this.state.leftIndex = borders[0] - offset;
    this.state.rightIndex = borders[1] - offset;
    this.state.begining = borders[0];
    this.state.end = borders[1];
    this.setState({ preHighlightedText: preTag });
    this.setState({ highlightedText: inTag });
    this.setState({ postHighlightedText: postTag });
  };

  calcBordersOfHighlightedText = (base, extent) => {
    let leftBorder;
    let rightBorder;

    if (base <= extent) {
      leftBorder = base;
      rightBorder = extent;
    } else if (base > extent) {
      leftBorder = extent;
      rightBorder = base;
    }

    return [leftBorder, rightBorder];
  };

  extendHighlightToEntireWord = (
    text,
    line,
    paragraph,
    leftIndex,
    rightIndex
  ) => {
    let textParagraph = text[line][paragraph];

    // Sreaching for the begining of the highlighted word.
    let begining;
    // If the first chracter is in a begining of a chunk.
    if (leftIndex == 0) {
      begining = leftIndex;
    } else {
      for (let index = leftIndex; index >= 0; index--) {
        // we reached the begining of the current paragraph.
        if (index == 0) {
          begining = index;
          // If we reached a space character.
        } else {
          let previousChar = textParagraph[index - 1];
          //(!(previousChar.match(/[a-z]/i) || previousChar.match(/[0-9]/)))
          if (this.isSpecialChar(previousChar)) {
            //  previousChar == " " ||
            //  previousChar == "\n" ||
            //  previousChar == "\t"
            begining = index;
            break;
          }
        }
      }
    }

    let end;
    //in case of automatic space added by clicking
    if (
      rightIndex != leftIndex &&
      this.isSpecialChar(textParagraph[rightIndex - 1])
    ) {
      end = rightIndex - 1;
    } else if (rightIndex == textParagraph.length) {
      // If the last chracter is in the end of a chunk.
      end = rightIndex;
    } else {
      for (let index = rightIndex; index <= textParagraph.length; index++) {
        // If we reached the end of the paragraph.
        if (index == textParagraph.length) {
          end = index;
          // If we reached a white space.
        } else {
          let nextChar = textParagraph[index];
          if (this.isSpecialChar(nextChar)) {
            end = index;
            break;
          }
        }
      }
    }
    return [begining, end];
  };

  clacOfsetFromTheStartOfTheText = (text, line, paragraph) => {
    //calculate the offset from the beggining of the text
    // Calc the number of letter in the previous lines.
    let offset = 0;

    // Add the number of new line character to the offset
    offset += line * this.state.newLineCharacterLength;

    // Go through the text lines.
    for (let i = 0; i <= line; i++) {
      // Go through the partition of the line.
      // If the line is the line where the highlighted text is in, run until
      // the part where the highlighted text is found.
      let end = text[i].length;
      if (i == line) {
        end = paragraph;
      }
      for (let j = 0; j < end; j++) {
        // In case the current part does not contain highlighted text.
        if (!text[i][j].startsWith("%")) {
          offset += text[i][j].length;
        }
        // In case the current part contains highlighted text.
        else {
          let currentPartText = text[i][j].split("%");
          let tagLength = currentPartText[1].length;
          let textlength = currentPartText[2].length;
          // 2 * tagLength + 5:
          // 2 * tagLength: stands for the 2 appearance of the tag's name, at the text.
          // (One appearance of the tag in the opening tag and the second in the closing tag).
          // 5: stands for the characters : <> </>, <> appear in the opening tag,
          // and </> in the closing tag.
          offset += textlength + 2 * tagLength + 5;
        }
      }
    }

    return offset;

    // Add to the calculted offset the highlighted text offset from the beginng of it's part
    // in the line the text is found.
    //.offset += leftBorder;
  };

  render = () => {
    let page = (
      <div>
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
                  {this.setTags(this.props.fileContent)}
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
    );
    return page;
  };

  createMenu = () => {
    let menu;
    if (this.state.isHighlightedTextTagged == false) {
      menu = this.props.tagsList.map((part, i) => (
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

export default taggedTextArea;
