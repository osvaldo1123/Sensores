class Nema17 {
    //Motor de passo baseado no modelo Nema17
    constructor(passoVolta = 200, maxRPM = 500) {
        this.passoVolta = passoVolta;
        this.passoAtual = 0;
        this.direc = 1;  // 1 para horário, -1 para anti-horário
        this.timer = null;
        this.rpm = 60;  // Definindo uma velocidade inicial
        this.maxRPM = maxRPM;
    }

    // Define a direção de rotação
    setDirec(direc) {
        this.direc = direc === "horario" ? 1 : -1;
    }

    // Ajusta a velocidade do motor em RPM (limitado pelo maxRPM)
    setRPM(rpm) {
        this.rpm = Math.min(rpm, this.maxRPM);
        this.atualizaPasso();
    }

    // Atualiza o intervalo entre os passos conforme o RPM
    atualizaPasso() {
        const passoMinuto = this.passoVolta * this.rpm;
        const passoIntervalo = (60 * 1000) / passoMinuto; // milissegundos por passo
        return passoIntervalo;
    }

    // Inicia o motor simulando o movimento de passos
    start() {
        if (this.timer) clearInterval(this.timer);
        const interval = this.atualizaPasso();
        this.timer = setInterval(() => this.move(), interval);
    }

    // Para o motor
    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }

    // Movimenta um passo de acordo com a direção
    move() {
        this.passoAtual = (this.passoAtual + this.direc + this.passoVolta) % this.passoVolta;
        console.log(`Passo: ${this.passoAtual}, Angulo: ${(360 / this.passoVolta) * this.passoAtual}°`);
    }
}


const nema17 = new Nema17();
nema17.setDirec("horario");
nema17.setRPM(200);  // Define a velocidade para 200 RPM
nema17.start();

// Para a simulação depois de 5 segundos
setTimeout(() => nema17.stop(), 5000);
