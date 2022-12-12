(function () {
  let ws;

  function connect() {
    ws = new WebSocket(`wss://${location.host}`);
    ws.onmessage = (event) => {
      console.log(`[WS][Data]`, event.data);
    };
    ws.onclose = () => {
      setTimeout(() => this.connect(), 1000);
    };
    ws.onerror = (error) => {
      console.error(`[WS]`, error);
    };
  }

  connect();
})();
