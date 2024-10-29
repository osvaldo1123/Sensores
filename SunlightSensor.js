class MAX44009 {
    constructor() {
//Valores de mínimo e máximo de luminosidade (em lux) de um sensor modeo MAX4409 
      this.minLux = 0.045;
      this.maxLux = 188000;
      this.luxAtual = this.minLux;
    }

    // Metodo pra simular um valor de lux obtido pelo sensor
    sensorLux() {
      this.luxAtual = this.minLux + Math.random() * (this.maxLux - this.minLux);
      return this.luxAtual;
    }
  }
  
const virtualMAX44009 = new MAX44009();

// Simula uma leitura do sensor a cada 2 segundos
setInterval(() => {
    const data = virtualMAX44009.sensorLux();
    console.log(`Luminosidade: ${data.toFixed(2)} lux`);
  }, 2000);
