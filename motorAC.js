class MotorAC {
    constructor() {
        //Virtualização baseada nas especificações do Motor AC WEG 1CV
        this.maxRPM = 1800;
        this.rpm = 0;
        this.torque = 0;  
        this.consumoCorrente = 0;
        this.potenciaNominal = 746;
        this.operando = false;
        this.carga = 0;  
    }

    // Liga o motor
    iniciar() {
        this.operando = true;
        console.log("Motor AC ligado.");
        this.atualizarParametros();
    }

    // Desliga o motor
    parar() {
        this.operando = false;
        this.rpm = 0;
        this.torque = 0;
        this.consumoCorrente = 0;
        console.log("Motor AC desligado.");
    }

    // Ajusta a carga do motor
    ajustarCarga(novaCarga) {
        if (novaCarga < 0 || novaCarga > 100) {
            console.log("Valor Invalido.");
        } else {
            this.carga = novaCarga;
            this.atualizarParametros();
        }
    }

    // Atualiza os valores baseados na porcentagem da carga recebida
    atualizarParametros() {
        if (this.operando) {
            // Ajuste o RPM
            // Fator de deslizamento
            const slipFactor = this.carga / 100 * 0.1;
            // RPM reduzido com o deslizamento
            this.rpm = this.maxRPM * (1 - slipFactor);  

            // Torque como % da carga
            this.torque = this.carga;  

            // Consumo de corrente
            // Fórmula: I = P / (V * cos O * n) -> aproximando com cos O=0.8 e n=0.85
            const cosPhi = 0.8;
            const eficiencia = 0.85;
            const tensao = 220;

            // Corrente calculada
            this.consumoCorrente = this.potenciaNominal / (tensao * cosPhi * eficiencia) * (this.carga / 100);

            this.displayStatus();
        }
    }

    displayStatus() {
        console.log(`RPM: ${this.rpm.toFixed(0)}`);
        console.log(`Torque: ${this.torque.toFixed(2)}%`);
        console.log(`Consumo de Corrente: ${this.consumoCorrente.toFixed(2)} A`);
    }
}

const motor = new MotorAC();

motor.iniciar();
motor.ajustarCarga(50);

// Aumento de carga para 70%
setTimeout(() => {
    motor.ajustarCarga(70);
}, 3000);

// Redução de carga para 30%
setTimeout(() => {
    motor.ajustarCarga(30);
}, 6000);

setTimeout(() => {
    motor.parar();
}, 9000);
