
export class PerformanceOptimizer {
  private worker: Worker | null = null;

  initializeWorker() {
    this.worker = new Worker(new URL('./workers/main.worker.ts', import.meta.url));
    
    this.worker.onmessage = (event) => {
      console.log('Resultado do worker:', event.data);
    };
  }

  async processBatch(data: any[]) {
    if (!this.worker) this.initializeWorker();
    
    // Usar SharedArrayBuffer para transferência eficiente
    const buffer = new SharedArrayBuffer(data.length * 4);
    const view = new Int32Array(buffer);
    
    data.forEach((item, index) => {
      view[index] = item;
    });

    this.worker!.postMessage({ buffer, length: data.length }, [buffer]);
  }

  enableLowPowerMode() {
    // Reduzir frequência de atualizações
    document.body.style.setProperty('--animation-duration', '0.5s');
    
    // Desativar efeitos visuais pesados
    document.documentElement.classList.add('low-power-mode');
    
    // Limitar framerate
    if (window.requestAnimationFrame) {
      let lastTime = 0;
      const throttle = (callback: FrameRequestCallback) => {
        return (time: number) => {
          if (time - lastTime >= 32) { // ~30fps
            lastTime = time;
            callback(time);
          }
          requestAnimationFrame(throttle(callback));
        };
      };
      window.requestAnimationFrame = throttle as any;
    }
  }
}
