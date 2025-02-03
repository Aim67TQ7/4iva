import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const IframeWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="iframe-container">
    <iframe srcDoc={`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; font-family: system-ui, sans-serif; }
            .iframe-content { height: 100vh; overflow-y: auto; }
          </style>
        </head>
        <body>
          <div class="iframe-content">
            ${children}
          </div>
        </body>
      </html>
    `}>
    </iframe>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <IframeWrapper>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </IframeWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;