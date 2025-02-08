import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type Component } from "@shared/schema";

interface ComponentSelectorProps {
  selectedOS: string;
  selectedComponents: Component[];
  onComponentsChange: (components: Component[]) => void;
}

export default function ComponentSelector({
  selectedOS,
  selectedComponents,
  onComponentsChange,
}: ComponentSelectorProps) {
  const { data: components, isLoading } = useQuery({
    queryKey: ["/api/components"],
    enabled: !!selectedOS,
  });

  if (!selectedOS) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select an operating system first
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <div>Loading components...</div>;
  }

  const handleToggle = (component: Component) => {
    if (selectedComponents.find(c => c.id === component.id)) {
      onComponentsChange(selectedComponents.filter(c => c.id !== component.id));
    } else {
      onComponentsChange([...selectedComponents, component]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Select Components</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {components?.map((component) => (
          <Card key={component.id} className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={`component-${component.id}`}
                checked={selectedComponents.some(c => c.id === component.id)}
                onCheckedChange={() => handleToggle(component)}
              />
              <div className="space-y-1">
                <Label
                  htmlFor={`component-${component.id}`}
                  className="text-lg font-medium"
                >
                  {component.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {component.description}
                </p>
                {component.dependencies.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Requires: {component.dependencies.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
