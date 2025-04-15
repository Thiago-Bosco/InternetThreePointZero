/**
 * Aplicativo Internet 3.0 - Página de diagnóstico estática
 * 
 * Esta versão é completamente estática, sem chamadas de API ou WebSockets
 * para auxiliar no diagnóstico de problemas de conectividade.
 */
function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Internet 3.0</h1>
          <p className="text-blue-100">Navegador Descentralizado - Página Estática</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Diagnóstico de Conectividade</h2>
            <p className="text-gray-600 mb-4">
              Esta é uma página estática para verificar o funcionamento básico da aplicação, 
              sem depender de conexões complexas com o servidor.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 mb-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Renderização da página funcionando corretamente!</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Informações de diagnóstico:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>URL:</strong> {window.location.href}</li>
              <li><strong>Host:</strong> {window.location.host}</li>
              <li><strong>Protocolo:</strong> {window.location.protocol}</li>
              <li><strong>Data/Hora:</strong> {new Date().toLocaleString()}</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4">
          <button 
            onClick={() => alert('Essa é uma versão estática da aplicação Internet 3.0')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Verificar Status
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Sem conexões WebSocket ou chamadas de API</p>
        <p>© 2025 Projeto Internet 3.0</p>
      </div>
    </div>
  );
}

export default App;
