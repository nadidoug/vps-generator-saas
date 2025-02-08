import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { osOptions } from "@shared/schema";
import { SiUbuntu, SiDebian, SiCentos, SiFedora, SiRockylinux } from "react-icons/si";

const osData = {
  ubuntu: {
    icon: SiUbuntu,
    name: "Ubuntu",
    description: "Popular, user-friendly Linux distribution with extensive community support",
  },
  debian: {
    icon: SiDebian,
    name: "Debian",
    description: "Stable and secure Linux distribution, ideal for servers",
  },
  centos: {
    icon: SiCentos,
    name: "CentOS",
    description: "Enterprise-class Linux distribution with long-term support",
  },
  fedora: {
    icon: SiFedora,
    name: "Fedora",
    description: "Leading-edge Linux distribution with latest features",
  },
  rocky: {
    icon: SiRockylinux,
    name: "Rocky Linux",
    description: "Enterprise-ready Linux distribution, CentOS alternative",
  },
};

interface OSSelectorProps {
  selectedOS: string;
  onSelect: (os: string) => void;
}

export default function OSSelector({ selectedOS, onSelect }: OSSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Select Operating System</h2>
        <p className="text-muted-foreground">
          Choose the operating system that best suits your needs
        </p>
      </div>

      <RadioGroup value={selectedOS} onValueChange={onSelect}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {osOptions.map((os) => {
            const osInfo = osData[os as keyof typeof osData];
            const Icon = osInfo.icon;
            return (
              <Card key={os} className="relative p-4 transition-colors hover:bg-accent">
                <RadioGroupItem
                  value={os}
                  id={os}
                  className="absolute right-4 top-4"
                />
                <Label
                  htmlFor={os}
                  className="flex flex-col space-y-3 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-8 h-8" />
                    <span className="text-lg font-medium">{osInfo.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-11">
                    {osInfo.description}
                  </p>
                </Label>
              </Card>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}