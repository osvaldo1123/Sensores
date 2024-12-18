const express = require('express');
const app = express();
const port = 3000;

class YL83 {
  constructor() {
    // Define os valores iniciais
    this.isChuva = false;
    this.analogValor = 1023; // 1023 sendo seco, quanto menor o número, mais molhado
    this.digitalValor = 1;   // 1 é seco
    this.updateSensor();
    this.startSensor(); 
  }

  // Inicia sensor
  startSensor() {
    setInterval(() => {
      this.updateSensor();
    }, 2000);
  }

  updateSensor() {
    this.isChuva = Math.random() < 0.5;
    if (this.isChuva) {
      this.analogValor = this.getChuva();
      this.digitalValor = 0;
    } else {
      this.analogValor = 1023;
      this.digitalValor = 1;
    }
  }

  // Simula o valor analógico
  getChuva() {
    return Math.floor(Math.random() * 1023);
  }

  getSensorData() {
    return {
      digital: this.digitalValor,
      analog: this.analogValor,
      status: this.isChuva ? "Chuva" : "Seco",
    };
  }
}

const virtualYL83 = new YL83();

// GET
app.get('/sensor-get', (req, res) => {
  const data = virtualYL83.getSensorData();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server Port: http://localhost:${port}`);
});
