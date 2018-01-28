import { EventEmitter } from "events";
import Gestures from "./Gestures";

class PointerEvents extends EventEmitter {
  gestures: Gestures;
  action: string;
  scrollDirection: string;

  constructor(
    private element: Element
  ) {
    super();

    this.onScroll = this.onScroll.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onTap = this.onTap.bind(this);
    this.onPress = this.onPress.bind(this);
  }

  activate() {
    if (this.element) {
      this.element.classList.add("touch");
      this.gestures = new Gestures(this.element)
        .on("scroll", this.onScroll)
        .on("scrollend", this.onScrollEnd)
        .on("move", this.onMove)
        .on("up", this.onUp)
        .on("tap", this.onTap)
        .on("press", this.onPress);
    }
  }

  deactivate() {
    if (this.element) this.element.classList.remove("touch");
    if (this.gestures) {
      this.gestures.destroy();
      this.gestures.removeListener("scroll", this.onScroll);
      this.gestures.removeListener("scrollend", this.onScrollEnd);
      this.gestures.removeListener("move", this.onMove);
      this.gestures.removeListener("up", this.onUp);
      this.gestures.removeListener("tap", this.onTap);
      this.gestures.removeListener("press", this.onPress);
    }
  }

  onScroll(direction) {
    this.action = "scroll";
    this.scrollDirection = direction;
    this.emit("scroll", direction);
  }

  onScrollEnd() {
    this.action = "none";
    this.emit("scrollend");
  }

  onMove(x, y) {
    this.action = "move";
    this.emit("move", x, y);
  }

  onUp() {
    this.action = "none";
    this.emit("up");
  }

  onTap() {
    this.action = "none";
    this.emit("tap");
  }

  onPress() {
    this.action = "none";
    this.emit("press");
  }
}

export default PointerEvents;
export { PointerEvents };