#!/bin/bash

echo "🔍 检查 Research CLI v0.2.7-native 构建状态..."
echo ""

# 检查release是否存在
echo "📦 检查 GitHub Release..."
RELEASE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.github.com/repos/iechor-research/research-cli/releases/tags/v0.2.7-native)

if [ "$RELEASE_STATUS" = "200" ]; then
    echo "✅ Release v0.2.7-native 已创建"
    
    # 检查assets
    echo "📋 检查可用文件..."
    ASSETS=$(curl -s https://api.github.com/repos/iechor-research/research-cli/releases/tags/v0.2.7-native | jq -r '.assets[].name' 2>/dev/null)
    
    if [ -n "$ASSETS" ]; then
        echo "✅ 可用文件:"
        echo "$ASSETS" | sed 's/^/   - /'
        
        # 检查install.sh是否可用
        if echo "$ASSETS" | grep -q "install.sh"; then
            echo ""
            echo "🎉 安装脚本已可用！你现在可以运行："
            echo "curl -sSL https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/install.sh | bash"
        else
            echo ""
            echo "⏳ 安装脚本还未上传，请稍等..."
        fi
    else
        echo "⏳ Release已创建但文件还在上传中..."
    fi
else
    echo "⏳ Release v0.2.7-native 还未创建，GitHub Actions可能仍在构建中..."
    echo ""
    echo "📊 你可以在以下链接查看构建进度："
    echo "https://github.com/iechor-research/research-cli/actions/workflows/build-native-wrapper.yml"
fi

echo ""
echo "🔄 如果构建仍在进行中，请等待5-10分钟后再试" 