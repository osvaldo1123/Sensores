class MAX44009 {
    constructor() {
      this.minLux = 0.045;
      this.maxLux = 188000;
      this.luxAtual = this.minLux;
    }
  
    // Method to simulate lux measurement
    sensorLux() {
      // Generate a random lux value within range, adjust based on simulated environment
      this.luxAtual = this.minLux + Math.random() * (this.maxLux - this.minLux);
      return this.luxAtual;
    }
  }
  
  // Usage
const virtualMAX44009 = new MAX44009();

setInterval(() => {
    const data = virtualMAX44009.sensorLux();
    console.log(`Simulated Lux Reading: ${data.toFixed(2)} lux`);
  }, 2000);