const NativeWebSocket = window.WebSocket || window.MozWebSocket;
const SW = "serviceWorker" in navigator;


const WORKER_URL = "/serviceasdWorker.js";


class ServiceWorkerWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url = null;
  readyState = null;
  bufferedAmount = 0;
  onopen = null;
  onclose = null;
  extensions = null;
  protocol = null;
  onmessage = null;
  binaryType = "blob";
  webSocket = null;

  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;
    this.connectToWorker();
  }

  async close() {
    await this.swReg.active.postMessage({ type: "disconnect" });
    this.swReg.unregister();
  }

  async connectToWorker() {
    this.readyState = ServiceWorkerWebSocket.CONNECTING;
    try {
      this.swReg = await navigator.serviceWorker.register(WORKER_URL);
      await navigator.serviceWorker.ready;
      navigator.serviceWorker.addEventListener("message", this.onWorkerMessage);

      const message = {
        type: "connect",
        options: {
          url: this.url,
          protocols: this.protocols
        },
      };
      this.swReg.active.postMessage(message);
    } catch {
      this.connectToWebSocket();
    }
  }

  async send(data) {
    if (this.webSocket) {
      this.webSocket.send(data);
      return;
    }
    
    const message = {
      type: "send",
      data,
    };

    this.swReg.active.postMessage(message);
  }

  connectToWebSocket = () => {
    this.readyState = ServiceWorkerWebSocket.CONNECTING;
    this.webSocket = new NativeWebSocket(this.url, this.protocols);
    this.webSocket.onopen = () => {
      this.readyState = ServiceWorkerWebSocket.OPEN;
      if (this.onopen && this.onopen.call) {
        this.onopen();
      }
    };

    this.webSocket.onclose = () => {
      this.readyState = ServiceWorkerWebSocket.CLOSED;
      if (this.onclose && this.onclose.call) {
        this.onclose();
      }
    };

    this.webSocket.onerror = (error) => {
      if (this.onerror && this.onerror.call) {
        this.onerror(error);
      }
    };

    this.webSocket.onmessage = (ev) => {
      if (this.onmessage && this.onmessage.call) {
        this.onmessage({ data: ev.data });
      }
    };
  }

  onWorkerMessage = (event) => {
    const { data } = event;
    switch (data.type) {
      case "noWs": {
        this.swReg.unregister();
        this.connectToWebSocket();

        break;
      }
      case "wsOpen": {
        this.readyState = ServiceWorkerWebSocket.OPEN;
        if (this.onopen && this.onopen.call) {
          this.onopen();
        }

        break;
      }

      case "wsClose": {
        this.readyState = ServiceWorkerWebSocket.CLOSED;
        if (this.onclose && this.onclose.call) {
          this.onclose();
        }

        break;
      }

      case "wsError": {
        if (this.onerror && this.onerror.call) {
          this.onerror(data.error);
        }

        break;
      }

      case "message": {
        if (this.onmessage && this.onmessage.call) {
          this.onmessage({ data: data.message });
        }
        break;
      }

      default: {
        break;
      }
    }
  }
}

export default SW ? ServiceWorkerWebSocket : NativeWebSocket;
