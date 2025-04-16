
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
// Performance utilities
export const prefetchResources = async (url: string) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract and prefetch resources
    const resources = extractResources(html);
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  } catch (error) {
    console.warn('Erro no prefetch:', error);
  }
};

export const extractResources = (html: string) => {
  const resources: string[] = [];
  const matches = html.match(/(?:href|src)=["'](.*?)["']/g) || [];
  
  matches.forEach(match => {
    const url = match.split(/["']/)[1];
    if (url && !url.startsWith('data:')) {
      resources.push(url);
    }
  });
  
  return resources;
};

// Otimizador de memória
export const optimizeMemoryUsage = () => {
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory;
    if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
      // Limpar caches não essenciais
      clearOldCaches();
    }
  }
};

const clearOldCaches = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name.startsWith('dynamic-') && 
      parseInt(name.split('-')[1]) < Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    
    await Promise.all(oldCaches.map(name => caches.delete(name)));
  }
};
