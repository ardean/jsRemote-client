import { EventEmitter } from "events";

class Mouse extends EventEmitter {
  constructor(
    private element: Element
  ) {
    super();

    this.onMove = this.onMove.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  activate() {
    document.addEventListener("mousemove", this.onMove);
    document.addEventListener("mousedown", this.onDown);
    document.addEventListener("mouseup", this.onUp);
    document.addEventListener("wheel", this.onScroll, { passive: true });
  }

  deactivate() {
    document.removeEventListener("mousemove", this.onMove);
    document.removeEventListener("mousedown", this.onDown);
    document.removeEventListener("mouseup", this.onUp);
    document.removeEventListener("wheel", this.onScroll);
  }

  onMove({ movementX: x, movementY: y }) {
    this.emit("move", x, y);
  }

  onDown({ which }) {
    this.emit("down", this.getButton(which));
  }

  onUp({ which }) {
    this.emit("up", this.getButton(which));
  }

  onScroll({ deltaY }) {
    if (deltaY === 0) return;
    this.emit("scroll", deltaY > 0 ? "down" : "up");
  }

  getButton(number) {
    if (number === 3) return "right";
    else if (number === 2) return "middle";
    return "left";
  }
}

export default Mouse;
export { Mouse };