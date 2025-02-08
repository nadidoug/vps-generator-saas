import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import OSSelector from "@/components/script-generator/os-selector";
import ComponentSelector from "@/components/script-generator/component-selector";
import ResourceSelector from "@/components/script-generator/resource-selector";
import Preview from "@/components/script-generator/preview";
import { type Component, type ResourceTier } from "@shared/schema";

export default function Home() {
  const [selectedOS, setSelectedOS] = useState<string>("");
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [selectedResourceTier, setSelectedResourceTier] = useState<ResourceTier | "">("");
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [instanceCreated, setInstanceCreated] = useState(false);

  // Calculate progress percentage
  const getProgress = () => {
    let progress = 0;
    if (selectedOS) progress += 20;
    if (selectedComponents.length > 0) progress += 20;
    if (selectedResourceTier) progress += 20;
    if (scriptGenerated) progress += 20;
    if (instanceCreated) progress += 20;
    return progress;
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            VPS Deployment Script Generator
          </h1>
          <p className="text-muted-foreground">
            Configure your Virtual Private Server in four simple steps
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Progress value={getProgress()} className="flex-1" />
          <span className="text-sm text-muted-foreground min-w-[4rem]">
            {getProgress()}% done
          </span>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="os" className="space-y-6">
              <TabsList className="w-full grid grid-cols-2 gap-2 sm:grid-cols-4">
                <TabsTrigger value="os">1. OS</TabsTrigger>
                <TabsTrigger value="components">2. Components</TabsTrigger>
                <TabsTrigger value="resources">3. Resources</TabsTrigger>
                <TabsTrigger value="preview">4. Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="os" className="mt-4">
                <OSSelector 
                  selectedOS={selectedOS}
                  onSelect={setSelectedOS}
                />
              </TabsContent>

              <TabsContent value="components" className="mt-4">
                <ComponentSelector
                  selectedOS={selectedOS}
                  selectedComponents={selectedComponents}
                  onComponentsChange={setSelectedComponents}
                />
              </TabsContent>

              <TabsContent value="resources" className="mt-4">
                <ResourceSelector
                  selectedTier={selectedResourceTier}
                  onSelect={setSelectedResourceTier}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Preview
                  selectedOS={selectedOS}
                  selectedComponents={selectedComponents}
                  selectedResourceTier={selectedResourceTier}
                  onScriptGenerated={() => setScriptGenerated(true)}
                  onInstanceCreated={() => setInstanceCreated(true)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}