# Research CLI PowerShell Installer
# Usage: iwr -useb https://raw.githubusercontent.com/iechor-research/research-cli/main/install.ps1 | iex

param(
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\research-cli",
    [string]$Version = "latest"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Cyan"
}

# Configuration
$Repo = "iechor-research/research-cli"
$BinaryName = "research-cli"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info { Write-ColorOutput "[INFO] $args" $Colors.Blue }
function Write-Success { Write-ColorOutput "[SUCCESS] $args" $Colors.Green }
function Write-Warn { Write-ColorOutput "[WARN] $args" $Colors.Yellow }
function Write-Error { Write-ColorOutput "[ERROR] $args" $Colors.Red }

function Show-Banner {
    Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                     Research CLI Installer                   ║
║                                                              ║
║  AI-powered research and development CLI tool for developers ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
}

function Get-Platform {
    $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    
    # Check for ARM64
    if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64" -or $env:PROCESSOR_ARCHITEW6432 -eq "ARM64") {
        $arch = "arm64"
    }
    
    return "win32-$arch"
}

function Get-LatestVersion {
    Write-Info "Fetching latest release information..."
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
        return $response.tag_name
    }
    catch {
        Write-Error "Failed to get latest version: $_"
        exit 1
    }
}

function Download-Package {
    param([string]$Version, [string]$Platform)
    
    $archiveName = "research-cli-$Platform.zip"
    $downloadUrl = "https://github.com/$Repo/releases/download/$Version/$archiveName"
    $tempDir = [System.IO.Path]::GetTempPath()
    $tempFile = Join-Path $tempDir $archiveName
    
    Write-Info "Downloading Research CLI $Version for $Platform..."
    Write-Info "URL: $downloadUrl"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $tempFile -UseBasicParsing
        Write-Info "Download completed: $tempFile"
        return $tempFile
    }
    catch {
        Write-Error "Failed to download Research CLI: $_"
        exit 1
    }
}

function Extract-Package {
    param([string]$ArchivePath, [string]$Platform)
    
    $tempDir = [System.IO.Path]::GetTempPath()
    $extractDir = Join-Path $tempDir "research-cli-extract"
    
    Write-Info "Extracting archive..."
    
    try {
        # Remove existing extract directory
        if (Test-Path $extractDir) {
            Remove-Item $extractDir -Recurse -Force
        }
        
        # Extract using .NET
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($ArchivePath, $extractDir)
        
        $packageDir = Join-Path $extractDir "research-cli-$Platform"
        
        if (-not (Test-Path $packageDir)) {
            Write-Error "Extraction failed: directory $packageDir not found"
            exit 1
        }
        
        return $packageDir
    }
    catch {
        Write-Error "Failed to extract package: $_"
        exit 1
    }
}

function Install-Binary {
    param([string]$PackageDir)
    
    $binaryPath = Join-Path $PackageDir "research-cli.bat"
    
    if (-not (Test-Path $binaryPath)) {
        Write-Error "Binary not found: $binaryPath"
        exit 1
    }
    
    Write-Info "Installing Research CLI to $InstallDir..."
    
    try {
        # Create install directory
        if (-not (Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }
        
        # Copy the entire package directory to preserve dependencies
        $targetDir = Join-Path $InstallDir "bundle"
        if (Test-Path $targetDir) {
            Remove-Item $targetDir -Recurse -Force
        }
        Copy-Item $PackageDir $targetDir -Recurse -Force
        
        # Create a wrapper batch file in install directory
        $wrapperPath = Join-Path $InstallDir "$BinaryName.bat"
        $wrapperContent = @"
@echo off
"%~dp0bundle\research-cli.bat" %*
"@
        Set-Content -Path $wrapperPath -Value $wrapperContent
        
        return $wrapperPath
    }
    catch {
        Write-Error "Failed to install binary: $_"
        exit 1
    }
}

function Test-Installation {
    param([string]$InstallPath)
    
    Write-Info "Verifying installation..."
    
    try {
        $versionOutput = & $InstallPath --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Research CLI installed successfully!"
            Write-Success "Version: $versionOutput"
            return $true
        }
        else {
            Write-Warn "Binary installed but version check failed: $versionOutput"
            return $false
        }
    }
    catch {
        Write-Error "Installation verification failed: $_"
        return $false
    }
}

function Add-ToPath {
    param([string]$Directory)
    
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    if ($currentPath -notlike "*$Directory*") {
        Write-Info "Adding $Directory to PATH..."
        
        $newPath = if ($currentPath) { "$currentPath;$Directory" } else { $Directory }
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        
        # Update current session PATH
        $env:Path = "$Directory;$env:Path"
        
        Write-Success "Added to PATH (restart terminal or run refreshenv to use)"
    }
}

function Main {
    Show-Banner
    Write-Host ""
    
    # Detect platform
    $platform = Get-Platform
    Write-Info "Detected platform: $platform"
    
    # Get version
    if ($Version -eq "latest") {
        $version = Get-LatestVersion
        Write-Info "Latest version: $version"
    }
    else {
        $version = $Version
        Write-Info "Using specified version: $version"
    }
    
    # Download package
    $archivePath = Download-Package $version $platform
    
    # Extract package
    $packageDir = Extract-Package $archivePath $platform
    
    # Install binary
    $installPath = Install-Binary $packageDir
    
    # Verify installation
    if (Test-Installation $installPath) {
        Write-Success "Installation completed successfully!"
        
        # Add to PATH
        Add-ToPath $InstallDir
        
        Write-Host ""
        Write-Info "🚀 Get started with Research CLI:"
        Write-Info "   $BinaryName --help"
        Write-Info "   $BinaryName --version"
        Write-Info ""
        Write-Info "📖 Documentation: https://github.com/$Repo"
        
        # Cleanup
        try {
            Remove-Item $archivePath -Force -ErrorAction SilentlyContinue
            Remove-Item (Split-Path $packageDir -Parent) -Recurse -Force -ErrorAction SilentlyContinue
        }
        catch {
            # Ignore cleanup errors
        }
    }
    else {
        Write-Error "Installation failed"
        exit 1
    }
}

# Run main function
Main
