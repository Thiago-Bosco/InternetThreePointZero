import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  CheckCircle, 
  HardDrive, 
  Globe, 
  ShieldCheck, 
  Network, 
  Server,
  Cpu
} from 'lucide-react';

export default function DownloadPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('windows');
  
  const startDownload = () => {
    setDownloadStarted(true);
    
    // Simulação de download
    setTimeout(() => {
      setDownloadStarted(false);
    }, 3000);
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Baixe o Navegador Internet 3.0</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Acesse a web descentralizada, compartilhe arquivos P2P, proteja sua privacidade
          e conecte-se diretamente com outros usuários.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Por que usar o Internet 3.0?</CardTitle>
            <CardDescription>
              Um navegador descentralizado feito para a nova internet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Privacidade e Segurança</h3>
                <p className="text-sm text-muted-foreground">
                  Controle total sobre seus dados, sem rastreamento ou vigilância.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Network className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Navegação Descentralizada</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse conteúdo via IPFS, não dependa de servidores centralizados.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Globe className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Resistente à Censura</h3>
                <p className="text-sm text-muted-foreground">
                  Conteúdo distribuído e autenticado por criptografia.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Server className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Compartilhamento P2P</h3>
                <p className="text-sm text-muted-foreground">
                  Troque arquivos diretamente, sem intermediários.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Requisitos do Sistema</CardTitle>
            <CardDescription>
              Verifique a compatibilidade com seu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Cpu className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Processador</h3>
                <p className="text-sm text-muted-foreground">
                  Intel Core i3 / AMD Ryzen 3 ou superior
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <HardDrive className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Memória</h3>
                <p className="text-sm text-muted-foreground">
                  4 GB RAM mínimo, 8 GB RAM recomendado
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Server className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Armazenamento</h3>
                <p className="text-sm text-muted-foreground">
                  500 MB para instalação, espaço adicional para cache IPFS
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Globe className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium">Conectividade</h3>
                <p className="text-sm text-muted-foreground">
                  Conexão à internet de banda larga, portas abertas para P2P
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Escolha sua plataforma</CardTitle>
          <CardDescription>
            O Internet 3.0 está disponível para os principais sistemas operacionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="windows" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="windows">Windows</TabsTrigger>
              <TabsTrigger value="mac">macOS</TabsTrigger>
              <TabsTrigger value="linux">Linux</TabsTrigger>
            </TabsList>
            
            <TabsContent value="windows" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-100 dark:border-blue-900">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Internet 3.0 para Windows</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                  Versão 1.0.0 Beta | 64-bit | Windows 10/11
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    <p>SHA-256: 8d7e1b8a92512b8e5c4a9d7b9f82a9c5d7b9f82a9c5...</p>
                    <p>Data: 15/04/2025</p>
                  </div>
                  <Button 
                    variant={downloadStarted ? "outline" : "default"} 
                    className="gap-2"
                    disabled={downloadStarted}
                    onClick={startDownload}
                  >
                    {downloadStarted ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Baixando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Baixar (85 MB)</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground mb-2">Instruções de instalação:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Baixe o instalador do Internet 3.0</li>
                  <li>Execute o arquivo .exe baixado</li>
                  <li>Siga as instruções do assistente de instalação</li>
                  <li>O navegador será iniciado automaticamente após a instalação</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="mac" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-100 dark:border-blue-900">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Internet 3.0 para macOS</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                  Versão 1.0.0 Beta | Universal (Intel/Apple Silicon) | macOS 11+
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    <p>SHA-256: 7c3e2b9a83401b7d6c3a8d6b8f72a8c4d6b8f72a8c4...</p>
                    <p>Data: 15/04/2025</p>
                  </div>
                  <Button 
                    variant={downloadStarted ? "outline" : "default"} 
                    className="gap-2"
                    disabled={downloadStarted}
                    onClick={startDownload}
                  >
                    {downloadStarted ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Baixando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Baixar (92 MB)</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground mb-2">Instruções de instalação:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Baixe o arquivo .dmg</li>
                  <li>Abra o arquivo baixado</li>
                  <li>Arraste o ícone do Internet 3.0 para a pasta Aplicativos</li>
                  <li>Na primeira execução, clique com o botão direito e selecione "Abrir"</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="linux" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-100 dark:border-blue-900">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Internet 3.0 para Linux</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                  Versão 1.0.0 Beta | 64-bit | .deb, .rpm, AppImage
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    <p>SHA-256: 5a2e4b7c9d8f3a1b6e0c8d7e4b2a1c9d8f3a1b6e0...</p>
                    <p>Data: 15/04/2025</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="gap-1 text-xs"
                      onClick={startDownload}
                    >
                      <Download className="h-3 w-3" />
                      <span>.deb</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-1 text-xs"
                      onClick={startDownload}
                    >
                      <Download className="h-3 w-3" />
                      <span>.rpm</span>
                    </Button>
                    <Button 
                      variant="default" 
                      className="gap-1 text-xs"
                      onClick={startDownload}
                    >
                      <Download className="h-3 w-3" />
                      <span>AppImage</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground mb-2">Instruções de instalação:</h4>
                <p className="mb-2"><strong>Pacote .deb (Ubuntu, Debian, Mint):</strong></p>
                <pre className="bg-muted p-2 rounded text-xs mb-4">
                  sudo dpkg -i internet3-browser_1.0.0_amd64.deb<br />
                  sudo apt install -f
                </pre>
                
                <p className="mb-2"><strong>Pacote .rpm (Fedora, CentOS, RHEL):</strong></p>
                <pre className="bg-muted p-2 rounded text-xs mb-4">
                  sudo rpm -i internet3-browser-1.0.0.x86_64.rpm
                </pre>
                
                <p className="mb-2"><strong>AppImage:</strong></p>
                <pre className="bg-muted p-2 rounded text-xs">
                  chmod +x Internet3-Browser-1.0.0.AppImage<br />
                  ./Internet3-Browser-1.0.0.AppImage
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Código Aberto</CardTitle>
          <CardDescription>
            O Internet 3.0 é um projeto de código aberto sob licença GPL-3.0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Acreditamos na transparência e no poder da comunidade. O código-fonte completo do Internet 3.0
            está disponível no GitHub para revisão, contribuição e auditoria.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span>Ver no GitHub</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Documentação para Desenvolvedores</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}