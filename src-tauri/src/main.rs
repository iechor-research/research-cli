// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "console")]

use std::env;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

fn find_node_module() -> Option<PathBuf> {
    // 1. 检查环境变量
    if let Ok(research_home) = env::var("RESEARCH_CLI_HOME") {
        let module_path = Path::new(&research_home).join("packages/cli/dist/index.js");
        if module_path.exists() {
            return Some(module_path);
        }
    }

    // 2. 检查二进制文件所在目录
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            // 检查同级目录
            let module_path = exe_dir.join("packages/cli/dist/index.js");
            if module_path.exists() {
                return Some(module_path);
            }
            
            // 检查上级目录（适用于开发环境）
            if let Some(parent) = exe_dir.parent() {
                let module_path = parent.join("packages/cli/dist/index.js");
                if module_path.exists() {
                    return Some(module_path);
                }
            }
        }
    }

    // 3. 检查系统安装路径
    let system_paths = [
        "/usr/local/lib/research-cli/packages/cli/dist/index.js",
        "/opt/research-cli/packages/cli/dist/index.js",
        "/usr/lib/research-cli/packages/cli/dist/index.js",
    ];
    
    for path in &system_paths {
        let module_path = Path::new(path);
        if module_path.exists() {
            return Some(module_path.to_path_buf());
        }
    }

    // 4. 检查用户目录
    if let Ok(home) = env::var("HOME") {
        let user_paths = [
            format!("{}/.local/lib/research-cli/packages/cli/dist/index.js", home),
            format!("{}/.research-cli/packages/cli/dist/index.js", home),
        ];
        
        for path in &user_paths {
            let module_path = Path::new(path);
            if module_path.exists() {
                return Some(module_path.to_path_buf());
            }
        }
    }

    None
}

fn main() {
    // 尝试查找Node.js模块
    let module_path = match find_node_module() {
        Some(path) => path,
        None => {
            eprintln!("Error: Research CLI module not found!");
            eprintln!("");
            eprintln!("Please ensure Research CLI is properly installed.");
            eprintln!("You can set RESEARCH_CLI_HOME environment variable to point to the installation directory.");
            eprintln!("");
            eprintln!("For installation instructions, visit:");
            eprintln!("https://github.com/iechor-research/research-cli");
            std::process::exit(1);
        }
    };

    // 获取命令行参数（跳过第一个参数，即程序名）
    let args: Vec<String> = env::args().skip(1).collect();

    // 构建命令
    let mut cmd = Command::new("node");
    cmd.arg(module_path);
    cmd.args(&args);
    cmd.stdin(Stdio::inherit());
    cmd.stdout(Stdio::inherit());
    cmd.stderr(Stdio::inherit());

    // 执行命令
    let status = cmd.status();

    match status {
        Ok(exit_status) => {
            std::process::exit(exit_status.code().unwrap_or(0));
        }
        Err(e) => {
            eprintln!("Failed to start Research CLI: {}", e);
            eprintln!("Make sure Node.js is installed and available in PATH.");
            std::process::exit(1);
        }
    }
}
