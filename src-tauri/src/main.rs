// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "console")]

use std::env;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

fn find_node_module() -> Option<PathBuf> {
    // 1. 检查环境变量 RESEARCH_CLI_HOME
    if let Ok(research_home) = env::var("RESEARCH_CLI_HOME") {
        let paths_to_try = [
            "packages/cli/dist/index.js",
            "dist/index.js", 
            "cli/dist/index.js",
            "index.js"
        ];
        
        for path in &paths_to_try {
            let module_path = Path::new(&research_home).join(path);
            if module_path.exists() {
                return Some(module_path);
            }
        }
    }

    // 2. 检查二进制文件所在目录的相对路径
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            // 检查同级的lib目录（系统安装）
            let lib_paths = [
                "../lib/research-cli/packages/cli/dist/index.js",
                "../lib/research-cli/dist/index.js",
                "../lib/research-cli/cli/dist/index.js",
                "../lib/research-cli/index.js",
                "lib/research-cli/packages/cli/dist/index.js",
                "lib/research-cli/dist/index.js",
            ];
            
            for path in &lib_paths {
                let module_path = exe_dir.join(path);
                if module_path.exists() {
                    return Some(module_path);
                }
            }
            
            // 检查开发环境路径
            if let Some(parent) = exe_dir.parent() {
                let dev_paths = [
                    "packages/cli/dist/index.js",
                    "packages/cli/index.js",
                ];
                
                for path in &dev_paths {
                    let module_path = parent.join(path);
                    if module_path.exists() {
                        return Some(module_path);
                    }
                }
            }
        }
    }

    // 3. 检查标准系统安装路径
    let system_paths = [
        "/usr/local/lib/research-cli/packages/cli/dist/index.js",
        "/usr/local/lib/research-cli/dist/index.js",
        "/opt/research-cli/packages/cli/dist/index.js",
        "/opt/research-cli/dist/index.js",
        "/usr/lib/research-cli/packages/cli/dist/index.js",
        "/usr/lib/research-cli/dist/index.js",
    ];
    
    for path in &system_paths {
        let module_path = Path::new(path);
        if module_path.exists() {
            return Some(module_path.to_path_buf());
        }
    }

    // 4. 检查用户目录安装路径
    if let Ok(home) = env::var("HOME") {
        let user_paths = [
            format!("{}/.local/lib/research-cli/packages/cli/dist/index.js", home),
            format!("{}/.local/lib/research-cli/dist/index.js", home),
            format!("{}/.research-cli/packages/cli/dist/index.js", home),
            format!("{}/.research-cli/dist/index.js", home),
        ];
        
        for path in &user_paths {
            let module_path = Path::new(path);
            if module_path.exists() {
                return Some(module_path.to_path_buf());
            }
        }
    }

    // 5. Windows特定路径
    if cfg!(windows) {
        if let Ok(appdata) = env::var("APPDATA") {
            let win_paths = [
                format!("{}/research-cli/packages/cli/dist/index.js", appdata),
                format!("{}/research-cli/dist/index.js", appdata),
            ];
            
            for path in &win_paths {
                let module_path = Path::new(path);
                if module_path.exists() {
                    return Some(module_path.to_path_buf());
                }
            }
        }
    }

    None
}

fn print_help_message() {
    eprintln!("Research CLI Native Wrapper");
    eprintln!("");
    eprintln!("Error: Research CLI module not found!");
    eprintln!("");
    eprintln!("This wrapper needs to find the Research CLI Node.js module to function.");
    eprintln!("");
    eprintln!("Troubleshooting:");
    eprintln!("1. If you installed via the complete installer, try:");
    eprintln!("   export RESEARCH_CLI_HOME=/usr/local/lib/research-cli");
    eprintln!("   # or");
    eprintln!("   export RESEARCH_CLI_HOME=$HOME/.local/lib/research-cli");
    eprintln!("");
    eprintln!("2. If you're in a development environment, make sure to build first:");
    eprintln!("   npm run build");
    eprintln!("");
    eprintln!("3. For a complete installation, run:");
    eprintln!("   curl -sSL https://github.com/iechor-research/research-cli/releases/latest/download/install-complete.sh | bash");
    eprintln!("");
    eprintln!("4. Manual installation:");
    eprintln!("   - Download research-cli-node.tar.gz from the release");
    eprintln!("   - Extract it to a directory");
    eprintln!("   - Set RESEARCH_CLI_HOME to that directory");
    eprintln!("");
    eprintln!("For more information, visit:");
    eprintln!("https://github.com/iechor-research/research-cli");
}

fn main() {
    // 尝试查找Node.js模块
    let module_path = match find_node_module() {
        Some(path) => path,
        None => {
            print_help_message();
            std::process::exit(1);
        }
    };

    // 检查Node.js是否可用
    if Command::new("node").arg("--version").output().is_err() {
        eprintln!("Error: Node.js is not installed or not available in PATH!");
        eprintln!("");
        eprintln!("Research CLI requires Node.js to function.");
        eprintln!("Please install Node.js from: https://nodejs.org/");
        eprintln!("");
        eprintln!("Supported Node.js versions: 18.0.0 or higher");
        std::process::exit(1);
    }

    // 获取命令行参数（跳过第一个参数，即程序名）
    let args: Vec<String> = env::args().skip(1).collect();

    // 构建命令
    let mut cmd = Command::new("node");
    cmd.arg(&module_path);
    cmd.args(&args);
    cmd.stdin(Stdio::inherit());
    cmd.stdout(Stdio::inherit());
    cmd.stderr(Stdio::inherit());

    // 设置环境变量（如果未设置）
    if env::var("RESEARCH_CLI_HOME").is_err() {
        if let Some(parent) = module_path.parent() {
            // 尝试找到包的根目录
            let mut current = parent;
            loop {
                if current.join("package.json").exists() || 
                   current.join("packages").exists() ||
                   current.file_name().and_then(|n| n.to_str()) == Some("research-cli") {
                    cmd.env("RESEARCH_CLI_HOME", current);
                    break;
                }
                if let Some(p) = current.parent() {
                    current = p;
                } else {
                    break;
                }
            }
        }
    }

    // 执行命令
    let status = cmd.status();

    match status {
        Ok(exit_status) => {
            std::process::exit(exit_status.code().unwrap_or(0));
        }
        Err(e) => {
            eprintln!("Failed to start Research CLI: {}", e);
            eprintln!("");
            eprintln!("This usually means Node.js is not properly installed.");
            eprintln!("Please ensure Node.js is installed and available in your PATH.");
            eprintln!("");
            eprintln!("You can test Node.js installation by running:");
            eprintln!("  node --version");
            std::process::exit(1);
        }
    }
}
