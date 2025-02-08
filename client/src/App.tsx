import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ScriptPreview from "@/pages/script-preview";
import AuthPage from "@/pages/auth";
import BetaSignup from "@/pages/beta-signup";
import { AuthProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/preview/:id" component={ScriptPreview} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/beta-signup" component={BetaSignup} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;