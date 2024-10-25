class YL83 {
    constructor() {
    // Define os valores iniciais
      this.isChuva = false;
      this.analogValor = 1023; // 1023 sendo seco, quanto menor o número, mais molhado
    }

    readSensor() {
      setInterval(() => {
        // Decide aleatoriamente se está chuvendo ou não para que a leitura seja feita
        this.isChuva = Math.random() < 0.5;
        //Se estiver chovendo, chama a função que vai simular a força da chuva, se não, retorna 1000 para o valor analógco
        if (this.isChuva) {
            this.analogValor = this.getChuva();
          } 
        else {
            this.analogValor = 1023;
          }
        this.display();
      }, 2000);
    }
  
    // Simula o valor analógico da chuva, entre 0 e 1022
    getChuva() {
      return Math.floor(Math.random() * 1023);
    }
  
    display() {
       let digitalValor;
        if (this.isChuva) {
          digitalValor = 0; // Chuva
        } else {
          digitalValor = 1; // Sem chuva
        }
      console.log(`Digital (D0): ${digitalValor}`);
      console.log(`Analogico (A0): ${this.analogValor}`);
      if (this.isChuva) {
        console.log(`Chuva. Valor Analógico: ${this.analogValor}`);
      } else {
        console.log("Seco");
      }
    }
  }
  
  // Instantiate the virtual YL-83 sensor and start simulation
  const virtualYL83 = new YL83();
  virtualYL83.readSensor();
  
