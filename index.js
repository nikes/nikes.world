const { SerialPort } = require('serialport')

const port = new SerialPort({ path: '/dev/ttyAMA0', baudRate: 9600, autoOpen: false });

port.open((err) => {
  if (err) {
    return console.log('Error opening port: ', err.message);
  }
});

let buffer = null;
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
    const json = JSON.stringify({ power_supply: vIn === 'GOOD', battery_capacity: +batCap, output_voltage: +vOut });
    console.log(json);
    buffer = null;
  }
});
