#!/bin/bash

# Exit on error
set -e

# Create directories if they don't exist
mkdir -p ../vps-generator-public
mkdir -p ../vps-generator-private

# Public repository - only open source components
echo "Organizing public repository..."
mkdir -p ../vps-generator-public/client/src/components
mkdir -p ../vps-generator-public/client/src/templates
mkdir -p ../vps-generator-public/server
mkdir -p ../vps-generator-public/docs

# Copy only the public components
cp -r client/src/components/ui ../vps-generator-public/client/src/components/ 2>/dev/null || true
cp -r client/src/templates ../vps-generator-public/client/src/templates/ 2>/dev/null || true

# Create simplified public server files
cat > ../vps-generator-public/server/routes.ts << EOL
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scriptConfigValidationSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Component routes
  app.get("/api/components", async (_req, res) => {
    const components = await storage.getComponents();
    res.json(components);
  });

  app.get("/api/components/:category", async (req, res) => {
    const components = await storage.getComponentsByCategory(req.params.category);
    res.json(components);
  });

  app.post("/api/generate", async (req, res) => {
    const validation = scriptConfigValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const config = await storage.saveScriptConfig(req.body);
    res.json(config);
  });

  const httpServer = createServer(app);
  return httpServer;
}
EOL

cat > ../vps-generator-public/server/storage.ts << EOL
import { Component, InsertComponent, ScriptConfig, InsertScriptConfig } from "@shared/schema";

export interface IStorage {
  getComponents(): Promise<Component[]>;
  getComponentsByCategory(category: string): Promise<Component[]>;
  createComponent(component: InsertComponent): Promise<Component>;
  saveScriptConfig(config: InsertScriptConfig): Promise<ScriptConfig>;
  getScriptConfig(id: number): Promise<ScriptConfig | undefined>;
}

export class MemoryStorage implements IStorage {
  private components: Map<number, Component>;
  private scriptConfigs: Map<number, ScriptConfig>;
  private currentComponentId: number;
  private currentConfigId: number;

  constructor() {
    this.components = new Map();
    this.scriptConfigs = new Map();
    this.currentComponentId = 1;
    this.currentConfigId = 1;
    this.initializeDefaultComponents();
  }

  private initializeDefaultComponents() {
    const defaultComponents: InsertComponent[] = [
      {
        name: "Apache",
        description: "Apache web server with PHP support",
        scriptTemplate: "sudo \$PKG_MANAGER install -y apache2 php",
        category: "web",
        isRequired: false,
        dependencies: [],
        infrastructureProvider: null,
        terraformConfig: null,
      },
      // Add other default components
    ];

    defaultComponents.forEach((component) => {
      this.createComponent(component);
    });
  }

  async getComponents(): Promise<Component[]> {
    return Array.from(this.components.values());
  }

  async getComponentsByCategory(category: string): Promise<Component[]> {
    return Array.from(this.components.values()).filter(
      (component) => component.category === category
    );
  }

  async createComponent(component: InsertComponent): Promise<Component> {
    const id = this.currentComponentId++;
    const newComponent = {
      ...component,
      id,
      dependencies: component.dependencies ?? [],
      infrastructureProvider: component.infrastructureProvider ?? null,
      terraformConfig: component.terraformConfig ?? null,
    };
    this.components.set(id, newComponent);
    return newComponent;
  }

  async saveScriptConfig(config: InsertScriptConfig): Promise<ScriptConfig> {
    const id = this.currentConfigId++;
    const newConfig = {
      ...config,
      id,
      selectedComponents: config.selectedComponents ?? [],
      infrastructureProvider: config.infrastructureProvider ?? null,
      terraformConfig: config.terraformConfig ?? null,
    };
    this.scriptConfigs.set(id, newConfig);
    return newConfig;
  }

  async getScriptConfig(id: number): Promise<ScriptConfig | undefined> {
    return this.scriptConfigs.get(id);
  }
}

