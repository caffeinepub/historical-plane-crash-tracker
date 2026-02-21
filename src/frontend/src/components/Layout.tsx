import { Link } from '@tanstack/react-router';
import { Plane, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children }: { children: React.ReactNode }) {
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'aviation-crash-archive';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  Aviation Crash Archive
                </h1>
                <p className="text-xs text-muted-foreground">Historical Flight Safety Database</p>
              </div>
            </Link>
            <nav className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link to="/add-crash">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Record
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-xs">
                Historical aviation safety data for research and education purposes.
              </p>
              <p className="text-xs">
                Data compiled from NTSB, ASN, ICAO, and other official sources.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span>Built with ❤️ using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aviation Crash Archive. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
