
import { ethers } from 'ethers';
import { Web3Storage } from 'web3.storage';

export class Web3Manager {
  private provider: ethers.providers.Web3Provider;
  private storage: Web3Storage;

  constructor(storageToken: string) {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.storage = new Web3Storage({ token: storageToken });
  }

  async connectWallet() {
    try {
      await this.provider.send("eth_requestAccounts", []);
      return this.provider.getSigner();
    } catch (error) {
      console.error("Erro ao conectar carteira:", error);
      throw error;
    }
  }

  async storeContent(files: File[]): Promise<string> {
    try {
      const cid = await this.storage.put(files);
      return cid;
    } catch (error) {
      console.error("Erro ao armazenar conteúdo:", error);
      throw error;
    }
  }
}
