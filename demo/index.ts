import Screen from "../src";
import Hint from "./Hint";

const hint = new Hint(document.querySelector(".hint"));
const modeSwitchElement = document.querySelector(".toggle-mode");
let currentMode = "";

const screen = new Screen(document.querySelector(".screen"), {
  debug: process.env.NODE_ENV === "development"
})
  .on("modeChange", mode => {
    if (mode === "Touch") {
      modeSwitchElement.textContent = "Touch";
    } else if (mode === "Mouse") {
      modeSwitchElement.textContent = "Mouse";
    } else {
      modeSwitchElement.textContent = "Offline";
    }
    currentMode = mode;
  })
  .on("statusChange", status => {
    if (currentMode === "Touch") {
      if (status === "ScrollUp") {
        hint.setText("Scrolling up...");
      } else if (status === "ScrollDown") {
        hint.setText("Scrolling down...");
      } else if (status === "Move") {
        hint.setText("Moving...");
      } else if (status === "Idle") {
        hint.setText("Tap & Pan to control");
      }
    } else {
      if (status === "Control") {
        hint.setText("You're controlling now");
      } else if (status === "Idle") {
        hint.setText("Click to control");
      }
    }
  })
  .on("connectionError", err => console.error(err));

screen.connect("http://localhost:4444");

modeSwitchElement.addEventListener("click", () => screen.toggleMode());