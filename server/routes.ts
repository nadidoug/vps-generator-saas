import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scriptConfigValidationSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import multer from "multer";
import { mkdir } from "fs/promises";
import { join } from "path";
import { MediaProcessor } from "./services/media-processor";
import express from "express";
import { createDefaultDocuments } from "./services/default-documents";
import { EmailService } from "./services/email-service"; // Import EmailService


const UPLOAD_DIR = "/tmp/uploads";

// Ensure upload directory exists
mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export function registerRoutes(app: Express): Server {
  // Set up authentication
  setupAuth(app);

  // Initialize business documents
  app.post("/api/business/initialize", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      await createDefaultDocuments(req.user!.id);
      res.status(201).json({ message: "Business documents initialized successfully" });
    } catch (error) {
      console.error("Failed to initialize business documents:", error);
      res.status(500).json({ error: "Failed to initialize business documents" });
    }
  });

  // VPS Resource Management Routes
  app.post("/api/vps/resources", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const resource = await storage.createVpsResource({
        ...req.body,
        userId: req.user!.id,
      });
      res.status(201).json(resource);
    } catch (error) {
      console.error("Failed to create VPS resource:", error);
      res.status(500).json({ error: "Failed to create VPS resource" });
    }
  });

  app.get("/api/vps/resources", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const resource = await storage.getVpsResource(req.user!.id);
      if (!resource) {
        return res.status(404).json({ error: "VPS resource not found" });
      }
      res.json(resource);
    } catch (error) {
      console.error("Failed to get VPS resource:", error);
      res.status(500).json({ error: "Failed to get VPS resource" });
    }
  });

  app.patch("/api/vps/resources/usage", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const updated = await storage.updateVpsResourceUsage(req.user!.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Failed to update VPS resource usage:", error);
      res.status(500).json({ error: "Failed to update VPS resource usage" });
    }
  });

  // Business Documentation Routes
  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const document = await storage.createBusinessDocument({
        ...req.body,
        createdBy: req.user!.id,
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Failed to create document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { category, type } = req.query;
      const documents = await storage.getBusinessDocuments(
        category as string,
        type as string
      );
      res.json(documents);
    } catch (error) {
      console.error("Failed to get documents:", error);
      res.status(500).json({ error: "Failed to get documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const document = await storage.getBusinessDocument(parseInt(req.params.id));
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Failed to get document:", error);
      res.status(500).json({ error: "Failed to get document" });
    }
  });

  app.post("/api/documents/:id/revisions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const revision = await storage.createDocumentRevision({
        ...req.body,
        documentId: parseInt(req.params.id),
        changedBy: req.user!.id,
      });
      res.status(201).json(revision);
    } catch (error) {
      console.error("Failed to create revision:", error);
      res.status(500).json({ error: "Failed to create revision" });
    }
  });

  app.get("/api/documents/:id/revisions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const revisions = await storage.getDocumentRevisions(parseInt(req.params.id));
      res.json(revisions);
    } catch (error) {
      console.error("Failed to get revisions:", error);
      res.status(500).json({ error: "Failed to get revisions" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(UPLOAD_DIR));

  // Content management routes
  app.post("/api/content/upload", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const contentItem = await MediaProcessor.createContentItem(
        req.user!.id,
        req.file,
        req.body.title || req.file.originalname,
        req.body.description
      );

      res.status(201).json(contentItem);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process upload" });
    }
  });

  app.get("/api/content", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const items = await storage.getContentItems(req.user!.id);
    res.json(items);
  });

  // Existing routes
  app.get("/api/components", async (_req, res) => {
    const components = await storage.getComponents();
    res.json(components);
  });

  app.get("/api/components/:category", async (req, res) => {
    const components = await storage.getComponentsByCategory(req.params.category);
    res.json(components);
  });

  app.post("/api/generate", async (req, res) => {
    // Require authentication
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const validation = scriptConfigValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { os, selectedComponents, infrastructureProvider } = validation.data;
    const components = await storage.getComponents();

    // Filter selected components and check dependencies
    const selectedComponentDetails = components.filter(c =>
      selectedComponents.includes(c.name)
    );

    // Generate terraform config if infrastructure provider is selected
    const infrastructureComponent = selectedComponentDetails.find(
      c => c.category === "infrastructure" && c.infrastructureProvider === infrastructureProvider
    );

    // Generate the deployment script
    const scriptContent = `#!/bin/bash
# VPS Deployment Script for ${os.charAt(0).toUpperCase() + os.slice(1)}
# This script installs selected components and configures the system.

# Enable error handling
set -e
set -o pipefail

# Global variables
LOG_FILE="/var/log/vps_setup.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if script is run as root
check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        log_message "Error: This script must be run as root"
        exit 1
    fi
}

# Function to check system prerequisites
check_prerequisites() {
    log_message "Checking system prerequisites..."
    if ! command -v curl &> /dev/null; then
        log_message "Installing curl..."
        $PKG_INSTALL curl
    fi
}

# Function to update system packages
update_system() {
    log_message "Updating system packages..."
    $PKG_UPDATE
}

${infrastructureComponent ? '# Infrastructure Setup\n' : ''}${
  infrastructureComponent
    ? `# Save this as main.tf:
${infrastructureComponent.terraformConfig}

# Function to setup infrastructure
setup_infrastructure() {
    log_message "Setting up infrastructure on ${infrastructureProvider}..."
    # Terraform commands will be run manually
    log_message "Please run terraform init && terraform apply with the above configuration"
}

# Function to destroy infrastructure
destroy_infrastructure() {
    log_message "Destroying infrastructure on ${infrastructureProvider}..."
    # Terraform destroy command will be run manually
    log_message "Please run terraform destroy with the above configuration"
}
` : ''
}

# Setup package manager
setup_package_manager() {
    log_message "Setting up package manager for ${os}..."
    case "${os}" in
        ubuntu|debian)
            PKG_MANAGER="apt-get"
            PKG_UPDATE="$PKG_MANAGER update -y"
            PKG_INSTALL="$PKG_MANAGER install -y"
            PKG_REMOVE="$PKG_MANAGER purge -y"
            ;;
        centos|fedora|rocky)
            PKG_MANAGER="yum"
            PKG_UPDATE="$PKG_MANAGER update -y"
            PKG_INSTALL="$PKG_MANAGER install -y"
            PKG_REMOVE="$PKG_MANAGER remove -y"
            ;;
        *)
            log_message "Error: Unsupported operating system"
            exit 1
            ;;
    esac
}

# Component installation functions
${selectedComponentDetails
  .filter(c => c.category !== "infrastructure")
  .map(c => `
# Function to install ${c.name}
install_${c.name.toLowerCase().replace(/\s+/g, '_')}() {
    log_message "Installing ${c.name}..."
    ${c.scriptTemplate}
    log_message "${c.name} installation completed"
}

# Function to uninstall ${c.name}
uninstall_${c.name.toLowerCase().replace(/\s+/g, '_')}() {
    log_message "Uninstalling ${c.name}..."
    case "${os}" in
        ubuntu|debian)
            systemctl stop ${c.name.toLowerCase()} 2>/dev/null || true
            $PKG_REMOVE ${c.name.toLowerCase()} ${c.name.toLowerCase()}-* 2>/dev/null || true
            ;;
        centos|fedora|rocky)
            systemctl stop ${c.name.toLowerCase()} 2>/dev/null || true
            $PKG_REMOVE ${c.name.toLowerCase()} ${c.name.toLowerCase()}-* 2>/dev/null || true
            ;;
    esac
    log_message "${c.name} uninstallation completed"
}
`).join('\n')}

# Function to clean the system
clean_system() {
    log_message "Cleaning system..."
    $PKG_MANAGER autoremove -y 2>/dev/null || true
    $PKG_MANAGER clean all 2>/dev/null || true
    rm -rf /var/lib/apt/lists/* 2>/dev/null || true
    rm -rf /var/cache/${PKG_MANAGER}/* 2>/dev/null || true
    log_message "System cleanup completed"
}

# Main script execution
main() {
    log_message "Starting VPS deployment script..."

    # Initial setup
    check_root
    setup_package_manager
    check_prerequisites
    update_system

    # Install components
    ${selectedComponentDetails
      .filter(c => c.category !== "infrastructure")
      .map(c => `install_${c.name.toLowerCase().replace(/\s+/g, '_')}`).join('\n    ')}

    ${infrastructureComponent ? '    setup_infrastructure' : ''}

    log_message "VPS deployment completed successfully"
}

# Uninstall function - removes all installed components
uninstall() {
    log_message "Starting uninstallation process..."
    check_root
    setup_package_manager

    # Uninstall components in reverse order
    ${selectedComponentDetails
      .filter(c => c.category !== "infrastructure")
      .reverse()
      .map(c => `uninstall_${c.name.toLowerCase().replace(/\s+/g, '_')}`).join('\n    ')}

    ${infrastructureComponent ? '    destroy_infrastructure' : ''}

    # Clean up the system
    clean_system
    log_message "Uninstallation completed successfully"
}

# Execute main function if no arguments, otherwise check for uninstall
if [ "$1" = "--uninstall" ]; then
    uninstall
else
    main "$@"
fi
`;

    const config = await storage.saveScriptConfig({
      os,
      selectedComponents,
      generatedScript: scriptContent,
      infrastructureProvider: infrastructureProvider ?? null,
      terraformConfig: infrastructureComponent?.terraformConfig ?? null,
    });

    res.json(config);
  });

  // Beta Testing Routes
  app.post("/api/beta/signup", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const user = await storage.enableBetaAccess(req.user!.id);

      // Send welcome email
      await EmailService.sendEmail(user, 'welcome');

      // Schedule beta access email for the next day
      setTimeout(async () => {
        await EmailService.sendEmail(user, 'betaAccess');
      }, 24 * 60 * 60 * 1000);

      // Schedule feedback request for one week
      setTimeout(async () => {
        await EmailService.sendEmail(user, 'feedback');
      }, 7 * 24 * 60 * 60 * 1000);

      // Schedule beta ending notification for 75 days
      setTimeout(async () => {
        await EmailService.sendEmail(user, 'betaEnding');
      }, 75 * 24 * 60 * 60 * 1000);

      res.json(user);
    } catch (error) {
      console.error("Failed to enable beta access:", error);
      res.status(500).json({ error: "Failed to enable beta access" });
    }
  });

  // Add after the beta signup endpoint
  app.post("/api/marketing/track-event", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const engagement = await storage.trackEngagement({
        userId: req.user!.id,
        eventType: req.body.eventType,
        eventData: req.body.eventData,
      });
      res.status(201).json(engagement);
    } catch (error) {
      console.error("Failed to track event:", error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  // Modify the existing track-signup endpoint
  app.post("/api/beta/track-signup", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { utm_source, utm_medium, utm_campaign } = req.body;

      // Create marketing metrics entry
      await storage.createMarketingMetrics({
        userId: req.user!.id,
        acquisitionChannel: utm_source || "direct",
        conversionStage: "waitlist",
        utmSource: utm_source,
        utmMedium: utm_medium,
        utmCampaign: utm_campaign,
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Failed to track signup:", error);
      res.status(500).json({ error: "Failed to track signup" });
    }
  });

  // Add marketing metrics endpoint
  app.get("/api/marketing/metrics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const metrics = await storage.getMarketingMetrics(req.user!.id);
      const engagement = await storage.getEngagementMetrics(req.user!.id);
      res.json({ metrics, engagement });
    } catch (error) {
      console.error("Failed to get metrics:", error);
      res.status(500).json({ error: "Failed to get metrics" });
    }
  });

  app.post("/api/beta/feedback", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const feedback = await storage.createBetaFeedback({
        ...req.body,
        userId: req.user!.id,
      });
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/beta/feedback", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const feedback = await storage.getBetaFeedback(req.user!.id);
      res.json(feedback);
    } catch (error) {
      console.error("Failed to get feedback:", error);
      res.status(500).json({ error: "Failed to get feedback" });
    }
  });

  app.post("/api/beta/feedback/:id/respond", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const response = await storage.createBetaFeedbackResponse({
        feedbackId: parseInt(req.params.id),
        responderId: req.user!.id,
        content: req.body.content,
      });
      res.status(201).json(response);
    } catch (error) {
      console.error("Failed to respond to feedback:", error);
      res.status(500).json({ error: "Failed to respond to feedback" });
    }
  });

  app.patch("/api/beta/feedback/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const feedback = await storage.updateBetaFeedbackStatus(
        parseInt(req.params.id),
        req.body.status
      );
      res.json(feedback);
    } catch (error) {
      console.error("Failed to update feedback status:", error);
      res.status(500).json({ error: "Failed to update feedback status" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}