
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, AlertCircle } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  category: string;
  steps: string[];
  expectedResult: string;
  status: 'pending' | 'passed' | 'failed';
  notes?: string;
}

export default function BrowserTests() {
  const [testCases, setTestCases] = useState<TestCase[]>([
    // Navegação Principal
    {
      id: 'nav-1',
      name: 'Botão Voltar',
      category: 'Navegação Principal',
      steps: [
        'Navegar para uma página qualquer',
        'Clicar no botão voltar',
      ],
      expectedResult: 'Deve retornar à página anterior',
      status: 'pending'
    },
    {
      id: 'nav-2',
      name: 'Botão Home',
      category: 'Navegação Principal',
      steps: [
        'Em qualquer página, clicar no botão home',
      ],
      expectedResult: 'Deve redirecionar para a página inicial (/)',
      status: 'pending'
    },
    
    // Barra de Endereço
    {
      id: 'addr-1',
      name: 'Pesquisa por URL',
      category: 'Barra de Endereço',
      steps: [
        'Digite uma URL válida na barra de endereço',
        'Pressione Enter',
      ],
      expectedResult: 'Deve carregar a página corretamente via proxy',
      status: 'pending'
    },
    {
      id: 'addr-2',
      name: 'Pesquisa Google',
      category: 'Barra de Endereço',
      steps: [
        'Digite um termo de busca',
        'Pressione Enter',
      ],
      expectedResult: 'Deve realizar busca no Google',
      status: 'pending'
    },
    
    // Sistema de Abas
    {
      id: 'tabs-1',
      name: 'Criar Nova Aba',
      category: 'Sistema de Abas',
      steps: [
        'Clicar no botão de nova aba',
      ],
      expectedResult: 'Nova aba deve ser criada com página inicial',
      status: 'pending'
    },
    {
      id: 'tabs-2',
      name: 'Fechar Aba',
      category: 'Sistema de Abas',
      steps: [
        'Criar múltiplas abas',
        'Clicar no botão de fechar em uma aba',
      ],
      expectedResult: 'Aba deve ser fechada e foco deve ir para aba adjacente',
      status: 'pending'
    },
    
    // Links e Redirecionamentos
    {
      id: 'links-1',
      name: 'Links Internos',
      category: 'Links e Redirecionamentos',
      steps: [
        'Clicar em links internos (/chat, /feed, etc)',
      ],
      expectedResult: 'Deve navegar corretamente entre páginas internas',
      status: 'pending'
    },
    
    // Interface Responsiva
    {
      id: 'resp-1',
      name: 'Layout Mobile',
      category: 'Interface Responsiva',
      steps: [
        'Redimensionar janela para width < 768px',
      ],
      expectedResult: 'Interface deve se adaptar ao tamanho mobile',
      status: 'pending'
    },
    
    // Feedback Visual
    {
      id: 'feed-1',
      name: 'Indicadores de Loading',
      category: 'Feedback Visual',
      steps: [
        'Iniciar carregamento de página',
      ],
      expectedResult: 'Deve exibir indicador de carregamento',
      status: 'pending'
    },
    
    // Performance
    {
      id: 'perf-1',
      name: 'Carregamento Inicial',
      category: 'Performance',
      steps: [
        'Abrir aplicação',
        'Verificar tempo até interatividade',
      ],
      expectedResult: 'Deve carregar em menos de 3 segundos',
      status: 'pending'
    },
  ]);

  const updateTestStatus = (id: string, status: 'passed' | 'failed', notes?: string) => {
    setTestCases(cases => 
      cases.map(test => 
        test.id === id ? { ...test, status, notes } : test
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'passed':
        return <Check className="text-green-500" />;
      case 'failed':
        return <X className="text-red-500" />;
      default:
        return <AlertCircle className="text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Testes de Usabilidade</h1>
      
      {['Navegação Principal', 'Barra de Endereço', 'Sistema de Abas', 'Links e Redirecionamentos', 
        'Interface Responsiva', 'Feedback Visual', 'Performance'].map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold">{category}</h2>
          <div className="grid gap-4">
            {testCases
              .filter(test => test.category === category)
              .map(test => (
                <Card key={test.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        <strong>Passos:</strong>
                        <ul className="list-disc pl-4 mt-1">
                          {test.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-sm mt-2">
                        <strong>Resultado Esperado:</strong>
                        <p className="mt-1">{test.expectedResult}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant={test.status === 'passed' ? 'outline' : 'default'}
                          onClick={() => updateTestStatus(test.id, 'passed')}
                        >
                          Passou
                        </Button>
                        <Button
                          size="sm"
                          variant={test.status === 'failed' ? 'outline' : 'destructive'}
                          onClick={() => updateTestStatus(test.id, 'failed')}
                        >
                          Falhou
                        </Button>
                      </div>
                    </div>
                  </div>
                  {test.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Notas:</strong> {test.notes}
                    </div>
                  )}
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
