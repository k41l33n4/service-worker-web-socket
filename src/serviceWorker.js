let webSocket = null;

addEventListener("install", () => {
  self.skipWaiting();
});

let requests = [];

const broadcastMessage = async(message) => {
  self.clients.claim();
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage(message);
  });
};

const checkDisconnectSocket = async(message) => {
  if (!webSocket) {
    return;
  }

  const clients = await self.clients.matchAll();
  if (!clients.length) {
    webSocket.close();
  }
}

addEventListener("message", (event) => {
  const { data } = event;
  switch (data.type) {
    case "connect": {
      if (webSocket) {
        broadcastMessage({ type: "wsOpen" });

        return;
      }

      if (!WebSocket) {
        broadcastMessage({ type: "noWs" });

        return;
      }

      requests = [];
      const { url, protocols } = data.options;
      webSocket = new WebSocket(url, protocols);
      webSocket.onopen = () => {
        broadcastMessage({ type: "wsOpen" });
      };

      webSocket.onclose = () => {
        broadcastMessage({ type: "wsClose" });
      };

      webSocket.onerror = (error) => {
        broadcastMessage({ type: "wsError", error });
      };

      webSocket.onmessage = (ev) => {
        broadcastMessage({ type: "message", message: ev.data });
      };

      break;
    }

    case "disconnect": {
      checkDisconnectSocket();
      break;
    }

    case "send": {
      if (requests.includes(data.data)) {
        return;
      }

      requests.push(data.data);
      webSocket.send(data.data);
      break;
    }

    default: {
      break;
    }
  }
});
