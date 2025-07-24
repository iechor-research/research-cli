/**
 * ArXiv Command - CLI interface for arXiv MCP integration
 */

import { ResearchCommandContext } from './types.js';
import { Text, Box } from 'ink';
import React from 'react';

export interface ArXivCommandProps {
  context: ResearchCommandContext;
  subcommand: string;
  args: string[];
}

export const ArXivCommand: React.FC<ArXivCommandProps> = ({
  context,
  subcommand,
  args,
}) => {
  const [result, setResult] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    executeArXivCommand();
  }, []);

  const executeArXivCommand = async () => {
    setLoading(true);
    try {
      const toolRegistry = context.toolRegistry;
      const tool = toolRegistry.getTool('enhanced_bibliography_manager');

      if (!tool) {
        setResult('Enhanced bibliography manager tool not found');
        return;
      }

      let params: any = {};

      switch (subcommand) {
        case 'search':
          if (args.length === 0) {
            setResult(
              'Usage: /research arxiv search <query> [--max-results N]',
            );
            return;
          }
          params = {
            operation: 'search',
            query: args[0],
            searchOptions: { maxResults: 10 },
          };
          break;

        case 'download':
          if (args.length === 0) {
            setResult('Usage: /research arxiv download <paper-id>');
            return;
          }
          params = {
            operation: 'download',
            paperId: args[0],
          };
          break;

        case 'read':
          if (args.length === 0) {
            setResult('Usage: /research arxiv read <paper-id>');
            return;
          }
          params = {
            operation: 'read',
            paperId: args[0],
          };
          break;

        case 'cache':
          params = { operation: 'cache' };
          break;

        default:
          setResult(`Unknown arxiv subcommand: ${subcommand}`);
          return;
      }

      const response = await tool.execute(params);

      if (response.success) {
        setResult(response.message || 'Operation completed successfully');
      } else {
        setResult(`Error: ${response.error}`);
      }
    } catch (error) {
      setResult(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Text color="yellow">Processing arXiv command...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text>{result}</Text>
    </Box>
  );
};
