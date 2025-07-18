#!/bin/bash

# 监控v0.2.7-native构建进度
echo "🔍 监控 v0.2.7-native 构建进度..."
echo "========================================"

while true; do
    # 获取最新的构建信息
    build_info=$(curl -s "https://api.github.com/repos/iechor-research/research-cli/actions/workflows/175204909/runs?per_page=1" | jq -r '.workflow_runs[0] | {id: .id, status: .status, conclusion: .conclusion, created_at: .created_at, html_url: .html_url}')
    
    if [ "$build_info" != "null" ]; then
        build_id=$(echo "$build_info" | jq -r '.id')
        status=$(echo "$build_info" | jq -r '.status')
        conclusion=$(echo "$build_info" | jq -r '.conclusion')
        created_at=$(echo "$build_info" | jq -r '.created_at')
        html_url=$(echo "$build_info" | jq -r '.html_url')
        
        echo "构建 ID: $build_id"
        echo "状态: $status"
        echo "结论: $conclusion"
        echo "创建时间: $created_at"
        echo "URL: $html_url"
        echo ""
        
        if [ "$status" = "completed" ]; then
            if [ "$conclusion" = "success" ]; then
                echo "✅ 构建成功！"
                echo "🎉 现在可以使用安装脚本了："
                echo "curl -sSL https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/install.sh | bash"
                break
            else
                echo "❌ 构建失败，结论: $conclusion"
                echo "查看详情: $html_url"
                
                # 获取失败的job详情
                echo ""
                echo "失败的job详情:"
                curl -s "https://api.github.com/repos/iechor-research/research-cli/actions/runs/$build_id/jobs" | \
                jq -r '.jobs[] | select(.conclusion == "failure") | "- \(.name): \(.conclusion)"'
                break
            fi
        else
            echo "⏳ 构建进行中..."
            
            # 显示各个job的状态
            echo "Job状态:"
            curl -s "https://api.github.com/repos/iechor-research/research-cli/actions/runs/$build_id/jobs" | \
            jq -r '.jobs[] | "- \(.name): \(.status) (\(.conclusion // "running"))"'
        fi
    else
        echo "❌ 无法获取构建信息"
    fi
    
    echo "========================================"
    echo "等待30秒后重新检查..."
    sleep 30
done 