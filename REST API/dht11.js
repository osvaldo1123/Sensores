const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

//Valores máximos e mínimos de um sensor DHT11
class DHT11 {
  constructor() {
    this.minTemp = 0;
    this.maxTemp = 50;
    this.minUmid = 20;
    this.maxUmid = 80;
  }

  //GET para cada funcionalidade, utilizando o valor recebido como base
  getTemp(baseValue = null) {
    // Gera um valor dentro dos valores de temperatura que podem ser medidos em um DHT11
    const baseTemp = baseValue !== null ? baseValue : Math.random() * (this.maxTemp - this.minTemp) + this.minTemp;
    // Acuracia de +-2 graus
    const accError = (Math.random() * 4 - 2).toFixed(1);
    // Valor final somando a temperatura com a margem de erro
    const finalTemp = parseFloat(baseTemp) + parseFloat(accError);
    return Math.min(Math.max(finalTemp, this.minTemp), this.maxTemp).toFixed(1);
  }
  
  getUmid(baseValue = null) {
    // Gera um valor dentro dos valores de umidade  que podem ser medidos em um DHT11
    const baseUmid = baseValue !== null ? baseValue : Math.random() * (this.maxUmid - this.minUmid) + this.minUmid;
    // Acuracia de +-5 porcento
    const accError = (Math.random() * 10 - 5).toFixed(1);
    // Valor final somando a umidade com a margem de erro
    const finalUmid = parseFloat(baseUmid) + parseFloat(accError);
    return Math.min(Math.max(finalUmid, this.minUmid), this.maxUmid).toFixed(1);
  }
  

  //Simula uma leitura do sensor gerando os valores de umidade, temperatura, e também pegando a timestamp do momento da leitura
  readSensorData() {
    const now = new Date();
    const temp = this.getTemp();
    const umid = this.getUmid();
    return { time: now.toISOString(), temp: `${temp}°C`, umid: `${umid}%` };
  }
}

const virtualSensor11 = new DHT11();

// Autenticação
const validAuthCode = '1230';

// Rotas POST
app.post('/sensor/dht11/readUmidade', (req, res) => {
  const { authCode, baseUmid } = req.body;
  if (authCode !== validAuthCode) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  if (baseUmid === undefined) {
    return res.status(400).json({ message: 'Faltando valores para umidade' });
  }
  res.json({ umidade: virtualSensor11.getUmid(baseUmid) });
});

app.post('/sensor/dht11/readTemperatura', (req, res) => {
  const { authCode, baseTemp } = req.body;
  if (authCode !== validAuthCode) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  if (baseTemp === undefined) {
    return res.status(400).json({ message: 'Faltando valores para temperatura' });
  }
  res.json({ temperatura: virtualSensor11.getTemp(baseTemp) });
});

app.post('/sensor/dht11/readAmbos', (req, res) => {
  const { authCode, baseTemp, baseUmid } = req.body;
  if (authCode !== validAuthCode) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  if (baseTemp === undefined || baseUmid === undefined) {
    return res.status(400).json({ message: 'Faltando valores' });
  }
  const temp = virtualSensor11.getTemp(baseTemp);
  const umid = virtualSensor11.getUmid(baseUmid);
  res.json({ time: new Date().toISOString(), temp: `${temp}°C`, umid: `${umid}%` });
});


app.get('/sensor/dht11/readUmidade', (req, res) => {
  res.json({ humidity: virtualSensor11.getUmid() });
});

app.get('/sensor/dht11/readTemperatura', (req, res) => {
  res.json({ temperature: virtualSensor11.getTemp() });
});

app.get('/sensor/dht11/readAmbos', (req, res) => {
  const data = virtualSensor11.readSensorData();
  res.json(data);
});

app.listen(port, () => {
  console.log(`DHT11 Server no port ${port}`);
});
