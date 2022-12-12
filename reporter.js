require('dotenv').config({ path: `${__dirname}/.env` });

const fs = require('node:fs');
const { SerialPort } = require('serialport');
const axios = require('axios');

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  fs.appendFileSync(
    'error.log',
    `[FATAL][${new Date().toISOString()}] Caught exception: ${err}\n` +
    `Exception origin: ${origin}\r\n`,
  );
});

let buffer = null;
const port = new SerialPort({
  path: process.env.UART_PORT,
  baudRate: +process.env.UART_BAUD_RATE,
  autoOpen: false
});

port.open((err) => {
  if (!err) {
    return;
  }
  console.error('[ERROR] Open Port : ', err.message);
});

port.on('data', (data) => {
  if (!(data instanceof Buffer)) {
    return;
  }
  if (buffer) {
    buffer = Buffer.concat([ buffer, data ]);
  } else {
    buffer = data;
  }
  if (buffer[buffer.length - 1] === 0x0A) {
    const line = buffer.toString('utf8');
    const [ , vIn, batCap, vOut ] = line.match(/.*Vin ([a-zA-Z]+),BATCAP ([0-9]+),Vout ([0-9]+).*/);
    const data = { power_supply: vIn === 'GOOD', battery_capacity: +batCap, output_voltage: +vOut };
    void axios.post(`${process.env.API_URL}/api/report`, data, {
      headers: {
        'x-hub-signature': process.env.KEY
      }
    });
    buffer = null;
  }
});

port.on('error', (err) => {
  console.error('[ERROR]', err.message);
  fs.appendFileSync('error.log', `[ERROR][${new Date().toISOString()}] ${err.message}\r\n`);
});
