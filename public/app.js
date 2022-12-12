(function () {
  let elementStatus = document.getElementById('energy-status');
  let elementLastUpdate = document.getElementById('energy-last-update');
  elementStatus.innerText = 'Connecting...';

  let ws;

  function setState(state) {
    elementStatus.classList.remove(...elementStatus.classList);
    if (state === 'offline') {
      elementStatus.innerText = 'Offline';
      elementStatus.classList.add('offline');
    }
    if (state === 'online') {
      elementStatus.innerText = 'Online';
      elementStatus.classList.add('online');
    }
    if (state === 'ups') {
      elementStatus.innerText = 'Reserve Power';
      elementStatus.classList.add('ups');
    }
  }

  function connect() {
    ws = new WebSocket(`wss://${location.host}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if ((Date.now() - data.last) < 60_000 && data.data) {
        if (data.data.power_supply) {
          setState('online');
        } else {
          setState('ups');
        }
      } else {
        setState('offline');
      }
      if (data.last > -1) {
        elementLastUpdate.innerText = new Date(data.last).toLocaleString();
      }
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
