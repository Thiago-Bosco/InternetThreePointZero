import { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Button } from "./button";
import { Input } from "./input";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#202124] text-white">
      <div className="flex flex-col items-center justify-center w-full px-4 py-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#303134] rounded-full hover:bg-[#3c4043] transition-colors">
            <Search className="h-5 w-5 text-gray-400" />
            <Input 
              type="text"
              placeholder="Pesquisar na Internet 3.0 ou digite um endereço"
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}