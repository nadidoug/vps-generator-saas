import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { SiGithub } from "react-icons/si";
import { ArrowRight, Code, CloudCog, ShieldCheck, Zap } from "lucide-react";

export default function BetaSignup() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Track UTM parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
    };

    if (user && (utmParams.utm_source || utmParams.utm_medium || utmParams.utm_campaign)) {
      apiRequest("POST", "/api/beta/track-signup", utmParams);
    }
  }, [user]);

  const betaSignupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/beta/signup");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the Beta Program!",
        description: "Check your email for next steps.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join beta program",
        variant: "destructive",
      });
    },
  });

  const handleSignup = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    betaSignupMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container px-4 py-16 mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
          VPS Deployment Script Generator
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-8">
          Generate production-ready deployment scripts for your VPS infrastructure.
          Open source, secure, and infinitely customizable.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={handleSignup}>
            Join Beta Program
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <a href="https://github.com/yourusername/vps-deployment-generator" target="_blank" rel="noopener">
            <Button variant="outline" size="lg">
              <SiGithub className="mr-2 h-4 w-4" />
              Star on GitHub
            </Button>
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container px-4 py-16 mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <Code className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Open Source</h3>
              <p className="text-muted-foreground">
                Full access to source code. Customize and extend functionality to match your needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CloudCog className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Infrastructure as Code</h3>
              <p className="text-muted-foreground">
                Generate Terraform configurations for major cloud providers automatically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <ShieldCheck className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Security First</h3>
              <p className="text-muted-foreground">
                Best-practice security configurations and automated hardening included.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Zap className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Deploy your infrastructure in minutes, not hours. No manual configuration needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Beta Benefits */}
      <div className="container px-4 py-16 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Join the Beta Program</h2>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">90 Days Free Access</h3>
                <p className="text-muted-foreground">Get full access to all features during the beta period</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Shape the Product</h3>
                <p className="text-muted-foreground">Direct influence on feature development and roadmap</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Early Adopter Pricing</h3>
                <p className="text-muted-foreground">Lock in special pricing after the beta period ends</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">4</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Priority Support</h3>
                <p className="text-muted-foreground">Direct access to our development team</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              onClick={handleSignup}
              disabled={betaSignupMutation.isPending}
              className="w-full md:w-auto"
            >
              {betaSignupMutation.isPending ? "Joining Beta..." : "Join the Beta Program"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}