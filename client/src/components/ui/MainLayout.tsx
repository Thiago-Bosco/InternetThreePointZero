import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { 
  Search,
  Settings,
  User,
  Grid,
  Bell
} from 'lucide-react';
import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const TopBar = () => (
    <div className="flex items-center justify-between w-full px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl font-medium">Internet 3.0</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Grid className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  const SearchBar = () => (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-4 -mt-20">
      <h1 className="text-4xl font-bold">Internet 3.0</h1>
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 px-6 py-3 bg-background border rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar na Internet 3.0 ou digite um endereço"
            className="flex-1 bg-transparent border-none focus:outline-none text-base"
          />
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <main className="flex-1 flex flex-col">
        <SearchBar />
        <div className="flex-1 px-4 mt-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}