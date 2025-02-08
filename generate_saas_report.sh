#!/bin/bash

# Exit on error
set -e

echo "Generating SaaS Report..."

# Create report directory
mkdir -p saas_report

# Initialize report file
REPORT_FILE="saas_report/report.txt"
echo "VPS Deployment Script Generator SaaS Report" > $REPORT_FILE
echo "Generated on $(date)" >> $REPORT_FILE
echo "----------------------------------------" >> $REPORT_FILE

# Count lines of code
echo -e "\nCode Statistics:" >> $REPORT_FILE
echo "----------------" >> $REPORT_FILE
{
    echo "TypeScript/JavaScript files:"
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "./node_modules/*" | xargs wc -l 2>/dev/null || echo "No TypeScript/JavaScript files found"
    
    echo -e "\nCSS files:"
    find . -type f -name "*.css" -not -path "./node_modules/*" | xargs wc -l 2>/dev/null || echo "No CSS files found"
    
    echo -e "\nHTML files:"
    find . -type f -name "*.html" -not -path "./node_modules/*" | xargs wc -l 2>/dev/null || echo "No HTML files found"
} >> $REPORT_FILE

# Get dependencies
echo -e "\nDependencies:" >> $REPORT_FILE
echo "-------------" >> $REPORT_FILE
{
    echo "Node.js Dependencies:"
    npm list --depth=0 2>/dev/null || echo "No Node.js dependencies found"
} >> $REPORT_FILE

# Check for .replit configuration
echo -e "\nReplit Configuration:" >> $REPORT_FILE
echo "--------------------" >> $REPORT_FILE
if [ -f ".replit" ]; then
    cat .replit >> $REPORT_FILE
else
    echo "No .replit configuration file found" >> $REPORT_FILE
fi

# Get running services
echo -e "\nRunning Services:" >> $REPORT_FILE
echo "----------------" >> $REPORT_FILE
{
    ps aux | grep -E 'node|npm' | grep -v grep || echo "No Node.js processes running"
} >> $REPORT_FILE

# Get Git information
echo -e "\nGit Information:" >> $REPORT_FILE
echo "---------------" >> $REPORT_FILE
if [ -d ".git" ]; then
    echo "Total commits: $(git rev-list --count HEAD 2>/dev/null || echo 'Unable to count commits')" >> $REPORT_FILE
    echo -e "\nRecent commits:" >> $REPORT_FILE
    git log --oneline -n 5 2>/dev/null >> $REPORT_FILE || echo "Unable to retrieve git history" >> $REPORT_FILE
else
    echo "Not a git repository" >> $REPORT_FILE
fi

# Get project structure
echo -e "\nProject Structure:" >> $REPORT_FILE
echo "-----------------" >> $REPORT_FILE
{
    echo "Directory tree (up to 2 levels):"
    tree -L 2 -I 'node_modules|dist|build|.git' 2>/dev/null || ls -R | head -n 50
} >> $REPORT_FILE

echo "SaaS Report generated successfully at $REPORT_FILE"
