import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function SimpleTest() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testApi = async () => {
    try {
      setApiStatus('loading');
      setMessage('Testando conexão...');

      // Testando chamada GET simples
      const response = await fetch('/api/test', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiStatus('success');
        setMessage(`API está acessível! Resposta: ${data.message || 'Servidor funcionando'}`);
      } else {
        setApiStatus('error');
        setMessage(`API retornou status ${response.status}`);
      }
    } catch (error) {
      setApiStatus('error');
      setMessage(`Erro ao acessar API: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Erro ao testar API:', error);
    }
  };

  const handleReset = () => {
    setApiStatus('idle');
    setMessage('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Diagnóstico de Conectividade</CardTitle>
        <CardDescription>
          Verifique se a API do servidor está funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {apiStatus === 'idle' && (
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Teste não iniciado</AlertTitle>
            <AlertDescription>Clique no botão abaixo para testar a conexão com a API</AlertDescription>
          </Alert>
        )}

        {apiStatus === 'loading' && (
          <div className="flex items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <span className="ml-3">Testando conexão com o servidor...</span>
          </div>
        )}

        {apiStatus === 'success' && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Conexão estabelecida</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {apiStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de conectividade</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Informações de diagnóstico:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>URL atual: {window.location.href}</li>
            <li>Host: {window.location.host}</li>
            <li>Protocolo: {window.location.protocol}</li>
            <li>User Agent: {navigator.userAgent}</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Button 
          onClick={testApi} 
          disabled={apiStatus === 'loading'}
          className="flex-1"
        >
          {apiStatus === 'success' || apiStatus === 'error' ? 'Testar novamente' : 'Iniciar teste'}
        </Button>
        {(apiStatus === 'success' || apiStatus === 'error') && (
          <Button 
            onClick={handleReset} 
            variant="outline"
          >
            Limpar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}