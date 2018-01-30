import { EventEmitter } from "events";
import Keys from "./Keys";

class Keyboard extends EventEmitter {
  constructor(
    private element: Element
  ) {
    super();

    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
  }

  activate() {
    document.addEventListener("keydown", this.onDown);
    document.addEventListener("keyup", this.onUp);
  }

  deactivate() {
    document.removeEventListener("keydown", this.onDown);
    document.removeEventListener("keyup", this.onUp);
  }

  onDown(e) {
    e.preventDefault();
    this.emit("down", this.getKey(e), this.getKeyCode(e));
  }

  onUp(e) {
    e.preventDefault();
    this.emit("up", this.getKey(e), this.getKeyCode(e));
  }

  getKey(e) {
    let key = Keys[e.keyCode];
    if (!key) key = e.key;
    return key.toLowerCase();
  }

  getKeyCode(e) {
    return e.keyCode;
  }
}

export default Keyboard;
export { Keyboard };