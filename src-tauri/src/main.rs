// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "console")]

use std::process::{Command, Stdio};

fn main() {
    // 直接启动原生 Research CLI
    let status = Command::new("node")
        .arg("packages/cli/dist/index.js")
        .stdin(Stdio::inherit())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status();

    match status {
        Ok(exit_status) => {
            std::process::exit(exit_status.code().unwrap_or(0));
        }
        Err(e) => {
            eprintln!("Failed to start Research CLI: {}", e);
            std::process::exit(1);
        }
    }
}
