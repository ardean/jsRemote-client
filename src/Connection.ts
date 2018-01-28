import { EventEmitter } from "events";
import * as io from "socket.io-client";

class Connection extends EventEmitter implements IConnection {
  first: boolean = true;
  connected: boolean = false;
  socket: SocketIOClient.Socket;

  constructor(
    url: string = location.host
  ) {
    super();

    this.socket = io(url, {
      path: "/sockets"
    });

    this.socket
      .on("connect", () => {
        this.connected = true;
        this.emit("ready");
      })
      .on("disconnect", () => {
        this.first = false;
        this.connected = false;
        this.emit("disconnect");
      });
  }

  send(eventName: string, ...args: any[]) {
    this.socket.emit(eventName, ...args);
  }
}

class DebugConnection extends EventEmitter implements IConnection {
  first: boolean = true;
  connected: boolean = false;

  constructor() {
    super();

    setTimeout(() => this.setConnected(), 1 * 1000);
  }

  setConnected() {
    this.connected = true;
    this.emit("ready");

    setTimeout(() => this.setDisconnected(), 5 * 1000);
  }

  setDisconnected() {
    this.first = false;
    this.connected = false;
    this.emit("disconnect");

    setTimeout(() => {
      this.setConnected();
    }, 1 * 1000);
  }

  send(eventName: string, ...args: any[]) {
    console.debug("sending", eventName, ...args);
  }
}

interface IConnection extends EventEmitter {
  first: boolean;
  connected: boolean;

  send(eventName: string, ...args: any[]);
}

export default Connection;
export {
  Connection,
  DebugConnection,
  IConnection
};