export const storage = new MemoryStorage();
EOL

# Copy build configuration files
cp package.json ../vps-generator-public/ 2>/dev/null || true
cp tsconfig.json ../vps-generator-public/ 2>/dev/null || true
cp vite.config.ts ../vps-generator-public/ 2>/dev/null || true
cp tailwind.config.ts ../vps-generator-public/ 2>/dev/null || true
cp postcss.config.js ../vps-generator-public/ 2>/dev/null || true
cp theme.json ../vps-generator-public/ 2>/dev/null || true

# Create simplified deployment documentation
cat > ../vps-generator-public/docs/deployment.md << EOL
# VPS Deployment Script Documentation

## Overview
This document details the shell script generator for configuring virtual private servers across different Linux distributions.

## Script Features
- Multi-distribution support (Ubuntu, Debian, CentOS, Fedora, Rocky)
- Component-based installation
- Error handling and logging
- Clean uninstallation support

## Usage
1. Select your Linux distribution
2. Choose components to install
3. Generate deployment script
4. Run the script on your VPS

## Components
- Web servers
- Database systems
- Security tools
- Infrastructure providers

## Best Practices
1. Review generated scripts before execution
2. Backup system before running
3. Monitor logs during execution
4. Test in isolated environment first
EOL

# Private repository - business logic and sensitive components
echo "Organizing private repository..."
mkdir -p ../vps-generator-private/server/services
mkdir -p ../vps-generator-private/shared
mkdir -p ../vps-generator-private/docs
mkdir -p ../vps-generator-private/client/src/features

# Copy private components
cp -r server/services/* ../vps-generator-private/server/services/ 2>/dev/null || true
cp server/auth.ts ../vps-generator-private/server/ 2>/dev/null || true
cp server/storage.ts ../vps-generator-private/server/ 2>/dev/null || true
cp server/routes.ts ../vps-generator-private/server/ 2>/dev/null || true
cp shared/schema.ts ../vps-generator-private/shared/ 2>/dev/null || true
cp docs/business_overview.md ../vps-generator-private/docs/ 2>/dev/null || true
cp docs/deployment_script.md ../vps-generator-private/docs/ 2>/dev/null || true

# Create public README
cat > ../vps-generator-public/README.md << EOL
# VPS Deployment Script Generator

Open-source tool for generating VPS deployment scripts.

## Features
- Multi-distribution support (Ubuntu, Debian, CentOS)
- Component-based deployment system
- Infrastructure automation templates
- Customizable configuration

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`

## Usage
1. Select your Linux distribution
2. Choose components to install
3. Generate deployment script
4. Execute on your VPS

## License
MIT License
EOL

# Create private README
cat > ../vps-generator-private/README.md << EOL
# VPS Generator Platform (Private)

Core business logic and infrastructure for the VPS Generator SaaS platform.

## Components
- User authentication and management
- Resource allocation system
- Marketing analytics
- Beta testing framework
- Document management
- Email integration

## Infrastructure
- PostgreSQL database
- OAuth providers
- Email service
- Analytics pipeline

## Development
Refer to docs/business_overview.md for detailed documentation.
EOL

# Create .gitignore for private repository
cat > ../vps-generator-private/.gitignore << EOL
# Dependencies
node_modules/
dist/
.env
.env.*

# IDE
.idea/
.vscode/

# Beta Testing
**/beta/
**/marketing/

# Database
*.sqlite
*.db
pgdata/

# Temporary files
tmp/
temp/

# Logs
*.log
npm-debug.log*
EOL

# Create .gitignore for public repository
cat > ../vps-generator-public/.gitignore << EOL
# Dependencies
node_modules/
dist/
.env
.env.*

# IDE
.idea/
.vscode/

# Temporary files
tmp/
temp/

# Logs
*.log
npm-debug.log*
EOL

echo "Repository separation complete!"