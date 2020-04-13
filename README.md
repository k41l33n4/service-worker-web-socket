# service-worker-web-socket

## Singleton style WebSocket connection using a service worker

- It provides the same interface as a native WebSocket
- It falls back to native WebSocket if ServiceWorker is not available
- it falls back to native WebSocket if the brower doesn't expose WebSocket in ServiceWorker thread


## Install
```
npm i -S @k41l33n4/service-worker-web-socket@latest
```

## Usage

The `ServiceWorkerWebSocket` will try to connect to `/serviceWorker.js`, so first we need to make sure the browser can access that file;

To do that, first we need to copy the `/path/to/your/project/node_modules/@k41l3n4/service-worker-web-socket/src/serviceWorker.js` file to your `dist` folder; I'm using `webpack` with `copy-webpack-plugin` to achieve that;

Second, we need to make sure `https://your.site.com/serviceWorker.js` points to that file; you can use `nginx` (or whatever router you prefer) to serve that file for `/serviceWorker.js`; Remember to set `Content-Type` to `text/javascript`, otherwise the service worker won't register;

Once you made sure `https://your.site.com/serviceWorker.js` is accessible, you just use it as a regular `WebSocket`:
```javascript
import ServiceWorkerWebSocket from "@k41l33n4/service-worker-web-socket";

const connection = new ServiceWorkerWebSocket("wss://example.com/path");
connection.onopen = () => {
  console.log("connection open, you're ready to send and receive message");
}

connection.onclose = () => {
  console.log("leaving so soon? :(")
}

connection.onerror => (error) => {
  console.log("well, this is awkward");
  console.log(error);
}

connection.onmessage => (event) => {
  console.log("Now we're getting to the serious stuff!")
  console.log(event.data);
  // do whatever you like here :D
}

```

## Notes

1. Service workers are only enabled for `https`; For testing and development, you also have service workers enabled on `http://localhost`, any port;

2. If you don't have `https` enabled on your server, or cannot access your app on `http://locahost`, it will fallback to a native WebSocket implementation;

3. If, for any reasons, the service worker registration fails, it will fallback to a native WebSocket implementation

4. You will probably need to add the package to you compiler build paths
