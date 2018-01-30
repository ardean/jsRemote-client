import Mouse from "./Mouse";
import Keyboard from "./Keyboard";
import PointerLock from "jspointerlock";
import PointerEvents from "./PointerEvents";
import Connection, { DebugConnection, IConnection } from "./Connection";
import { EventEmitter } from "events";

class Screen extends EventEmitter {
  debug: boolean;

  mode: string = "Offline";
  previousMode: string = "Offline";
  mouse: Mouse;
  pointerLock: any;
  keyboard: Keyboard;
  connection: IConnection;
  pointerEvents: PointerEvents;

  constructor(
    private element: Element,
    options: {
      url?: string,
      debug?: boolean
    } = {}
  ) {
    super();

    if (typeof options.debug === "boolean") this.debug = options.debug;

    this.pointerLock = new PointerLock(this.element);
    this.pointerEvents = new PointerEvents(this.element);
    this.mouse = new Mouse(this.element);
    this.keyboard = new Keyboard(this.element);
    this.connection = this.debug ? new DebugConnection() : new Connection(options.url);

    this.element
      .addEventListener("click", () => {
        if (!this.pointerLock.isLocked && this.mode === "Mouse") {
          this.pointerLock.requestPointerLock();
        }
      });

    this.connection
      .on("ready", () => {
        const mode = this.previousMode === "Offline" ? this.detectMode() : this.previousMode;
        this.changeMode(mode);
      })
      .on("disconnect", () => {
        this.changeMode("Offline");
      });

    this.mouse
      .on("move", (x, y) => {
        if (this.pointerLock.isLocked) {
          this.connection.send("mouseMove", x, y);
        }
      })
      .on("scroll", direction => {
        if (this.pointerLock.isLocked) {
          this.connection.send("mouseScroll", 1, direction);
        }
      })
      .on("down", button => {
        if (this.pointerLock.isLocked) {
          this.connection.send("mouseDown", button);
        }
      })
      .on("up", button => {
        if (this.pointerLock.isLocked) {
          this.connection.send("mouseUp", button);
        }
      });

    this.pointerEvents
      .on("scroll", direction => {
        this.connection.send("mouseScroll", 1, direction);
        this.updateText();
      })
      .on("scrollend", () => {
        this.updateText();
      })
      .on("up", () => {
        this.updateText();
      })
      .on("move", (x, y) => {
        this.connection.send("mouseMove", x, y);
        this.updateText();
      })
      .on("tap", () => {
        this.connection.send("mouseDown", "left");
        this.connection.send("mouseUp", "left");
      })
      .on("press", () => {
        this.connection.send("mouseDown", "right");
        this.connection.send("mouseUp", "right");
      });

    this.keyboard
      .on("down", (key, keyCode) => {
        if (this.pointerLock.isLocked) {
          if (key === "escape") return PointerLock.exitPointerLock();
          this.connection.send("keyboardDown", key, keyCode);
        }
      })
      .on("up", (key, keyCode) => {
        if (this.pointerLock.isLocked) {
          if (key === "escape") return PointerLock.exitPointerLock();
          this.connection.send("keyboardUp", key, keyCode);
        }
      });

    this.pointerLock
      .on("change", () => {
        this.updateText();
      });
  }

  updateText() {
    if (!this.connection.connected && !this.connection.first) return this.emit("messageChange", "Not connected to server!", true);

    if (this.mode === "Touch") {
      if (this.pointerEvents.action === "scroll" && this.pointerEvents.scrollDirection) {
        this.emit("messageChange", `Scrolling ${this.pointerEvents.scrollDirection}...`);
      } else if (this.pointerEvents.action === "move") {
        this.emit("messageChange", "Moving...");
      } else {
        this.emit("messageChange", "Tap & Pan to control");
      }
    } else {
      if (this.pointerLock.isLocked) {
        this.emit("messageChange", "You're controlling now");
      } else {
        this.emit("messageChange", "Click to control");
      }
    }
  }

  toggleMode() {
    if (this.mode === "Offline") return;
    this.changeMode(this.mode === "Touch" ? "Mouse" : "Touch");
  }

  changeMode(mode) {
    if (this.mode === mode) return;

    if (this.pointerLock.isLocked) PointerLock.exitPointerLock();

    if (mode === "Offline") {
      this.keyboard.deactivate();
      this.mouse.deactivate();
      this.pointerEvents.deactivate();
    } else if (mode === "Touch") {
      this.keyboard.deactivate();
      this.mouse.deactivate();
      this.pointerEvents.activate();
    } else {
      this.pointerEvents.deactivate();
      this.mouse.activate();
      this.keyboard.activate();
    }

    this.previousMode = this.mode;
    this.mode = mode;
    this.updateText();
    this.emit("modeChange", this.mode);
  }

  detectMode() {
    return "ontouchstart" in document.documentElement ? "Touch" : "Mouse";
  }
}

export default Screen;
export { Screen };