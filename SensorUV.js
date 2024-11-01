class VEML6075 {
    constructor() {
        // Coeficientes para calcular o índice UV usados no sensor modelo VEML6075
        this.UVACoef = 0.001461; 
        this.UVBCoef = 0.002591; 
    }

    // Gera valores aleatórios de intensidade, dentro de valores realistas (0 a 3500)
    readUVA() {
        return Math.floor(Math.random() * 3500); 
    }

    readUVB() {
        return Math.floor(Math.random() * 3500); 
    }

    // Calcula o índice UV a partir dos valores de UVA e UVB
    CalculaUV(uva, uvb) {
        const uvIndex = (uva * this.UVACoef + uvb * this.UVBCoef);
        return parseFloat(uvIndex.toFixed(2));
    }

    // Simula uma leitura do sensor
    readSensor() {
        const uva = this.readUVA();
        const uvb = this.readUVB();
        const uvIndex = this.CalculaUV(uva, uvb);
        
        console.log(`UVA: ${uva}, UVB: ${uvb}, UV Index: ${uvIndex}`);
        return { uva, uvb, uvIndex };
    }
}

// Lê os dados a cada 2 segundos
const virtualVEML6075 = new VEML6075();
setInterval(() => virtualVEML6075.readSensor(), 2000);
