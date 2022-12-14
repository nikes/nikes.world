(function () {
  let elementStatus = document.getElementById('energy-status-wrap');
  let elementStatusIcon = document.getElementById('energy-status-icon');
  let elementStatusText = document.getElementById('energy-status');
  let elementLastUpdate = document.getElementById('energy-last-update');

  let ws;
  let currentStatus = 'offline';

  function setState(state) {
    if (currentStatus === state) {
      return;
    }
    let lastState = currentStatus;
    currentStatus = state;
    if (state === 'connecting') {
      elementStatusText.innerText = 'Connecting...';
      elementStatusIcon.hidden = true;
      elementStatus.classList.replace(`energy-status--${lastState}`, `energy-status--${state}`);
      elementStatus.classList.replace(`shimmer--${lastState}`, `shimmer--${state}`);
    }
    if (state === 'offline') {
      elementStatusText.innerText = 'Offline';
      elementStatusIcon.src = 'images/status/offline.svg';
      elementStatusIcon.hidden = false;
      elementStatus.classList.replace(`energy-status--${lastState}`, `energy-status--${state}`);
      elementStatus.classList.replace(`shimmer--${lastState}`, `shimmer--${state}`);
    }
    if (state === 'online') {
      elementStatusText.innerText = 'Online';
      elementStatusIcon.src = 'images/status/online.svg';
      elementStatusIcon.hidden = false;
      elementStatus.classList.replace(`energy-status--${lastState}`, `energy-status--${state}`);
      elementStatus.classList.replace(`shimmer--${lastState}`, `shimmer--${state}`);
    }
    if (state === 'reserve') {
      elementStatusText.innerText = 'Reserve Power';
      elementStatusIcon.src = 'images/status/reserve.svg';
      elementStatusIcon.hidden = false;
      elementStatus.classList.replace(`energy-status--${lastState}`, `energy-status--${state}`);
      elementStatus.classList.replace(`shimmer--${lastState}`, `shimmer--${state}`);
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
          setState('reserve');
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
