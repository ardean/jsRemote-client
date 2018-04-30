import { EventEmitter } from "events";

export default class Gestures extends EventEmitter {
  downDate: Date;
  firstPageX: number;
  firstPageY: number;
  firstPointerId: string;
  moved: boolean;
  moreThanOneDown: boolean;
  movementThreshold: number = 9;
  scrolling: boolean;
  scrollDirection: string;
  pageY: number;
  pageX: number;
  pressTime: number = 250;
  pressTimeout: number;
  pointerDown: boolean;
  pointerCount: number = 0;

  constructor(
    private element: Element
  ) {
    super();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    this.element.addEventListener("pointerdown", this.onPointerDown);
    this.element.addEventListener("pointermove", this.onPointerMove);
    this.element.addEventListener("pointerup", this.onPointerUp);
  }

  destroy() {
    this.element.removeEventListener("pointerdown", this.onPointerDown);
    this.element.removeEventListener("pointermove", this.onPointerMove);
    this.element.removeEventListener("pointerup", this.onPointerUp);
  }

  onPointerDown(e) {
    e.preventDefault();
    e.stopPropagation();

    this.pointerDown = true;
    this.pointerCount++;
    if (!this.firstPointerId) {
      this.moreThanOneDown = false;
      this.firstPointerId = e.pointerId;
      this.firstPageX = this.pageX = e.pageX;
      this.firstPageY = this.pageY = e.pageY;
      this.downDate = new Date();
      this.lookForPress();
    } else {
      this.moreThanOneDown = true;
    }

    if (this.moreThanOneDown) {
      this.cancelPress();
    }
  }

  onPointerMove(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.pointerDown) {
      if (!this.underMovementThreshold(e.pageX, e.pageY)) {
        this.moved = true;
      }

      if (this.moved) {
        this.cancelPress();
      }

      if (!this.firstPointer(e)) return;

      if (this.pointerCount === 2) {
        const distance = this.pageY - e.pageY;
        if (distance !== 0) {
          this.scrollDirection = distance < 0 ? "down" : "up";
          this.scrolling = true;
          this.emit("scroll", this.scrollDirection);
        } else {
          this.scrollDirection = null;
        }

        this.pageX = e.pageX;
        this.pageY = e.pageY;

        return;
      }

      if (this.moved && !this.moreThanOneDown) {
        this.emit("move", e.pageX - this.pageX, e.pageY - this.pageY);
      }

      this.pageX = e.pageX;
      this.pageY = e.pageY;
    }
  }

  onPointerUp(e) {
    e.preventDefault();
    e.stopPropagation();

    this.cancelPress();
    this.pointerCount--;

    if (this.firstPointer(e)) {
      if (this.scrolling) {
        this.emit("scrollend");
      } else if (
        !this.moved &&
        !this.moreThanOneDown &&
        (new Date().valueOf() - this.downDate.valueOf()) <= 300
      ) {
        this.emit("tap");
      } else {
        this.emit("up");
      }

      this.resetState();
    }
  }

  firstPointer(e) {
    return e.pointerId === this.firstPointerId;
  }

  resetState() {
    this.scrolling = false;
    this.scrollDirection = null;
    this.firstPointerId = null;
    this.pointerDown = false;
    this.moved = false;
    this.moreThanOneDown = false;
  }

  underMovementThreshold(currentX, currentY) {
    return Math.abs(this.firstPageX - currentX) <= this.movementThreshold &&
      Math.abs(this.firstPageY - currentY) <= this.movementThreshold;
  }

  lookForPress() {
    this.pressTimeout = window.setTimeout(() => {
      this.emit("press");
    }, this.pressTime);
  }

  cancelPress() {
    window.clearTimeout(this.pressTimeout);
  }
}