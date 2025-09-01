#!/bin/bash

# Research CLI - Gemini to Research Branding Replacement Script
# This script automatically replaces Gemini branding with Research branding in all relevant files

set -e

echo "Starting Gemini to Research branding replacement..."

# Function to replace Gemini branding with Research branding
replace_branding() {
    local file="$1"
    
    # Skip binary files and certain directories
    if [[ "$file" == *.png ]] || [[ "$file" == *.jpg ]] || [[ "$file" == *.gif ]] || \
       [[ "$file" == *.ico ]] || [[ "$file" == *.icns ]] || [[ "$file" == *.woff* ]] || \
       [[ "$file" == *.ttf ]] || [[ "$file" == *.eot ]] || [[ "$file" == *.svg ]]; then
        return
    fi
    
    # Create backup
    cp "$file" "$file.backup" 2>/dev/null || true
    
    # Replace various forms of "gemini" with "research"
    # Note: Using sed with different patterns to handle case sensitivity properly
    
    # Replace package names and URLs
    sed -i '' \
        -e 's/@google\/gemini-cli/@iechor\/research-cli/g' \
        -e 's/google-gemini\/gemini-cli/iechor-research\/research-cli/g' \
        -e 's/gemini-cli/research-cli/g' \
        -e 's/gemini\.google\.com/research\.iechor\.com/g' \
        -e 's/aistudio\.google\.com/research\.iechor\.com/g' \
        "$file"
    
    # Replace branding text (case-sensitive)
    sed -i '' \
        -e 's/Gemini CLI/Research CLI/g' \
        -e 's/Gemini Code Assist/Research Code Assist/g' \
        -e 's/Gemini 2\.5 Pro/Research 2.5 Pro/g' \
        -e 's/Gemini 2\.5 Flash/Research 2.5 Flash/g' \
        -e 's/Gemini API/Research API/g' \
        -e 's/Gemini models/Research models/g' \
        -e 's/Gemini Studio/Research Studio/g' \
        "$file"
    
    # Replace environment variables
    sed -i '' \
        -e 's/GEMINI_API_KEY/RESEARCH_API_KEY/g' \
        -e 's/GOOGLE_GENAI_USE_VERTEXAI/RESEARCH_USE_VERTEXAI/g' \
        -e 's/GOOGLE_CLOUD_PROJECT/RESEARCH_CLOUD_PROJECT/g' \
        "$file"
    
    # Replace configuration keys
    sed -i '' \
        -e 's/"gemini"/"research"/g' \
        -e 's/"Gemini"/"Research"/g' \
        -e 's/"GEMINI"/"RESEARCH"/g' \
        "$file"
    
    # Replace file paths and directories
    sed -i '' \
        -e 's/\.gemini/\.research/g' \
        -e 's/gemini\.md/research\.md/g' \
        -e 's/GEMINI\.md/RESEARCH\.md/g' \
        "$file"
    
    # Replace command names
    sed -i '' \
        -e 's/command gemini/command research/g' \
        -e 's/alias gemini/alias research/g' \
        -e 's/gemini /research /g' \
        "$file"
    
    # Replace documentation references
    sed -i '' \
        -e 's/gemini-cli\.github\.io/research-cli\.iechor\.com/g' \
        -e 's/google-gemini\.github\.io/iechor-research\.github\.io/g' \
        "$file"
}

# Function to process all relevant files
process_files() {
    echo "Scanning for files containing Gemini references..."
    
    # Find all files that might contain Gemini references
    find . -type f \( \
        -name "*.ts" -o \
        -name "*.tsx" -o \
        -name "*.js" -o \
        -name "*.jsx" -o \
        -name "*.json" -o \
        -name "*.md" -o \
        -name "*.txt" -o \
        -name "*.yml" -o \
        -name "*.yaml" -o \
        -name "*.sh" -o \
        -name "*.bat" -o \
        -name "*.cmd" -o \
        -name "*.ps1" \
    \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" \
    -not -path "./target/*" \
    -not -path "./.next/*" \
    -not -path "./.nuxt/*" \
    -not -path "./.cache/*" \
    -not -path "./coverage/*" \
    -exec grep -l -i "gemini" {} \; | while read file; do
        echo "Processing: $file"
        replace_branding "$file"
    done
}

# Function to handle special cases
handle_special_cases() {
    echo "Handling special cases..."
    
    # Update package.json files specifically
    find . -name "package.json" -not -path "./node_modules/*" | while read file; do
        echo "Updating package.json: $file"
        
        # Update package name
        sed -i '' 's/"name": "@google\/gemini-cli"/"name": "@iechor\/research-cli"/g' "$file"
        sed -i '' 's/"name": "gemini-cli"/"name": "research-cli"/g' "$file"
        
        # Update repository URLs
        sed -i '' 's|"url": "git+https://github.com/google-gemini/gemini-cli.git"|"url": "git+https://github.com/iechor-research/research-cli.git"|g' "$file"
        
        # Update description
        sed -i '' 's/"description": ".*Gemini.*"/"description": "AI-powered research and development CLI tool for developers"/g' "$file"
        
        # Update author
        sed -i '' 's/"author": ".*Google.*"/"author": "IECHOR Research <research@iechor.com>"/g' "$file"
    done
    
    # Update README files
    find . -name "README.md" -not -path "./node_modules/*" | while read file; do
        echo "Updating README: $file"
        
        # Replace installation instructions
        sed -i '' 's/npm install -g @google\/gemini-cli/npm install -g @iechor\/research-cli/g' "$file"
        sed -i '' 's/npm install -g gemini-cli/npm install -g research-cli/g' "$file"
        
        # Replace usage examples
        sed -i '' 's/gemini /research /g' "$file"
        sed -i '' 's/`gemini`/`research`/g' "$file"
    done
    
    # Update configuration files
    find . -name "*.config.js" -o -name "*.config.ts" -o -name "*.config.json" | while read file; do
        echo "Updating config: $file"
        replace_branding "$file"
    done
}

# Function to create a summary report
create_summary_report() {
    echo "Creating summary report..."
    
    cat > branding-replacement-report.md << EOF
# Branding Replacement Report

Generated on: $(date)

## Summary
This report documents the automatic replacement of Gemini branding with Research branding.

## Files Processed
$(find . -name "*.backup" | wc -l | tr -d ' ') files were processed and backed up.

## Backup Files
Backup files have been created with the .backup extension. Review these files to ensure the replacements are correct.

## Manual Review Required
Please manually review the following files for accuracy:
- package.json files
- README.md files
- Configuration files
- Documentation files

## Next Steps
1. Review all changes
2. Test the application
3. Update any missed references
4. Remove backup files after verification

## Backup Files Location
Backup files are located in the same directories as the original files with .backup extension.
EOF
    
    echo "Summary report created: branding-replacement-report.md"
}

# Main execution
main() {
    echo "=== Research CLI Branding Replacement ==="
    echo "This script will replace Gemini branding with Research branding"
    echo "Backup files will be created with .backup extension"
    echo ""
    
    # Process all files
    process_files
    
    # Handle special cases
    handle_special_cases
    
    # Create summary report
    create_summary_report
    
    echo ""
    echo "=== Branding replacement completed ==="
    echo "Please review the changes and test the application."
    echo "Backup files are available with .backup extension."
    echo "Summary report: branding-replacement-report.md"
}

# Run main function
main "$@"
