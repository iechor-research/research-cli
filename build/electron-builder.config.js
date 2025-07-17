module.exports = {
  appId: "com.iechor.research-cli",
  productName: "Research CLI",
  directories: {
    output: "dist-electron"
  },
  files: [
    "build/**/*",
    "packages/cli/dist/**/*",
    "packages/core/dist/**/*",
    "node_modules/**/*",
    "!node_modules/.cache",
    "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
    "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
    "!**/node_modules/*.d.ts",
    "!**/node_modules/.bin",
    "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
    "!.editorconfig",
    "!**/._*",
    "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
    "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
    "!**/{appveyor.yml,.travis.yml,circle.yml}",
    "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
  ],
  extraResources: [
    {
      from: "packages/cli/src/utils/sandbox-*.sb",
      to: "sandbox/"
    }
  ],
  mac: {
    category: "public.app-category.developer-tools",
    icon: "build/assets/icon.icns",
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"]
      },
      {
        target: "zip",
        arch: ["x64", "arm64"]
      }
    ],
    darkModeSupport: true,
    minimumSystemVersion: "10.15.0"
  },
  win: {
    icon: "build/assets/icon.ico",
    target: [
      {
        target: "nsis",
        arch: ["x64", "ia32"]
      },
      {
        target: "portable",
        arch: ["x64"]
      },
      {
        target: "zip",
        arch: ["x64", "ia32"]
      }
    ]
  },
  linux: {
    icon: "build/assets/icon.png",
    category: "Development",
    target: [
      {
        target: "AppImage",
        arch: ["x64"]
      },
      {
        target: "deb",
        arch: ["x64"]
      },
      {
        target: "rpm",
        arch: ["x64"]
      },
      {
        target: "tar.gz",
        arch: ["x64"]
      }
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Research CLI"
  },
  dmg: {
    title: "Research CLI ${version}",
    icon: "build/assets/icon.icns",
    background: "build/assets/dmg-background.png",
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: "link",
        path: "/Applications"
      }
    ],
    window: {
      width: 540,
      height: 380
    }
  },
  publish: {
    provider: "github",
    owner: "iechor-research",
    repo: "research-cli"
  },
  afterSign: "build/notarize.js"
}; 