const express = require('express'); 
const app = express();  
const port = 3000; 

// Deixar a palavra com letra maiuscula no inicio
function inicialMaiuscula(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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

    setValue(newValue) {
        const limite = {
            temperatura: { min: "minTemp", max: "maxTemp" },
            umidade: { min: "minUmid", max: "maxUmid" },
            pH: { min: "minPH", max: "maxPH" },
        };
    
        if (!limite[this.tipo]) {
            throw new Error(`Tipo de sensor não existe`);
        }
    
        const { min, max } = limite[this.tipo];
        const limiteMin = this[min];
        const limiteMax = this[max];
    
        if (newValue < limiteMin || newValue > limiteMax) {
            throw new Error(
                `Valor ${newValue} fora do alcance ${this.tipo}: [${limiteMin}, ${limiteMax}]`
            );
        }
    
        this.value = newValue;
    }
    
} 


class ApiMiddleware {
    constructor() {
        this.sensors = [];
        this.R1 = 0;
        this.R2 = 0;
        this.idt = 0;
        this.middlewareId = "middleware_001";
        this.trapQueue = [];

    }

    addSensor(sensor) {
        this.sensors.push(sensor);
    }

    // GET
    getPayload(pedidoSensor = []) {
        const selecionaSensor = this.filtraSensor(pedidoSensor);
        const payload = this.formataPayload(selecionaSensor, "GET");
        return payload;
    }
    

    // RESPONSE
    sendResponse(requestedSensors = []) {
        let selecionaSensor = this.filtraSensor(requestedSensors);
        const payload = this.formataPayload(selecionaSensor, "RESPONSE");
        return payload;
}

    // SET
    setSensor(sensorId, newValue) {
        const sensor = this.sensors.find(s => s.id === sensorId);
        if (!sensor) throw new Error(`Sensor com ID ${sensorId} não encontrado.`);

        sensor.setValue(newValue); 
        return { success: true, message: `Sensor ${sensorId} atualizado para ${newValue}.` };
    }

    // TRAP
    sendTrap(mensagemAlerta) {
        const payload = {
            idm: this.middlewareId,
            idt: this.idt.toString().padStart(16, '0'),
            type: "TRAP",
            timestamp: Math.floor(Date.now() / 1000),
            alert: mensagemAlerta
        };
        this.trapQueue.push(payload);
        return payload;
    }

    getTrap() {
        return this.trapQueue;
    }

    limpaTrapQueue() {
        this.trapQueue = [];
    }

    // Função para escolher os sensores
    filtraSensor(pedidoSensor) {
        if (pedidoSensor.length === 0) {
            return this.sensors; // Retorna todos se nenhum for escolhido
        }
        return this.sensors.filter(sensor => pedidoSensor.includes(sensor.tipo));
    }
    
    

    // Função para formatar o payload
    formataPayload(selecionaSensor, tipo) {
        const nvarBinario = selecionaSensor.length.toString(2).padStart(8, '0');
        let payload = {
            idm: this.middlewareId,
            idt: this.idt.toString().padStart(16, '0'),
            type: tipo,
            timestamp: Math.floor(Date.now() / 1000),
            nvar: nvarBinario
        };

        selecionaSensor.forEach((sensor, index) => {
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

        this.R1 = selecionaSensor.length;
        this.R2 += this.R1;
        this.idt = this.R2;

        return payload;
    }
    
    // Condições do TRAP
    checkTrap() {
        this.sensors.forEach(sensor => {
            let trapMensagem = null;
            try {
                const value = sensor.readValue();

                if (sensor.tipo === 'temperatura' && (value < 10 || value > 50)) {
                    trapMensagem = `Alerta de temperatura: Sensor ${sensor.id} com temperatura de ${value}°C.`;
                } else if (sensor.tipo === 'umidade' && (value < 10 || value > 90)) {
                    trapMensagem = `Alerta de umidade: Sensor ${sensor.id} com umidade de ${value}%.`;
                }

                if (trapMensagem) {
                    const trapPayload = this.sendTrap(trapMensagem);
                }
            } catch (error) {
                console.error(`Erro no sensor ${sensor.id}: ${error.message}`);
            }
        });
    }

    startTrapEvaluation(interval = 10000) {
        setInterval(() => {
            this.checkTrap();
        }, interval);
    }

}


const middleware = new ApiMiddleware();
const temperaturaSensor = new Sensor("001", "temperatura", 0, "°C", { minTemp: -40, maxTemp: 80 });
const umidadeSensor = new Sensor("002", "umidade", 0, "%", { minUmid: 0, maxUmid: 100 });
const phSensor = new Sensor("003", "ph", 0, "pH", { minPh: 0, maxPh: 14 });
middleware.addSensor(temperaturaSensor);
middleware.addSensor(umidadeSensor);
middleware.addSensor(phSensor);

app.use(express.json());  
// Rota GET
app.get('/sensor-data', (req, res) => {
    const sensorPedido = req.query.sensors ? req.query.sensors.split(',') : [];
    middleware.requestQueue = sensorPedido;
    res.json({ message: "Sensores pedidos", sensorPedido: sensorPedido });
});

// Rota SET
app.post('/sensor-set', express.json(), (req, res) => {
    const { updates } = req.body; 

    if (!Array.isArray(updates)) {
        return res.status(400).json({ message: "Input Invalido" });
    }

    const results = updates.map(update => {
        const { sensorId, newValue, newMin, newMax } = update;
        try {
            const sensor = middleware.sensors.find(s => s.id === sensorId);
            if (!sensor) throw new Error(`Sensor ${sensorId} não encontrado`);

            if (newValue !== undefined) sensor.setValue(newValue);
            if (newMin !== undefined) sensor[`min${inicialMaiuscula(sensor.tipo)}`] = newMin;
            if (newMax !== undefined) sensor[`max${inicialMaiuscula(sensor.tipo)}`] = newMax;

            let message = `Sensor ${sensorId} atualizado`;
            if (newValue !== undefined) message += ` Valor setado para ${newValue}.`;
            if (newMin !== undefined || newMax !== undefined) {
                message += ` Alcance setado para [${sensor[`min${inicialMaiuscula(sensor.tipo)}`]}, ${sensor[`max${inicialMaiuscula(sensor.tipo)}`]}].`;
            }

            return { sensorId, status: "ok", message };
        } catch (error) {
            return { sensorId, status: "erro", message: error.message };
        }
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ results }, null, 2));     
});

// Rota TRAP
app.get('/trap', (req, res) => {
    const traps = middleware.getTrap();
    res.status(200).json(traps); 
    middleware.limpaTrapQueue(); 
});

// Rota RESPONSE
app.post('/sensor-response', express.json(), (req, res) => {
    const { sensorPedido } = req.body;

    if (!sensorPedido || !Array.isArray(sensorPedido)) {
        return res.status(400).json({ error: "'sensorPedido' vazio" });
    }

    const payload = middleware.getPayload(sensorPedido);
    res.json({ message: "Resposta gerada", data: payload });
    res.send(JSON.stringify({ payload }, null, 2));     
});

middleware.startTrapEvaluation(10000);

app.listen(port, () => {
    console.log(`Server Port: http://localhost:${port}`);
});