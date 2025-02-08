import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft } from "lucide-react";
import { Link, useRoute } from "wouter";
import { SiUbuntu, SiDebian, SiCentos, SiFedora, SiRockylinux } from "react-icons/si";

// OS icon mapping
const osIcons = {
  ubuntu: SiUbuntu,
  debian: SiDebian,
  centos: SiCentos,
  fedora: SiFedora,
  rocky: SiRockylinux,
};

export default function ScriptPreview() {
  const [, params] = useRoute("/preview/:id");
  const { toast } = useToast();

  const { data: scriptConfig, isLoading } = useQuery({
    queryKey: [`/api/script-configs/${params?.id}`],
    enabled: !!params?.id,
  });

  const handleDownload = () => {
    if (!scriptConfig) return;

    const blob = new Blob([scriptConfig.generatedScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vps-deploy-${scriptConfig.os}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Script downloaded successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <Card>
              <CardContent className="p-6">
                <div className="h-96 bg-muted rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!scriptConfig) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Script Configuration Not Found
          </h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Generator
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const OSIcon = osIcons[scriptConfig.os as keyof typeof osIcons];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>
          </Link>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Script
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center space-x-4 pb-4 border-b">
              {OSIcon && <OSIcon className="w-8 h-8" />}
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {scriptConfig.os} Deployment Script
                </h2>
                <p className="text-sm text-muted-foreground">
                  {scriptConfig.selectedComponents.length} components selected
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Selected Components:</h3>
              <div className="flex flex-wrap gap-2">
                {scriptConfig.selectedComponents.map((component) => (
                  <div
                    key={component}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {component}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Generated Script:</h3>
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                    {scriptConfig.generatedScript}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
