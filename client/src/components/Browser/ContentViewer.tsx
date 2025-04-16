import { useEffect, useState } from "react";

interface ContentViewerProps {
  ipfsHash: string;
  isLoading: boolean;
}

export default function ContentViewer({
  ipfsHash,
  isLoading,
}: ContentViewerProps) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDirectHttpUrl, setIsDirectHttpUrl] = useState(false);
  const [httpUrl, setHttpUrl] = useState("");
  const [contentType, setContentType] = useState<string | null>(null);

  useEffect(() => {
    if (!ipfsHash) {
      setContent("");
      setIsDirectHttpUrl(false);
      setContentType(null);
      return;
    }

    const isHttpUrl =
      ipfsHash.startsWith("http://") || ipfsHash.startsWith("https://");
    const isYoutubeUrl =
      ipfsHash.includes("youtube.com") || ipfsHash.includes("youtu.be");
    const isImageUrl = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(ipfsHash);
    const isPdfUrl = /\.pdf$/i.test(ipfsHash);

    // Determine content type
    if (isYoutubeUrl) {
      setContentType("youtube");
    } else if (isImageUrl) {
      setContentType("image");
    } else if (isPdfUrl) {
      setContentType("pdf");
    } else if (isHttpUrl) {
      setIsDirectHttpUrl(true);
      setHttpUrl(ipfsHash);
      setContent("");
      return;
    } else {
      // Assume IPFS content
      setContentType("ipfs");
    }

    setIsDirectHttpUrl(false);

    const loadContent = async () => {
      try {
        setError(null);

        // Simulating loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (contentType === "youtube") {
          const videoId = extractYoutubeId(ipfsHash);
          if (videoId) {
            setContent(`
              <div class="flex justify-center items-center p-4">
                <div class="w-full max-w-3xl aspect-video">
                  <iframe 
                    class="w-full h-full rounded-lg shadow-lg"
                    src="https://www.youtube.com/embed/${videoId}?autoplay=0"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                  </iframe>
                </div>
              </div>
            `);
          } else {
            setError("ID do vídeo YouTube inválido");
          }
        } else if (contentType === "image") {
          setContent(`
            <div class="flex justify-center items-center p-4">
              <img 
                src="${ipfsHash}" 
                alt="Conteúdo da imagem" 
                class="max-w-full max-h-screen object-contain rounded-lg shadow-md"
              />
            </div>
          `);
        } else if (contentType === "pdf") {
          setContent(`
            <div class="flex justify-center items-center p-4">
              <div class="w-full max-w-4xl h-screen">
                <object
                  data="${ipfsHash}"
                  type="application/pdf"
                  class="w-full h-full rounded-lg shadow-lg"
                >
                  <p class="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    Seu navegador não suporta visualização de PDF. 
                    <a href="${ipfsHash}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      Clique aqui para baixar o PDF
                    </a>
                  </p>
                </object>
              </div>
            </div>
          `);
        } else if (contentType === "ipfs") {
          try {
            // Simulação de carga de conteúdo IPFS
            // Em produção, isso usaria uma API ou gateway IPFS
            const ipfsGateway = "https://ipfs.io/ipfs/";
            const content = await fetchIpfsContent(ipfsGateway + ipfsHash);
            setContent(content);
          } catch (err) {
            setError("Erro ao carregar conteúdo IPFS");
          }
        }
      } catch (err) {
        setError("Erro ao carregar conteúdo");
        console.error("Erro de carregamento:", err);
      }
    };

    loadContent();
  }, [ipfsHash, contentType]);

  // Extrai o ID de um URL do YouTube
  const extractYoutubeId = (url: string): string | null => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  // Simula busca de conteúdo IPFS
  const fetchIpfsContent = async (url: string): Promise<string> => {
    // Esta é uma simulação. Em produção, isso faria uma chamada real de API
    await new Promise((resolve) => setTimeout(resolve, 800));
    return `
      <div class="p-4 max-w-3xl mx-auto">
        <h2 class="text-xl font-bold mb-4">Conteúdo IPFS Carregado</h2>
        <p class="mb-3">Este é o conteúdo carregado do endereço IPFS: ${url}</p>
        <p class="text-sm text-gray-600">Nota: Este é um exemplo de renderização. Em uma implementação real, o conteúdo seria carregado via gateway IPFS.</p>
      </div>
    `;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <div className="text-sm text-muted-foreground animate-pulse">
          Carregando conteúdo...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h3 className="font-medium mb-2">Erro ao carregar conteúdo</h3>
          <p>{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!ipfsHash) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Internet 3.0</h2>
        <p className="text-muted-foreground mb-4">
          Digite um endereço IPFS ou URL para começar a navegar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
          {["IPFS", "YouTube", "Imagens", "PDFs", "Sites"].map((type) => (
            <div
              key={type}
              className="bg-card p-4 rounded-lg border hover:border-primary cursor-pointer transition-all"
            >
              <h3 className="font-medium mb-1">{type}</h3>
              <p className="text-sm text-muted-foreground">
                Visualize conteúdo {type}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isDirectHttpUrl && httpUrl) {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(httpUrl)}`;
    return (
      <div className="h-full relative">
        <div className="absolute top-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 flex items-center z-10">
          <span className="text-sm truncate flex-1">{httpUrl}</span>
          <button
            onClick={() => window.open(httpUrl, "_blank")}
            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 ml-2"
          >
            Abrir original
          </button>
        </div>
        <iframe
          src={proxyUrl}
          title={`Web Content: ${httpUrl}`}
          className="w-full h-full border-none pt-10"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="w-full mx-auto">
        <div dangerouslySetInnerHTML={{ __html: content }} className="w-full" />
      </div>
    </div>
  );
}
