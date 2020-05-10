import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
//import registerServiceWorker from "./registerServiceWorker";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.css";
import Main from "./components/main";

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

//ReactDOM.render(<mainCounter />, document.getElementById("root"));
//serviceWorker.register();
//var element = React.createElement(
//  "h1",
//  { className: "greeting" },
//  "Hello, world!"
//);

ReactDOM.render(<Main />, document.getElementById("root"));
serviceWorker.register();
