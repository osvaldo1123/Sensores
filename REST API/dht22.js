const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());

// DHT22
class DHT22 {
  constructor() {
    this.minTemp = -40;
    this.maxTemp = 125;
    this.minUmid = 0;
    this.maxUmid = 100;
  }

  //GET para cada funcionalidade, utilizando o valor recebido como base
  getTemp(baseValue = null) {
    const baseTemp = baseValue !== null
      ? baseValue
      : Math.random() * (this.maxTemp - this.minTemp) + this.minTemp;
    const accError = (Math.random() * 1 - 0.5).toFixed(1);
    const finalTemp = parseFloat(baseTemp) + parseFloat(accError);
    return Math.min(Math.max(finalTemp, this.minTemp), this.maxTemp).toFixed(1);
  }

  getUmid(baseValue = null) {
    const baseUmid = baseValue !== null
      ? baseValue
      : Math.random() * (this.maxUmid - this.minUmid) + this.minUmid;
    const accError = (Math.random() * 4 - 2).toFixed(1);
    const finalUmid = parseFloat(baseUmid) + parseFloat(accError);
    return Math.min(Math.max(finalUmid, this.minUmid), this.maxUmid).toFixed(1);
  }

  //Guarda os valores recebidos
  readSensorData() {
    const now = new Date();
    const temp = this.getTemp();
    const umid = this.getUmid();
    return { time: now.toISOString(), temp: `${temp}°C`, umid: `${umid}%` };
  }
}

const virtualSensor22 = new DHT22();

// Autenticação
const validAuthCode = '1230';

// Rotas POST
app.post('/sensor/dht22/readUmidade', (req, res) => {
  const { authCode, baseUmid } = req.body;
  if (authCode !== validAuthCode) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  if (baseUmid === undefined) {
    return res.status(400).json({ message: 'Faltando valor para humidade' });
  }
  res.json({ umidade: virtualSensor22.getUmid(baseUmid) });
});

app.post('/sensor/dht22/readTemperatura', (req, res) => {
  const { authCode, baseTemp } = req.body;
  if (authCode !== validAuthCode) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  if (baseTemp === undefined) {
    return res.status(400).json({ message: 'Faltando valor para temperatura' });
  }
  res.json({ temperatura: virtualSensor22.getTemp(baseTemp) });
});

app.post('/sensor/dht22/readAmbos', (req, res) => {
  const { authCode, baseTemp, baseUmid } = req.body;
  if (authCode !== validAuthCode) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  if (baseTemp === undefined || baseUmid === undefined) {
    return res.status(400).json({ message: 'Faltando valores' });
  }
  const temp = virtualSensor22.getTemp(baseTemp);
  const umid = virtualSensor22.getUmid(baseUmid);
  res.json({ time: new Date().toISOString(), temp: `${temp}°C`, umid: `${umid}%` });
});

app.get('/sensor/dht22/readUmidade', (req, res) => {
  res.json({ humidity: virtualSensor22.getUmid() });
});

app.get('/sensor/dht22/readTemperatura', (req, res) => {
  res.json({ temperature: virtualSensor22.getTemp() });
});

app.get('/sensor/dht22/readAmbos', (req, res) => {
  const data = virtualSensor22.readSensorData();
  res.json(data);
});

app.listen(port, () => {
  console.log(`DHT22 Server running on port ${port}`);
});
