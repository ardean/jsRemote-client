import Screen from "../src";
import Hint from "./Hint";

const hint = new Hint(document.querySelector(".hint"));
const modeSwitchElement = document.querySelector(".toggle-mode");

const screen = new Screen(document.querySelector(".screen"), {
  url: "http://localhost:4444",
  debug: process.env.NODE_ENV === "development"
})
  .on("messageChange", (message, error) => {
    if (error) return hint.setError(message);
    return hint.setText(message);
  })
  .on("modeChange", mode => {
    if (mode === "Touch") {
      modeSwitchElement.textContent = "Touch";
    } else if (mode === "Mouse") {
      modeSwitchElement.textContent = "Mouse";
    } else {
      modeSwitchElement.textContent = "Offline";
    }
  })
  .on("connectionError", err => console.error(err));

modeSwitchElement.addEventListener("click", () => screen.toggleMode());