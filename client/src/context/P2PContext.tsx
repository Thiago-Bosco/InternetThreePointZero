import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "./UserContext";
import { initializeIPFS, addFileToIPFS, getFromIPFS } from "@/lib/ipfs";
import { createPeerConnection, setupWebRTC, sendMessage } from "@/lib/webrtc";

interface P2PState {
  ipfsNode: any; // IPFS node instance
  isIPFSReady: boolean;
  peerConnections: Record<string, RTCPeerConnection>;
  dataChannels: Record<string, RTCDataChannel>;
  connectedPeers: string[];
  messages: Record<string, Array<{sender: string, content: string, timestamp: Date}>>;
}

interface P2PContextType {
  state: P2PState;
  uploadFile: (file: File) => Promise<string>;
  fetchIPFSContent: (hash: string) => Promise<any>;
  connectToPeer: (peerId: string, publicKey: string) => Promise<void>;
  disconnectFromPeer: (peerId: string) => void;
  sendMessageToPeer: (peerId: string, message: string) => Promise<void>;
}

const P2PContext = createContext<P2PContextType | undefined>(undefined);

export function P2PContextProvider({ children }: { children: ReactNode }) {
  const { currentUser, isAuthenticated } = useUser();
  const [state, setState] = useState<P2PState>({
    ipfsNode: null,
    isIPFSReady: false,
    peerConnections: {},
    dataChannels: {},
    connectedPeers: [],
    messages: {},
  });

  // Inicializar IPFS quando o componente for montado
  useEffect(() => {
    const setupIPFS = async () => {
      try {
        const node = await initializeIPFS();
        
        setState(prev => ({
          ...prev,
          ipfsNode: node,
          isIPFSReady: true,
        }));
        
        console.log("IPFS inicializado com sucesso");
      } catch (error) {
        console.error("Erro ao inicializar IPFS:", error);
      }
    };

    setupIPFS();

    // Limpar recursos ao desmontar
    return () => {
      // Fechar conexões WebRTC
      Object.values(state.peerConnections).forEach(connection => {
        connection.close();
      });
      
      // Desligar nó IPFS
      if (state.ipfsNode) {
        state.ipfsNode.stop().catch((err: any) => {
          console.error("Erro ao desligar IPFS:", err);
        });
      }
    };
  }, []);

  // Configurar WebSocket para sinalização quando o usuário estiver autenticado
  useEffect(() => {
    // Não inicializar WebSocket no primeiro carregamento para resolver problemas de conexão
    // Somente conectar quando o usuário estiver autenticado
    if (!isAuthenticated || !currentUser) return;

    // Verificar primeiro se a API está acessível antes de tentar WebSocket
    const checkApiAndConnect = async () => {
      try {
        // Testar conexão com o servidor primeiro
        const response = await fetch('/api/test', { method: 'HEAD' });
        if (!response.ok) throw new Error(`API respondeu com status ${response.status}`);
        
        console.log("API acessível, tentando conectar WebSocket");
        
        // URL segura para WebSocket baseada no protocolo atual
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const socket = new WebSocket(`${protocol}//${host}`);
        
        // Definir timeout para detectar problemas de conexão
        const connectionTimeout = setTimeout(() => {
          console.error("Timeout na conexão WebSocket");
          socket.close();
        }, 5000);
        
        socket.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log("Conexão WebSocket estabelecida para sinalização");
          
          // Anunciar presença
          if (currentUser) {
            try {
              socket.send(JSON.stringify({
                type: "announce",
                userId: currentUser.id,
                username: currentUser.username,
                publicKey: currentUser.publicKey,
              }));
            } catch (error) {
              console.error("Erro ao enviar anúncio:", error);
            }
          }
        };
        
        socket.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Lidar com diferentes tipos de mensagens de sinalização
            switch (data.type) {
              case "announce":
                console.log(`Usuário anunciado: ${data.username}`);
                break;
              case "offer":
                if (data.target === currentUser?.id) {
                  const pc = await createPeerConnection(data.sender);
                  pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                  const answer = await pc.createAnswer();
                  await pc.setLocalDescription(answer);
                  
                  socket.send(JSON.stringify({
                    type: "answer",
                    target: data.sender,
                    sender: currentUser.id,
                    answer,
                  }));
                  
                  setState(prev => ({
                    ...prev,
                    peerConnections: {
                      ...prev.peerConnections,
                      [data.sender]: pc,
                    },
                  }));
                }
                break;
              case "answer":
                if (data.target === currentUser?.id) {
                  const pc = state.peerConnections[data.sender];
                  if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                  }
                }
                break;
              case "ice-candidate":
                if (data.target === currentUser?.id) {
                  const pc = state.peerConnections[data.sender];
                  if (pc) {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                  }
                }
                break;
            }
          } catch (error) {
            console.error("Erro ao processar mensagem WebSocket:", error);
          }
        };
        
        socket.onclose = (event) => {
          console.log(`Conexão WebSocket fechada: Código ${event.code}, Razão: ${event.reason || 'Nenhuma razão fornecida'}`);
        };
        
        socket.onerror = (error) => {
          console.error("Erro na conexão WebSocket:", error);
        };
        
        // Retornar função de limpeza
        return socket;
      } catch (error) {
        console.error("Falha ao verificar API ou conectar WebSocket:", error);
        return null;
      }
    };
    
    // Iniciar com um pequeno atraso para garantir que o resto da aplicação esteja carregado
    const socketInitTimeout = setTimeout(() => {
      checkApiAndConnect().then(socket => {
        if (socket) {
          // Armazenar referência para limpeza posterior
          websocketRef.current = socket;
        }
      });
    }, 2000);
    
    // Referência para o socket WebSocket
    const websocketRef = { current: null as WebSocket | null };
    
    // Limpar recursos
    return () => {
      clearTimeout(socketInitTimeout);
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [currentUser, isAuthenticated, state.peerConnections]);

  // Função para fazer upload de arquivo para IPFS
  const uploadFile = async (file: File): Promise<string> => {
    if (!state.isIPFSReady) {
      throw new Error("IPFS não está pronto");
    }
    
    try {
      const hash = await addFileToIPFS(state.ipfsNode, file);
      
      // Registrar o arquivo no servidor
      if (currentUser) {
        await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            fileName: file.name,
            fileSize: file.size,
            ipfsHash: hash,
            isPublic: true,
            mimeType: file.type,
          }),
        });
      }
      
      return hash;
    } catch (error) {
      console.error("Erro ao fazer upload de arquivo:", error);
      throw error;
    }
  };

  // Função para buscar conteúdo do IPFS
  const fetchIPFSContent = async (hash: string): Promise<any> => {
    if (!state.isIPFSReady) {
      throw new Error("IPFS não está pronto");
    }
    
    try {
      const content = await getFromIPFS(state.ipfsNode, hash);
      
      // Registrar no histórico de navegação se o usuário estiver autenticado
      if (currentUser) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            ipfsHash: hash,
            title: `IPFS Content: ${hash}`,
          }),
        });
      }
      
      return content;
    } catch (error) {
      console.error("Erro ao buscar conteúdo IPFS:", error);
      throw error;
    }
  };

  // Função para conectar a um peer
  const connectToPeer = async (peerId: string, publicKey: string): Promise<void> => {
    if (!currentUser) {
      throw new Error("Usuário não autenticado");
    }
    
    try {
      // Criar uma conexão WebRTC
      const { peerConnection, dataChannel } = await setupWebRTC(peerId);
      
      // Configurar ouvintes de eventos para o canal de dados
      dataChannel.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        
        setState(prev => {
          const peerMessages = prev.messages[peerId] || [];
          return {
            ...prev,
            messages: {
              ...prev.messages,
              [peerId]: [
                ...peerMessages,
                {
                  sender: peerId,
                  content: messageData.content,
                  timestamp: new Date(messageData.timestamp),
                }
              ]
            }
          };
        });
      };
      
      // Atualizar estado
      setState(prev => ({
        ...prev,
        peerConnections: {
          ...prev.peerConnections,
          [peerId]: peerConnection,
        },
        dataChannels: {
          ...prev.dataChannels,
          [peerId]: dataChannel,
        },
        connectedPeers: [...prev.connectedPeers, peerId],
      }));
      
      // Registrar o contato no servidor se não existir
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          contactUsername: peerId,
          contactPublicKey: publicKey,
          lastConnected: new Date(),
        }),
      });
    } catch (error) {
      console.error("Erro ao conectar ao peer:", error);
      throw error;
    }
  };

  // Função para desconectar de um peer
  const disconnectFromPeer = (peerId: string): void => {
    const connection = state.peerConnections[peerId];
    const channel = state.dataChannels[peerId];
    
    if (channel) {
      channel.close();
    }
    
    if (connection) {
      connection.close();
    }
    
    setState(prev => {
      const { [peerId]: _, ...remainingConnections } = prev.peerConnections;
      const { [peerId]: __, ...remainingChannels } = prev.dataChannels;
      return {
        ...prev,
        peerConnections: remainingConnections,
        dataChannels: remainingChannels,
        connectedPeers: prev.connectedPeers.filter(id => id !== peerId),
      };
    });
  };

  // Função para enviar mensagem para um peer
  const sendMessageToPeer = async (peerId: string, message: string): Promise<void> => {
    const channel = state.dataChannels[peerId];
    
    if (!channel || channel.readyState !== "open") {
      throw new Error("Canal de dados não está aberto");
    }
    
    const messageData = {
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    await sendMessage(channel, messageData);
    
    // Atualizar estado local com a mensagem enviada
    setState(prev => {
      const peerMessages = prev.messages[peerId] || [];
      return {
        ...prev,
        messages: {
          ...prev.messages,
          [peerId]: [
            ...peerMessages,
            {
              sender: currentUser?.username || "me",
              content: message,
              timestamp: new Date(),
            }
          ]
        }
      };
    });
  };

  return (
    <P2PContext.Provider
      value={{
        state,
        uploadFile,
        fetchIPFSContent,
        connectToPeer,
        disconnectFromPeer,
        sendMessageToPeer,
      }}
    >
      {children}
    </P2PContext.Provider>
  );
}

export function useP2P() {
  const context = useContext(P2PContext);
  if (context === undefined) {
    throw new Error("useP2P deve ser usado dentro de um P2PContextProvider");
  }
  return context;
}
