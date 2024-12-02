const express = require('express'); 
const app = express();  
const port = 3000; 


class Sensor {
    //Construtor do sensor, definindo os limites dos valores
    constructor(id, tipo, value, unit, minValue = {}, maxValue = {}) {
        this.id = id;
        this.tipo = tipo;
        this.value = value;
        this.unit = unit;
        
        this.minTemp = minValue.minTemp || -40;
        this.maxTemp = maxValue.maxTemp || 80;
        this.minUmid = minValue.minUmid || 0;
        this.maxUmid = maxValue.maxUmid || 100;
        this.minPh = minValue.minPh || 0;
        this.maxPh = maxValue.maxPh || 14;
    }

    //Chama o sensor do tipo que é pedido na mensagem
    readValue() {
        try {
            if (this.tipo === 'temperatura') {
                this.value = this.calculaTemperatura();
            } else if (this.tipo === 'umidade') {
                this.value = this.calculaUmidade();
            } else if (this.tipo === 'ph') {
                this.value = this.calculaPh();
            }

            if (isNaN(this.value)) {
                throw new Error(`Valor invalido para${this.tipo}: ${this.value}`);
            }
            return this.value;
        } catch (error) {
            console.error(error.message);
            return null; 
        }
    }

    //Calcula a temperatura
    calculaTemperatura(baseValue = null) {
        const baseTemp = baseValue !== null ? baseValue : Math.random() * (this.maxTemp - this.minTemp) + this.minTemp;
        const accError = (Math.random() * 4 - 2).toFixed(1);
        const finalTemp = parseFloat(baseTemp) + parseFloat(accError);

        if (isNaN(finalTemp) || finalTemp < this.minTemp || finalTemp > this.maxTemp) {
            throw new Error('Temperatura fora do alcance');
        }

        return this.validaValue(finalTemp, this.minTemp, this.maxTemp).toFixed(1);
    }

    //Calcula a umidade
    calculaUmidade(baseValue = null) {
        const baseUmid = baseValue !== null ? baseValue : Math.random() * (this.maxUmid - this.minUmid) + this.minUmid;
        const accError = (Math.random() * 10 - 5).toFixed(1);
        const finalUmid = parseFloat(baseUmid) + parseFloat(accError);

        if (isNaN(finalUmid) || finalUmid < this.minUmid || finalUmid > this.maxUmid) {
            throw new Error('Umidade fora do alcance');
        }

        return this.validaValue(finalUmid, this.minUmid, this.maxUmid).toFixed(1);
    }

    //Calcula o pH
    calculaPh(voltagem = 0.5, temperatura = null) {
        if (temperatura === null) {
            temperatura = this.calculaTemperatura();
        }

        const K = parseFloat(temperatura) + 273.15;
        const baseSlope = 59.16;
        const tempDiff = K - 298;
        const slope = baseSlope + (0.2 * tempDiff); 
        let pH = 7 - (voltagem / slope);

        if (isNaN(pH) || pH < this.minPh || pH > this.maxPh) {
            throw new Error('pH fora do alcance');
        }

        pH = Math.round(pH / 0.02) * 0.02;
        return pH.toFixed(2);
    }

    //Garante que os valores estão dentro dos limites
    validaValue(value, min, max) {
        if (value < min || value > max) {
            throw new Error(`Valor ${value} fora do alcance. Limites: [${min}, ${max}]`);
        }
        return value;
    }
}


class ApiMiddleware {
    constructor() {
        this.sensors = []; // Lista de sensores
        this.R1 = 0; // Tamanho da mensagem atual
        this.R2 = 0; // Tamanho acumulado das mensagens anteriores
        this.idt = 0;
        this.middlewareId = "middleware1"; 
    }

    // Adiciona sensor
    addSensor(sensor) {
        this.sensors.push(sensor);
    }

    // Gera a mensagem do payload
    geraPayload(pedidoSensor = []) {
        let escolheSensor = [];

        if (pedidoSensor.length > 0) {
            //Seleciona os sensores de acordo com a mensagem
            escolheSensor = this.sensors.filter(sensor => pedidoSensor.includes(sensor.tipo));
        } else {
            escolheSensor = this.sensors;
        }

        // Converte o número de pares de id/valor para binário
        const nvarBinario = escolheSensor.length.toString(2).padStart(8, '0');

        // Estrutura do payload
        let payload = {
            idm: this.middlewareId,
            ids: escolheSensor.map(sensor => sensor.id).join(','), 
            idt: this.idt.toString().padStart(16, '0'),
            type: "W",
            timestamp: Math.floor(Date.now() / 1000),
            nvar: nvarBinario, 
            community: "teste"
        };

        escolheSensor.forEach((sensor, index) => {
            try {
                const value = sensor.readValue();
                if (value !== null) {
                    payload[`idv${index + 1}`] = sensor.tipo;
                    payload[`value${index + 1}`] = value;
                }
            } catch (error) {
                payload[`idv${index + 1}`] = sensor.tipo;
                payload[`value${index + 1}`] = `Error: ${error.message}`;
            }
        });

        // Incrementa R1, R2, e IDT
        this.R1 = escolheSensor.length;
        this.R2 += this.R1;
        this.idt = this.R2; 

        return payload;
    }
}

const middleware = new ApiMiddleware();
const temperaturaSensor = new Sensor("001", "temperatura", 0, "°C", { minTemp: -40, maxTemp: 80 });
const umidadeSensor = new Sensor("002", "umidade", 0, "%", { minUmid: 0, maxUmid: 100 });
const phSensor = new Sensor("003", "ph", 0, "pH", { minPh: 0, maxPh: 14 });
middleware.addSensor(temperaturaSensor);
middleware.addSensor(umidadeSensor);
middleware.addSensor(phSensor);

// Rota GET
app.get('/sensor-data', (req, res) => {
    const pedidoSensor = req.query.sensors ? req.query.sensors.split(',') : []; 
    const payload = middleware.geraPayload(pedidoSensor); 

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(payload, null, 4)); 
});

app.listen(port, () => {
    console.log(`Server Port: http://localhost:${port}`);
});
