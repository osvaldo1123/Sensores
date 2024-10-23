class DHT11 {
  //Valores máximos e mínimos de um sensor DHT11
    constructor() {
      this.minTemp = 0;
      this.maxTemp = 50;
      this.minUmid = 20;
      this.maxUmid = 80;
    }
    
    getTemp() {
      // Gera um valor dentro dos valores de temperatura que podem ser medidos em um DHT11
      const baseTemp = Math.random() * (this.maxTemp - this.minTemp) + this.minTemp;
      // Acuracia de +-2 graus
      const accError = (Math.random() * 4 - 2).toFixed(1);
      // Valor final somando a temperatura com a margem de erro
      const finalTemp = parseFloat(baseTemp) + parseFloat(accError);

      return Math.min(Math.max(finalTemp, this.minTemp), this.maxTemp).toFixed(1);
  }

    getUmid() {
      // Gera um valor dentro dos valores de umidade  que podem ser medidos em um DHT11
      const baseUmid = Math.random() * (this.maxUmid - this.minUmid) + this.minUmid;
      // Acuracia de +-5 porcento
      const accError = (Math.random() * 10 - 5).toFixed(1);
      // Valor final somando a umidade com a margem de erro
      const finalUmid = parseFloat(baseUmid) + parseFloat(accError);
      
      return Math.min(Math.max(finalUmid, this.minUmid), this.maxUmid).toFixed(1);
  }
  
    readSensorData() {
      //Simula uma leitura do sensor gerando os valores de umidade, temperatura, e também pegando a timestamp do momento da leitura
      const now = new Date();
      const temp = this.getTemp();
      const umid = this.getUmid();
      return {
        time: now.toISOString(),
        temp: `${temp}°C`,
        umid: `${umid}%`
      };
    }    
  }
  
class DHT22 {
    //Valores máximos e mínimos de um sensor DHT22
    constructor() {
        this.minTemp = -40;
        this.maxTemp = 125;
        this.minUmid = 0;
        this.maxUmid = 100;
    }

    getTemp() {
        // Gera um valor dentro dos valores de temperatura que podem ser medidos em um DHT22
        const baseTemp = Math.random() * (this.maxTemp - this.minTemp) + this.minTemp;
        // Acuracia de +-0.5 grau
        const accError = (Math.random() * 1 - 0.5).toFixed(1);
        // Valor final somando a temperatura com a margem de erro
        const finalTemp = parseFloat(baseTemp) + parseFloat(accError);

        return Math.min(Math.max(finalTemp, this.minTemp), this.maxTemp).toFixed(1);
    }

    getUmid() {
        // Gera um valor dentro dos valores de umidade que podem ser medidos em um DHT22
        const baseUmid = Math.random() * (this.maxUmid - this.minUmid) + this.minUmid;
        // Acuracia de +-2 porcento
        const accError = (Math.random() * 4 - 2).toFixed(1);
        // Valor final somando a umidade com a margem de erro
        const finalUmid = parseFloat(baseUmid) + parseFloat(accError);

        return Math.min(Math.max(finalUmid, this.minUmid), this.maxUmid).toFixed(1);
    }

    readSensorData() {
      //Simula uma leitura do sensor gerando os valores de umidade, temperatura, e também pegando a timestamp do momento da leitura
      const now = new Date();
      const temp = this.getTemp();
      const umid = this.getUmid();
      return {
        time: now.toISOString(),
        temp: `${temp}°C`,
        umid: `${umid}%`
      };
    }
}


  const virtualSensor11 = new DHT11();
  const virtualSensor22 = new DHT22();

  // DHT11 faz uma leitura a cada segundo
  setInterval(() => {
    const data = virtualSensor11.readSensorData();
    console.log(`DHT11: Temperatura: ${data.temp}, Umidade: ${data.umid}, Hora: ${data.time}`);
  }, 1000);
  
  // DHT22 faz uma leitura a cada 2 segundos
  setInterval(() => {
    const data = virtualSensor22.readSensorData();
    console.log(`DHT22: Temperatura: ${data.temp}, Umidade: ${data.umid}, Hora: ${data.time}`);
  }, 2000);
