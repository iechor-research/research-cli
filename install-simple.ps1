# Research CLI Simple PowerShell Installer
# Usage: iwr -useb https://raw.githubusercontent.com/iechor-research/research-cli/main/install-simple.ps1 | iex

param(
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\research-cli",
    [string]$Version = ""
)

# Configuration
$Repo = "iechor-research/research-cli"
$BinaryName = "research-cli"

# Colors
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Cyan"
}

function Write-Info { Write-Host "[INFO] $args" -ForegroundColor $Colors.Blue }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor $Colors.Green }
function Write-Warn { Write-Host "[WARN] $args" -ForegroundColor $Colors.Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor $Colors.Red }

# Banner
Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                     Research CLI Installer                   ║
║                                                              ║
║  AI-powered research and development CLI tool for developers ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

function Get-Platform {
    $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    
    # Check for ARM64
    if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64" -or $env:PROCESSOR_ARCHITEW6432 -eq "ARM64") {
        $arch = "arm64"
    }
    
    return "win32-$arch"
}

function Get-LatestVersion {
    Write-Info "Fetching latest release..."
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
        return $response.tag_name
    }
    catch {
        Write-Error "Failed to get latest version: $_"
        exit 1
    }
}

function Install-ResearchCLI {
    # Detect platform
    $platform = Get-Platform
    Write-Info "Detected platform: $platform"
    
    # Get version
    if ($Version) {
        $releaseVersion = $Version
        Write-Info "Using specified version: $releaseVersion"
    }
    else {
        $releaseVersion = Get-LatestVersion
        Write-Info "Latest version: $releaseVersion"
    }
    
    # Create temp directory
    $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) "research-cli-install-$(Get-Random)"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    try {
        # Download
        $archiveName = "research-cli-standalone-$platform.zip"
        $downloadUrl = "https://github.com/$Repo/releases/download/$releaseVersion/$archiveName"
        $archivePath = Join-Path $tempDir $archiveName
        
        Write-Info "Downloading from: $downloadUrl"
        
        try {
            Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath -UseBasicParsing
            Write-Success "Download completed"
        }
        catch {
            Write-Error "Download failed: $_"
            exit 1
        }
        
        # Extract
        Write-Info "Extracting..."
        
        try {
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $tempDir)
            
            $extractDir = Join-Path $tempDir "dist-package"
            if (-not (Test-Path $extractDir)) {
                throw "Extraction failed: dist-package directory not found"
            }
            
            Write-Success "Extraction completed"
        }
        catch {
            Write-Error "Extraction failed: $_"
            exit 1
        }
        
        # Install
        Write-Info "Installing to $InstallDir..."
        
        # Create install directory
        if (-not (Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }
        
        # Copy files
        $bundleDir = Join-Path $InstallDir "bundle"
        if (Test-Path $bundleDir) {
            Remove-Item $bundleDir -Recurse -Force
        }
        Copy-Item $extractDir $bundleDir -Recurse -Force
        
        # Create wrapper batch file
        $wrapperPath = Join-Path $InstallDir "$BinaryName.bat"
        $wrapperContent = @"
@echo off
"%~dp0bundle\research-cli.bat" %*
"@
        Set-Content -Path $wrapperPath -Value $wrapperContent
        
        Write-Success "Installation completed!"
        
        # Test installation
        Write-Info "Testing installation..."
        
        try {
            $versionOutput = & $wrapperPath --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Research CLI installed successfully!"
                Write-Success "Version: $versionOutput"
                Write-Success "Location: $wrapperPath"
            }
            else {
                Write-Warn "Installation completed but version check failed"
            }
        }
        catch {
            Write-Warn "Installation completed but version check failed: $_"
        }
        
        # Add to PATH
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($currentPath -notlike "*$InstallDir*") {
            Write-Info "Adding to PATH..."
            $newPath = if ($currentPath) { "$currentPath;$InstallDir" } else { $InstallDir }
            [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            $env:Path = "$InstallDir;$env:Path"
            Write-Success "Added to PATH (restart terminal to use)"
        }
        
        # Show usage
        Write-Host ""
        Write-Info "🚀 Get started:"
        Write-Info "   $BinaryName --help"
        Write-Info "   $BinaryName --version"
        Write-Info "   $BinaryName -p `"Hello, Research CLI!`""
        Write-Host ""
        Write-Info "📖 Documentation: https://github.com/$Repo"
        
    }
    finally {
        # Cleanup
        if (Test-Path $tempDir) {
            Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# Run installation
Install-ResearchCLI
