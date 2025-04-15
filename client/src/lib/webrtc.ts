// Configuração para RTCPeerConnection
const configuration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

// Criar uma conexão peer-to-peer RTCPeerConnection
export async function createPeerConnection(
  peerId: string,
  onIceCandidate?: (candidate: RTCIceCandidate) => void
): Promise<RTCPeerConnection> {
  const peerConnection = new RTCPeerConnection(configuration);
  
  // Lidar com candidatos ICE
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      onIceCandidate(event.candidate);
    }
  };
  
  // Log de alterações de estado da conexão
  peerConnection.onconnectionstatechange = () => {
    console.log(`Estado da conexão com ${peerId}: ${peerConnection.connectionState}`);
  };
  
  // Log de alterações do estado de sinalização
  peerConnection.onsignalingstatechange = () => {
    console.log(`Estado de sinalização com ${peerId}: ${peerConnection.signalingState}`);
  };
  
  // Log de alterações do estado de ICE
  peerConnection.oniceconnectionstatechange = () => {
    console.log(`Estado da conexão ICE com ${peerId}: ${peerConnection.iceConnectionState}`);
  };
  
  return peerConnection;
}

// Configurar uma conexão WebRTC com canal de dados
export async function setupWebRTC(
  peerId: string
): Promise<{ peerConnection: RTCPeerConnection; dataChannel: RTCDataChannel }> {
  const socket = new WebSocket(`ws://${window.location.host}`);
  
  return new Promise((resolve, reject) => {
    socket.onopen = async () => {
      try {
        // Criar conexão peer
        const peerConnection = await createPeerConnection(peerId, (candidate) => {
          // Enviar candidato ICE por WebSocket
          socket.send(JSON.stringify({
            type: 'ice-candidate',
            sender: 'local',
            target: peerId,
            candidate,
          }));
        });
        
        // Criar canal de dados
        const dataChannel = peerConnection.createDataChannel('internet3Channel', {
          ordered: true,
        });
        
        // Configurar evento de abertura do canal
        dataChannel.onopen = () => {
          console.log(`Canal de dados com ${peerId} está aberto`);
        };
        
        // Configurar evento de fechamento do canal
        dataChannel.onclose = () => {
          console.log(`Canal de dados com ${peerId} foi fechado`);
        };
        
        // Configurar evento de erro do canal
        dataChannel.onerror = (error) => {
          console.error(`Erro no canal de dados com ${peerId}:`, error);
        };
        
        // Criar oferta
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Enviar oferta por WebSocket
        socket.send(JSON.stringify({
          type: 'offer',
          sender: 'local',
          target: peerId,
          offer,
        }));
        
        resolve({ peerConnection, dataChannel });
      } catch (error) {
        reject(error);
      }
    };
    
    socket.onerror = (error) => {
      reject(error);
    };
    
    socket.onclose = () => {
      reject(new Error('Conexão WebSocket fechada'));
    };
  });
}

// Enviar mensagem através de um canal de dados
export async function sendMessage(dataChannel: RTCDataChannel, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (dataChannel.readyState !== 'open') {
      return reject(new Error('Canal de dados não está aberto'));
    }
    
    try {
      const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
      dataChannel.send(serializedData);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Função para criar um receptor de arquivos
export function setupFileReceiver(dataChannel: RTCDataChannel, 
  onFileReceived: (file: Blob, metadata: { name: string, type: string, size: number }) => void) {
  
  let receivedSize = 0;
  let fileSize = 0;
  let fileName = '';
  let fileType = '';
  let fileChunks: Uint8Array[] = [];
  let isReceivingFile = false;
  
  dataChannel.onmessage = (event) => {
    const data = event.data;
    
    if (!isReceivingFile) {
      // Verificar se é o início de uma transferência de arquivo
      try {
        const message = JSON.parse(data);
        if (message.type === 'file-start') {
          isReceivingFile = true;
          fileSize = message.size;
          fileName = message.name;
          fileType = message.fileType;
          fileChunks = [];
          receivedSize = 0;
          console.log(`Iniciando recebimento de arquivo: ${fileName} (${fileSize} bytes)`);
        }
      } catch (e) {
        // Ignorar mensagens que não são JSON
      }
    } else if (data instanceof ArrayBuffer) {
      // Receber chunk do arquivo
      const chunk = new Uint8Array(data);
      fileChunks.push(chunk);
      receivedSize += chunk.byteLength;
      
      // Verificar se o arquivo foi completamente recebido
      if (receivedSize === fileSize) {
        // Combinar todos os chunks em um único array
        const fileData = new Uint8Array(fileSize);
        let offset = 0;
        for (const chunk of fileChunks) {
          fileData.set(chunk, offset);
          offset += chunk.byteLength;
        }
        
        // Criar Blob e notificar
        const fileBlob = new Blob([fileData], { type: fileType });
        onFileReceived(fileBlob, {
          name: fileName,
          type: fileType,
          size: fileSize
        });
        
        // Resetar estado
        isReceivingFile = false;
      }
    } else if (typeof data === 'string') {
      // Verificar se é o fim da transferência
      try {
        const message = JSON.parse(data);
        if (message.type === 'file-end') {
          console.log(`Arquivo ${fileName} recebido completamente`);
          isReceivingFile = false;
        }
      } catch (e) {
        // Ignorar mensagens que não são JSON
      }
    }
  };
}

// Função para enviar um arquivo através de um canal de dados
export async function sendFile(dataChannel: RTCDataChannel, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    if (dataChannel.readyState !== 'open') {
      return reject(new Error('Canal de dados não está aberto'));
    }
    
    const chunkSize = 16384; // 16 KB
    let offset = 0;
    
    // Enviar metadados do arquivo
    dataChannel.send(JSON.stringify({
      type: 'file-start',
      name: file.name,
      size: file.size,
      fileType: file.type
    }));
    
    // Função para ler e enviar chunks do arquivo
    const readAndSendChunk = () => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          dataChannel.send(e.target.result);
          offset += e.target.result.byteLength;
          
          // Verificar progresso
          if (offset < file.size) {
            // Enviar próximo chunk
            readNextChunk();
          } else {
            // Arquivo completo enviado
            dataChannel.send(JSON.stringify({
              type: 'file-end',
              name: file.name
            }));
            
            resolve();
          }
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      // Ler o próximo chunk
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    
    const readNextChunk = () => {
      // Usar setTimeout para evitar congelamento da UI
      setTimeout(readAndSendChunk, 0);
    };
    
    // Iniciar o processo
    readNextChunk();
  });
}
