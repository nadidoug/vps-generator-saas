import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiGoogle, SiGithub, SiFacebook, SiApple } from "react-icons/si";

export default function AuthPage() {
  const [, setLocation] = useLocation();

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">Welcome to VPS Deploy</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Sign in to deploy your configured VPS instance
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Choose your preferred method to sign in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin("google")}
              >
                <SiGoogle className="w-5 h-5" />
                Continue with Google
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin("github")}
              >
                <SiGithub className="w-5 h-5" />
                Continue with GitHub
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin("facebook")}
              >
                <SiFacebook className="w-5 h-5" />
                Continue with Facebook
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin("apple")}
              >
                <SiApple className="w-5 h-5" />
                Continue with Apple
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="hidden md:block">
          <Card className="h-full bg-primary/5 border-primary/10">
            <CardContent className="h-full p-6 flex flex-col justify-center space-y-6">
              <h2 className="text-2xl font-semibold">Why sign in?</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="flex-1">Access your VPS configurations and deployment history</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="flex-1">Manage multiple VPS instances from one dashboard</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="flex-1">Get email notifications about your VPS status</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="flex-1">Access premium features and support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
