import * as IPFS from 'ipfs-core';

// Inicializa um nó IPFS no navegador
export async function initializeIPFS() {
  try {
    const node = await IPFS.create({
      repo: 'ipfs-' + Math.random(),
      config: {
        Addresses: {
          Swarm: [
            '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
            '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          ]
        },
        Bootstrap: [
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
        ]
      }
    });
    
    console.log('ID do nó IPFS:', (await node.id()).id);
    return node;
  } catch (error) {
    console.error('Erro ao inicializar IPFS:', error);
    throw error;
  }
}

// Adiciona um arquivo ao IPFS e retorna o hash
export async function addFileToIPFS(ipfsNode: any, file: File): Promise<string> {
  try {
    const fileBuffer = await file.arrayBuffer();
    const result = await ipfsNode.add({
      path: file.name,
      content: new Uint8Array(fileBuffer)
    }, {
      wrapWithDirectory: true,
      progress: (bytes: number) => console.log(`Progresso do upload: ${bytes} bytes`)
    });
    
    return result.cid.toString();
  } catch (error) {
    console.error('Erro ao adicionar arquivo ao IPFS:', error);
    throw error;
  }
}

// Busca conteúdo do IPFS pelo hash
export async function getFromIPFS(ipfsNode: any, ipfsPath: string): Promise<any> {
  try {
    const chunks = [];
    for await (const chunk of ipfsNode.cat(ipfsPath)) {
      chunks.push(chunk);
    }
    
    // Combinar os chunks em um único array
    const allChunks = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    
    let offset = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, offset);
      offset += chunk.length;
    }
    
    return allChunks;
  } catch (error) {
    console.error('Erro ao recuperar do IPFS:', error);
    throw error;
  }
}

// Publica conteúdo no sistema IPNS (nome permanente)
export async function publishToIPNS(ipfsNode: any, ipfsPath: string): Promise<string> {
  try {
    const { id } = await ipfsNode.id();
    const result = await ipfsNode.name.publish(ipfsPath, { key: 'self' });
    
    return id;
  } catch (error) {
    console.error('Erro ao publicar no IPNS:', error);
    throw error;
  }
}

// Resolve um nome IPNS para o hash IPFS atual
export async function resolveIPNS(ipfsNode: any, ipnsId: string): Promise<string> {
  try {
    const result = await ipfsNode.name.resolve(ipnsId);
    return result.path;
  } catch (error) {
    console.error('Erro ao resolver IPNS:', error);
    throw error;
  }
}

// Pino (um recurso similar aos pinos do Pinterest) de conteúdo IPFS para mantê-lo disponível
export async function pinContent(ipfsNode: any, cid: string): Promise<void> {
  try {
    await ipfsNode.pin.add(cid);
    console.log(`Conteúdo com CID ${cid} fixado com sucesso`);
  } catch (error) {
    console.error('Erro ao fixar conteúdo:', error);
    throw error;
  }
}

// Remove o pino de um conteúdo IPFS
export async function unpinContent(ipfsNode: any, cid: string): Promise<void> {
  try {
    await ipfsNode.pin.rm(cid);
    console.log(`Pino removido do conteúdo com CID ${cid}`);
  } catch (error) {
    console.error('Erro ao remover pino:', error);
    throw error;
  }
}
