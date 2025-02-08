import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { resourceTiers, type ResourceTier } from "@shared/schema";
import { Cpu, CircuitBoard, HardDrive, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResourceSelectorProps {
  selectedTier: ResourceTier | "";
  onSelect: (tier: ResourceTier) => void;
}

export default function ResourceSelector({ selectedTier, onSelect }: ResourceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Select Resource Configuration</h2>
        <p className="text-muted-foreground">
          Choose a resource tier that matches your application's requirements
        </p>
      </div>

      <RadioGroup value={selectedTier} onValueChange={(value) => onSelect(value as ResourceTier)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(Object.entries(resourceTiers) as [ResourceTier, typeof resourceTiers[ResourceTier]][]).map(
            ([tier, config]) => (
              <Card key={tier} className="relative p-6 transition-colors hover:bg-accent">
                <RadioGroupItem
                  value={tier}
                  id={tier}
                  className="absolute right-4 top-4"
                />
                <Label
                  htmlFor={tier}
                  className="flex flex-col space-y-4 cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{config.name}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${config.price.monthly}
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${config.price.annual}/year
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{config.specs.cpu}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CircuitBoard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{config.specs.ram}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{config.specs.storage}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Network className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{config.specs.bandwidth}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="space-y-2">
                      {config.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Label>
              </Card>
            )
          )}
        </div>
      </RadioGroup>
    </div>
  );
}