class MotorDC {
    constructor(maxTensao, maxPotencia, rpmSemCarga, corrente) {
        //Virtualização baseada nas especificações do Motor DC WEG 12V cc 30w
        this.maxTensao = maxTensao;              
        this.maxPotencia = maxPotencia;          
        this.rpmSemCarga = rpmSemCarga;         
        this.corrente = corrente; 
        this.tensao = 0;                         
        this.velocidade = 0;                  
        this.torque = 0;                      
        this.consumoCorrente = 0;      
        this.carga = 0;               
        this.operando = false;       
        this.kVelocidade = rpmSemCarga / maxTensao;  // Constante para calcular velocidade com base na tensão
        this.kTorque = maxPotencia / (rpmSemCarga * 2 * Math.PI / 60);  // Constante para calcular torque em função da potência
    }

    // Ligar o motor
    iniciar(tensao) {
        if (tensao > this.maxTensao) {
            console.log("Tensão além do limite máximo.");
        } else {
            this.operando = true;
            this.tensao = tensao;
            console.log("Motor DC ligado com tensão de " + tensao + "V.");
            this.atualizarParametros();
        }
    }

    // Desligar o motor
    parar() {
        this.operando = false;
        this.velocidade = 0;
        this.torque = 0;
        this.consumoCorrente = 0;
        this.tensao = 0;
        console.log("Motor DC desligado.");
    }

    // Ajustar a cara
    ajustarCarga(novaCarga) {
        if (novaCarga < 0 || novaCarga > 100) {
            console.log("Valor Inválido.");
        } else {
            this.carga = novaCarga;
            this.atualizarParametros();
        }
    }

    // Atualiza os parametros
    atualizarParametros() {
        if (this.operando) {
            this.velocidade = this.tensao * this.kVelocidade * (1 - this.carga / 100);
            this.torque = this.kTorque * (this.carga / 100);
            this.consumoCorrente = this.corrente * (this.carga / 100);
            this.displayStatus();
        }
    }

    displayStatus() {
        console.log(`Tensão: ${this.tensao}V`);
        console.log(`Velocidade: ${this.velocidade.toFixed(0)} RPM`);
        console.log(`Torque: ${this.torque.toFixed(2)} Nm`);
        console.log(`Consumo de Corrente: ${this.consumoCorrente.toFixed(2)} A`);
    }
}

const motorDC = new MotorDC(12, 30, 3000, 2.5);

motorDC.iniciar(12);
motorDC.ajustarCarga(50);

// Aumenta a carga pra 80%
setTimeout(() => {
    motorDC.ajustarCarga(80);
}, 3000);

// Reduz a carga pra 20%
setTimeout(() => {
    motorDC.ajustarCarga(20);
}, 3000);


setTimeout(() => {
    motorDC.parar();
}, 6000);
