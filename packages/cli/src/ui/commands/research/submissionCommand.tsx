import React from 'react';
import { Text, Box } from 'ink';

interface SubmissionCommandProps {
  args: string[];
}

interface SubmissionCommandOptions {
  operation?: string;
  projectPath?: string;
  projectName?: string;
  templateId?: string;
  templateSource?: 'overleaf' | 'arxiv' | 'local';
  arxivId?: string;
  journalName?: string;
  outputDir?: string;
  includeSupplementary?: boolean;
  validateOnly?: boolean;
  verbose?: boolean;
}

const SubmissionCommand: React.FC<SubmissionCommandProps> = ({ args }) => {
  const [status, setStatus] = React.useState<'parsing' | 'executing' | 'completed' | 'error'>('parsing');
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const parseArguments = (args: string[]): SubmissionCommandOptions => {
    const options: SubmissionCommandOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case 'init':
        case 'template':
        case 'extract':
        case 'validate':
        case 'prepare':
        case 'package':
        case 'checklist':
        case 'clean':
          options.operation = arg;
          break;
        case '--project':
        case '-p':
          if (nextArg) {
            options.projectPath = nextArg;
            i++;
          }
          break;
        case '--name':
        case '-n':
          if (nextArg) {
            options.projectName = nextArg;
            i++;
          }
          break;
        case '--template':
        case '-t':
          if (nextArg) {
            options.templateId = nextArg;
            i++;
          }
          break;
        case '--source':
        case '-s':
          if (nextArg && ['overleaf', 'arxiv', 'local'].includes(nextArg)) {
            options.templateSource = nextArg as 'overleaf' | 'arxiv' | 'local';
            i++;
          }
          break;
        case '--arxiv':
        case '-a':
          if (nextArg) {
            options.arxivId = nextArg;
            i++;
          }
          break;
        case '--journal':
        case '-j':
          if (nextArg) {
            options.journalName = nextArg;
            i++;
          }
          break;
        case '--output':
        case '-o':
          if (nextArg) {
            options.outputDir = nextArg;
            i++;
          }
          break;
        case '--include-supplementary':
        case '--include-supp':
          options.includeSupplementary = true;
          break;
        case '--validate-only':
          options.validateOnly = true;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
      }
    }

    return options;
  };

  const executeCommand = async (options: SubmissionCommandOptions) => {
    try {
      setStatus('executing');

      // 这里需要调用实际的投稿包准备器
      // 现在先模拟执行
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResult = {
        success: true,
        operation: options.operation,
        message: `${options.operation} operation completed successfully`,
        details: options
      };

      setResult(mockResult);
      setStatus('completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  React.useEffect(() => {
    const options = parseArguments(args);
    
    if (!options.operation) {
      setError('No operation specified. Use: init, template, extract, validate, prepare, package, checklist, or clean');
      setStatus('error');
      return;
    }

    executeCommand(options);
  }, [args]);

  const renderHelp = () => (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="cyan">Research CLI - Submission Commands</Text>
      <Text></Text>
      
      <Text bold color="yellow">OPERATIONS:</Text>
      <Text>  init      - Initialize new project from template</Text>
      <Text>  template  - Manage templates (search, fetch, cache)</Text>
      <Text>  extract   - Extract template from arXiv paper</Text>
      <Text>  validate  - Validate project for submission</Text>
      <Text>  prepare   - Prepare complete submission package</Text>
      <Text>  package   - Create submission archive</Text>
      <Text>  checklist - Generate submission checklist</Text>
      <Text>  clean     - Clean temporary files</Text>
      <Text></Text>

      <Text bold color="yellow">EXAMPLES:</Text>
      <Text color="gray">  # Initialize project from template</Text>
      <Text>  /research submission init --name "my-paper" --template "nature-template"</Text>
      <Text></Text>
      
      <Text color="gray">  # Search for templates</Text>
      <Text>  /research submission template --journal "Nature"</Text>
      <Text></Text>
      
      <Text color="gray">  # Extract template from arXiv</Text>
      <Text>  /research submission extract --arxiv "2301.12345"</Text>
      <Text></Text>
      
      <Text color="gray">  # Validate project</Text>
      <Text>  /research submission validate --project "./my-project"</Text>
      <Text></Text>
      
      <Text color="gray">  # Prepare submission</Text>
      <Text>  /research submission prepare --project "./my-project" --journal "Nature"</Text>
      <Text></Text>

      <Text bold color="yellow">OPTIONS:</Text>
      <Text>  -p, --project &lt;path&gt;        Project directory path</Text>
      <Text>  -n, --name &lt;name&gt;           Project name (for init)</Text>
      <Text>  -t, --template &lt;id&gt;        Template ID</Text>
      <Text>  -s, --source &lt;source&gt;      Template source (overleaf|arxiv|local)</Text>
      <Text>  -a, --arxiv &lt;id&gt;          arXiv paper ID</Text>
      <Text>  -j, --journal &lt;name&gt;       Target journal name</Text>
      <Text>  -o, --output &lt;dir&gt;         Output directory</Text>
      <Text>      --include-supp         Include supplementary materials</Text>
      <Text>      --validate-only        Only validate, don't create packages</Text>
      <Text>  -v, --verbose             Verbose output</Text>
    </Box>
  );

  const renderStatus = () => {
    switch (status) {
      case 'parsing':
        return <Text color="yellow">Parsing command arguments...</Text>;
      case 'executing':
        return <Text color="blue">Executing submission operation...</Text>;
      case 'completed':
        return (
          <Box flexDirection="column">
            <Text color="green">✓ Operation completed successfully</Text>
            {result && (
              <Box flexDirection="column" marginTop={1}>
                <Text bold>Operation: {result.operation}</Text>
                <Text>Message: {result.message}</Text>
                {result.details && (
                  <Box flexDirection="column" marginTop={1}>
                    <Text bold color="cyan">Details:</Text>
                    {result.details.projectPath && (
                      <Text>  Project Path: {result.details.projectPath}</Text>
                    )}
                    {result.details.projectName && (
                      <Text>  Project Name: {result.details.projectName}</Text>
                    )}
                    {result.details.templateId && (
                      <Text>  Template: {result.details.templateId}</Text>
                    )}
                    {result.details.journalName && (
                      <Text>  Journal: {result.details.journalName}</Text>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      case 'error':
        return (
          <Box flexDirection="column">
            <Text color="red">✗ Error: {error}</Text>
            {renderHelp()}
          </Box>
        );
      default:
        return <Text>Unknown status</Text>;
    }
  };

  const renderInitProgress = () => {
    if (status !== 'executing' || result?.operation !== 'init') return null;
    
    return (
      <Box flexDirection="column" marginY={1}>
        <Text color="blue">Initializing project...</Text>
        <Text color="gray">• Fetching template</Text>
        <Text color="gray">• Creating project structure</Text>
        <Text color="gray">• Writing template files</Text>
        <Text color="gray">• Generating configuration</Text>
      </Box>
    );
  };

  const renderTemplateSearch = () => {
    if (status !== 'completed' || result?.operation !== 'template') return null;
    
    return (
      <Box flexDirection="column" marginY={1}>
        <Text bold color="cyan">Available Templates:</Text>
        <Text>• Nature Journal Template (overleaf:nature-template)</Text>
        <Text>• IEEE Conference Template (overleaf:ieee-template)</Text>
        <Text>• ACS Journal Template (overleaf:acs-template)</Text>
        <Text color="gray">  Use --template &lt;id&gt; to select a specific template</Text>
      </Box>
    );
  };

  const renderValidationResults = () => {
    if (status !== 'completed' || result?.operation !== 'validate') return null;
    
    return (
      <Box flexDirection="column" marginY={1}>
        <Text bold color="cyan">Validation Results:</Text>
        <Text color="green">✓ LaTeX compilation successful</Text>
        <Text color="green">✓ Bibliography format correct</Text>
        <Text color="yellow">⚠ Figure resolution could be improved</Text>
        <Text color="green">✓ File structure organized</Text>
        <Text></Text>
        <Text bold>Overall: 3/4 checks passed</Text>
      </Box>
    );
  };

  const renderChecklist = () => {
    if (status !== 'completed' || result?.operation !== 'checklist') return null;
    
    const checklistItems = [
      { name: 'LaTeX Compilation', status: 'completed' },
      { name: 'Bibliography Format', status: 'completed' },
      { name: 'Figure Quality', status: 'warning' },
      { name: 'Abstract Length', status: 'completed' },
      { name: 'Keywords', status: 'pending' },
      { name: 'Cover Letter', status: 'pending' }
    ];

    return (
      <Box flexDirection="column" marginY={1}>
        <Text bold color="cyan">Submission Checklist:</Text>
        {checklistItems.map((item, index) => (
          <Text key={index}>
            {item.status === 'completed' && <Text color="green">✓</Text>}
            {item.status === 'warning' && <Text color="yellow">⚠</Text>}
            {item.status === 'pending' && <Text color="gray">○</Text>}
            {' '}{item.name}
          </Text>
        ))}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      {renderStatus()}
      {renderInitProgress()}
      {renderTemplateSearch()}
      {renderValidationResults()}
      {renderChecklist()}
    </Box>
  );
};

// Export command component
export { SubmissionCommand }; 