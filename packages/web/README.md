# Research CLI Web Interface

A modern web interface for Research CLI, providing an intuitive way to access all research tools through a browser.

## Features

- 🌐 **Web Terminal**: Interactive terminal interface in the browser
- 🔍 **Literature Search**: Search academic papers from multiple databases
- 📝 **Paper Outline Generator**: AI-powered outline generation
- 📚 **Bibliography Manager**: Organize and format references
- 📊 **Data Analysis Tools**: Statistical analysis and visualization
- 🚀 **Journal Submission**: Find journals and prepare submissions
- 🎨 **Modern UI**: Dark theme with glass morphism effects
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development

```bash
# Run in development mode with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test
```

## Project Structure

```
packages/web/
├── components/          # React components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── research/       # Research tool components
│   ├── terminal/       # Terminal components
│   └── ui/             # UI components
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   ├── research/       # Research tool pages
│   ├── _app.tsx        # App component
│   ├── _document.tsx   # Document component
│   └── index.tsx       # Home page
├── styles/             # CSS styles
├── lib/                # Utility functions
├── public/             # Static assets
└── README.md           # This file
```

## API Integration

The web interface integrates with the Research CLI core through API endpoints:

- `POST /api/research` - Execute research commands
- Commands supported:
  - `search` - Search academic papers
  - `outline` - Generate paper outlines
  - `bibliography` - Manage references

### Example API Usage

```javascript
// Search for papers
const response = await fetch('/api/research', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    command: 'search',
    args: ['machine learning']
  })
})

const data = await response.json()
```

## Available Pages

- `/` - Home page with feature overview
- `/research` - Research tools dashboard
- `/research/search` - Literature search interface
- `/research/outline` - Paper outline generator
- `/research/bibliography` - Bibliography manager
- `/terminal` - Web terminal interface

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
RESEARCH_CLI_API_KEY=your-api-key-here
```

### Customization

- **Themes**: Modify `styles/globals.css` for color schemes
- **Components**: Add new components in `components/` directory
- **Pages**: Add new pages in `pages/` directory
- **API**: Extend API functionality in `pages/api/`

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

### Docker

```bash
# Build Docker image
docker build -t research-cli-web .

# Run container
docker run -p 3000:3000 research-cli-web
```

### Static Export

```bash
# Build static site
npm run build
npm run export

# Serve static files
npx serve out
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

## Related Projects

- [Research CLI Core](../core/) - Core functionality
- [Research CLI](../cli/) - Command-line interface
- [Research Site](../../research-site/) - Marketing website

## Support

For support and questions:

- 📖 [Documentation](https://research-cli.iechor.com/docs)
- 🐛 [Issue Tracker](https://github.com/iechor-research/research-cli/issues)
- 💬 [Discussions](https://github.com/iechor-research/research-cli/discussions) 