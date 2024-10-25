class ZWPH101Sensor {
    //Código para simular o funcionamento de um sensor de pH modelo ZW-PH101
    constructor() {
        this.minTemp = 0;
        this.maxTemp = 50;
        // Limites de voltagem para um pH entre 0 e 14 numa temperatura base de 25°C
        this.minVolt = -414.12;
        this.maxVolt = 414.12;
    }

    // Simula temperatura para a medição
    getTemp() {
        const temp = Math.random() * (this.maxTemp - this.minTemp) + this.minTemp;
        return temp.toFixed(2);
    }

    // Simula voltagem para a medição
    getVolt() {
        const volt = Math.random() * (this.maxVolt - this.minVolt) + this.minVolt;
        return volt.toFixed(2);
    }

    voltagemToPH(voltagem, temperatura) {
        // Converte a temperatura pra kelvin
        const K = parseFloat(temperatura) + 273.15;
    
        // Calcula a slope ajustada pela temperatura
        const baseSlope = 59.16; //Padrão em 25°C
        // Diferença entre a temperatura medida e 25°C, em kelvin
        const tempDiff = K - 298;
        // Ajusta a slope pra temperatura
        const slope = baseSlope + (0.2 * tempDiff); 
    
        // Calcula o pH
        let pH = 7 - (voltagem / slope);
        // Ajusta o pH para o 0.02 mais próximo, por especificação do modelo do sensor
        pH = Math.round(pH / 0.02) * 0.02;
    
        return pH.toFixed(2);
    }
    
    //Simula uma leitura do sensor gerando os valores de voltagem, temperatura, e também pegando a timestamp do momento da leitura
    readSensorData() {
        const now = new Date();
        const temp = this.getTemp();
        const volt = this.getVolt();
        const pH = this.voltagemToPH(volt, temp);
        return {
          time: now.toISOString(),
          temp: `${temp}`,
          volt: `${volt}`,
          ph: `${pH}`
        };
    }

}

const pHSensor = new ZWPH101Sensor();

setTimeout(() => {
    const data = pHSensor.readSensorData();
    console.log(`Voltagem: ${data.volt} mV, pH: ${data.ph}, Temperatura: ${data.temp}°C, Hora: ${data.time}`);
}, 1000); 
