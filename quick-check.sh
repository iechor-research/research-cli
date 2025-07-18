#!/bin/bash

# 快速检查最新构建状态
echo "🔍 检查最新构建状态..."

# 获取最新的构建信息
build_info=$(curl -s "https://api.github.com/repos/iechor-research/research-cli/actions/workflows/175204909/runs?per_page=1" | jq -r '.workflow_runs[0]')

build_id=$(echo "$build_info" | jq -r '.id')
status=$(echo "$build_info" | jq -r '.status')
conclusion=$(echo "$build_info" | jq -r '.conclusion')
html_url=$(echo "$build_info" | jq -r '.html_url')

echo "构建ID: $build_id"
echo "状态: $status"
echo "结论: $conclusion"
echo "URL: $html_url"
echo ""

if [ "$status" = "in_progress" ]; then
    echo "📊 Job状态:"
    curl -s "https://api.github.com/repos/iechor-research/research-cli/actions/runs/$build_id/jobs" | \
    jq -r '.jobs[] | "- \(.name): \(.status) (\(.conclusion // "running"))"'
elif [ "$status" = "completed" ]; then
    if [ "$conclusion" = "success" ]; then
        echo "✅ 构建成功！"
        echo "🎉 可以使用以下命令安装："
        echo "curl -sSL https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/install.sh | bash"
    else
        echo "❌ 构建失败"
        echo "失败的步骤："
        curl -s "https://api.github.com/repos/iechor-research/research-cli/actions/runs/$build_id/jobs" | \
        jq -r '.jobs[] | select(.conclusion == "failure") | "- \(.name)"'
    fi
fi 