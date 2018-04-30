import { EventEmitter } from "events";
import * as io from "socket.io-client";

class ProductionConnection extends EventEmitter implements Connection {
  first: boolean = true;
  connected: boolean = false;
  socket: SocketIOClient.Socket;

  async connect(url: string = location.host) {
    this.socket = io(url, {
      path: "/sockets"
    });

    return new Promise<void>((resolve, reject) => {
      this.socket
        .on("connect", () => {
          this.connected = true;
          this.emit("ready");
          resolve();
        })
        .on("connect_error", err => {
          this.emit("error", err);
          reject(err);
        })
        .on("disconnect", () => {
          this.first = false;
          this.connected = false;
          this.emit("disconnect");
        });
    });
  }

  send(eventName: string, ...args: any[]) {
    this.socket.emit(eventName, ...args);
  }
}

class DebugConnection extends EventEmitter implements Connection {
  first: boolean = true;
  connected: boolean = false;

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

  async connect(url: string) {
    setTimeout(() => this.setConnected(), 1 * 1000);
  }

  send(eventName: string, ...args: any[]) {
    console.debug("sending", eventName, ...args);
  }
}

interface Connection extends EventEmitter {
  first: boolean;
  connected: boolean;

  connect(url: string): Promise<void>;
  send(eventName: string, ...args: any[]);
}

export default Connection;
export {
  ProductionConnection,
  DebugConnection,
  Connection
}