/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseResearchTool } from '../base-tool.js';
import {
  ResearchToolParams,
  ProgrammingLanguage,
  ResearchMethod,
  DataFormat,
  AnalysisType,
  ResearchToolCategory,
} from '../types.js';

/**
 * 实验配置参数接口
 */
export interface ExperimentCodeParams extends ResearchToolParams {
  experimentName: string;
  researchMethod: ResearchMethod;
  language: ProgrammingLanguage;
  dataTypes: DataFormat[];
  analysisTypes: AnalysisType[];
  outputFormats: ('html' | 'pdf' | 'markdown' | 'jupyter')[];
  includeVisualization?: boolean;
  includeStatistics?: boolean;
  includeTesting?: boolean;
  customRequirements?: string[];
  dataPath?: string;
  description?: string;
}

/**
 * 生成的代码结果
 */
export interface ExperimentCodeResult {
  experimentName: string;
  language: ProgrammingLanguage;
  files: {
    filename: string;
    content: string;
    description: string;
    type:
      | 'main'
      | 'config'
      | 'utils'
      | 'test'
      | 'requirements'
      | 'documentation';
  }[];
  dependencies: string[];
  instructions: string[];
  estimatedRuntime: string;
  resources: {
    name: string;
    url: string;
    description: string;
  }[];
}

/**
 * 代码模板接口
 */
interface CodeTemplate {
  imports: string[];
  setup: string[];
  dataLoading: string[];
  processing: string[];
  analysis: string[];
  visualization: string[];
  output: string[];
  testing?: string[];
}

/**
 * 实验代码生成器工具
 * 根据研究方法、编程语言和分析需求自动生成完整的实验代码框架
 */
export class ExperimentCodeGenerator extends BaseResearchTool<
  ExperimentCodeParams,
  ExperimentCodeResult
> {
  constructor() {
    super(
      'generate_experiment_code',
      'Generate experiment code frameworks',
      ResearchToolCategory.ANALYSIS,
    );
  }

  public validate(params: ResearchToolParams): boolean {
    const expParams = params as ExperimentCodeParams;
    return !!(
      expParams.experimentName?.trim() &&
      expParams.researchMethod &&
      expParams.language &&
      expParams.dataTypes?.length > 0 &&
      expParams.analysisTypes?.length > 0 &&
      expParams.outputFormats?.length > 0
    );
  }

  public getHelp(): string {
    return this.formatHelp(
      'Generate complete experiment code frameworks based on research methods and requirements',
      [
        {
          name: 'experimentName',
          type: 'string',
          required: true,
          description: 'Name of the experiment',
        },
        {
          name: 'researchMethod',
          type: 'ResearchMethod',
          required: true,
          description:
            'Research methodology (machine_learning, statistical_analysis, etc.)',
        },
        {
          name: 'language',
          type: 'ProgrammingLanguage',
          required: true,
          description:
            'Programming language (python, r, matlab, julia, javascript)',
        },
        {
          name: 'dataTypes',
          type: 'DataFormat[]',
          required: true,
          description: 'Input data formats (csv, json, excel, etc.)',
        },
        {
          name: 'analysisTypes',
          type: 'AnalysisType[]',
          required: true,
          description:
            'Types of analysis (descriptive, inferential, ml, visualization)',
        },
        {
          name: 'outputFormats',
          type: 'string[]',
          required: true,
          description: 'Output formats (html, pdf, markdown, jupyter)',
        },
        {
          name: 'includeVisualization',
          type: 'boolean',
          required: false,
          description: 'Include data visualization code',
        },
        {
          name: 'includeStatistics',
          type: 'boolean',
          required: false,
          description: 'Include statistical analysis code',
        },
        {
          name: 'includeTesting',
          type: 'boolean',
          required: false,
          description: 'Include unit testing code',
        },
        {
          name: 'customRequirements',
          type: 'string[]',
          required: false,
          description: 'Additional custom requirements',
        },
        {
          name: 'dataPath',
          type: 'string',
          required: false,
          description: 'Path to data files',
        },
        {
          name: 'description',
          type: 'string',
          required: false,
          description: 'Experiment description',
        },
      ],
      [
        {
          description: 'Generate Python machine learning experiment',
          params: {
            experimentName: 'ML Classification Analysis',
            researchMethod: 'machine_learning',
            language: 'python',
            dataTypes: ['csv'],
            analysisTypes: ['machine_learning', 'visualization'],
            outputFormats: ['html', 'jupyter'],
            includeVisualization: true,
            includeTesting: true,
          },
        },
        {
          description: 'Generate R statistical analysis',
          params: {
            experimentName: 'Statistical Survey Analysis',
            researchMethod: 'statistical_analysis',
            language: 'r',
            dataTypes: ['csv', 'excel'],
            analysisTypes: ['descriptive', 'inferential'],
            outputFormats: ['pdf', 'html'],
          },
        },
      ],
    );
  }

  protected async executeImpl(
    params: ExperimentCodeParams,
  ): Promise<ExperimentCodeResult> {
    // 生成代码模板
    const template = this.generateCodeTemplate(params);

    // 生成文件列表
    const files = this.generateFiles(params, template);

    // 获取依赖列表
    const dependencies = this.getDependencies(params);

    // 生成使用说明
    const instructions = this.generateInstructions(params);

    // 估算运行时间
    const estimatedRuntime = this.estimateRuntime(params);

    // 生成学习资源
    const resources = this.generateResources(params);

    return {
      experimentName: params.experimentName,
      language: params.language,
      files,
      dependencies,
      instructions,
      estimatedRuntime,
      resources,
    };
  }

  /**
   * 生成代码模板
   */
  private generateCodeTemplate(params: ExperimentCodeParams): CodeTemplate {
    switch (params.language) {
      case ProgrammingLanguage.PYTHON:
        return this.generatePythonTemplate(params);
      case ProgrammingLanguage.R:
        return this.generateRTemplate(params);
      case ProgrammingLanguage.MATLAB:
        return this.generateMatlabTemplate(params);
      case ProgrammingLanguage.JULIA:
        return this.generateJuliaTemplate(params);
      case ProgrammingLanguage.JAVASCRIPT:
        return this.generateJavaScriptTemplate(params);
      default:
        throw new Error(`Unsupported language: ${params.language}`);
    }
  }

  /**
   * 生成 Python 代码模板
   */
  private generatePythonTemplate(params: ExperimentCodeParams): CodeTemplate {
    const imports = [
      'import pandas as pd',
      'import numpy as np',
      'import matplotlib.pyplot as plt',
      'import seaborn as sns',
      'from pathlib import Path',
      'import warnings',
      'warnings.filterwarnings("ignore")',
    ];

    // 根据研究方法添加特定导入
    if (params.researchMethod === ResearchMethod.MACHINE_LEARNING) {
      imports.push(
        'from sklearn.model_selection import train_test_split, cross_val_score',
        'from sklearn.preprocessing import StandardScaler, LabelEncoder',
        'from sklearn.metrics import classification_report, confusion_matrix',
        'from sklearn.ensemble import RandomForestClassifier',
        'from sklearn.linear_model import LogisticRegression',
      );
    }

    if (params.researchMethod === ResearchMethod.STATISTICAL_ANALYSIS) {
      imports.push(
        'import scipy.stats as stats',
        'from scipy.stats import ttest_ind, chi2_contingency, pearsonr',
        'import statsmodels.api as sm',
      );
    }

    if (params.includeVisualization) {
      imports.push(
        'import plotly.express as px',
        'import plotly.graph_objects as go',
        'from plotly.subplots import make_subplots',
      );
    }

    const setup = [
      '# Experiment Configuration',
      `experiment_name = "${params.experimentName}"`,
      `data_path = "${params.dataPath || './data/'}"`,
      'output_path = "./results/"',
      '',
      '# Create output directory',
      'Path(output_path).mkdir(exist_ok=True)',
      '',
      '# Set random seed for reproducibility',
      'np.random.seed(42)',
      '',
      '# Configure plotting',
      'plt.style.use("seaborn-v0_8")',
      'sns.set_palette("husl")',
    ];

    const dataLoading = this.generatePythonDataLoading(params);
    const processing = this.generatePythonProcessing(params);
    const analysis = this.generatePythonAnalysis(params);
    const visualization = this.generatePythonVisualization(params);
    const output = this.generatePythonOutput(params);
    const testing = params.includeTesting
      ? this.generatePythonTesting(params)
      : undefined;

    return {
      imports,
      setup,
      dataLoading,
      processing,
      analysis,
      visualization,
      output,
      testing,
    };
  }

  /**
   * 生成 Python 数据加载代码
   */
  private generatePythonDataLoading(params: ExperimentCodeParams): string[] {
    const code = [
      'def load_data():',
      '    """Load and combine data from multiple sources"""',
      '    data_frames = []',
      '    ',
    ];

    params.dataTypes.forEach((dataType) => {
      switch (dataType) {
        case DataFormat.CSV:
          code.push(
            '    # Load CSV files',
            '    for csv_file in Path(data_path).glob("*.csv"):',
            '        df = pd.read_csv(csv_file)',
            '        df["source_file"] = csv_file.name',
            '        data_frames.append(df)',
            '    ',
          );
          break;
        case DataFormat.JSON:
          code.push(
            '    # Load JSON files',
            '    for json_file in Path(data_path).glob("*.json"):',
            '        df = pd.read_json(json_file)',
            '        df["source_file"] = json_file.name',
            '        data_frames.append(df)',
            '    ',
          );
          break;
        case DataFormat.EXCEL:
          code.push(
            '    # Load Excel files',
            '    for excel_file in Path(data_path).glob("*.xlsx"):',
            '        df = pd.read_excel(excel_file)',
            '        df["source_file"] = excel_file.name',
            '        data_frames.append(df)',
            '    ',
          );
          break;
      }
    });

    code.push(
      '    if not data_frames:',
      '        raise ValueError("No data files found in the specified path")',
      '    ',
      '    # Combine all data',
      '    combined_data = pd.concat(data_frames, ignore_index=True)',
      '    ',
      '    print(f"Loaded {len(combined_data)} rows from {len(data_frames)} files")',
      '    print(f"Data shape: {combined_data.shape}")',
      '    print(f"Columns: {list(combined_data.columns)}")',
      '    ',
      '    return combined_data',
    );

    return code;
  }

  /**
   * 生成 Python 数据处理代码
   */
  private generatePythonProcessing(params: ExperimentCodeParams): string[] {
    return [
      'def preprocess_data(df):',
      '    """Clean and preprocess the data"""',
      '    print("\\n=== Data Preprocessing ===")',
      '    ',
      '    # Create a copy to avoid modifying original data',
      '    processed_df = df.copy()',
      '    ',
      '    # Handle missing values',
      '    print(f"Missing values before cleaning:")',
      '    print(processed_df.isnull().sum())',
      '    ',
      '    # Fill numeric columns with median',
      '    numeric_columns = processed_df.select_dtypes(include=[np.number]).columns',
      '    processed_df[numeric_columns] = processed_df[numeric_columns].fillna(',
      '        processed_df[numeric_columns].median()',
      '    )',
      '    ',
      '    # Fill categorical columns with mode',
      '    categorical_columns = processed_df.select_dtypes(include=["object"]).columns',
      '    for col in categorical_columns:',
      '        processed_df[col] = processed_df[col].fillna(processed_df[col].mode()[0])',
      '    ',
      '    # Remove duplicates',
      '    initial_rows = len(processed_df)',
      '    processed_df = processed_df.drop_duplicates()',
      '    print(f"Removed {initial_rows - len(processed_df)} duplicate rows")',
      '    ',
      '    # Data type optimization',
      '    for col in processed_df.columns:',
      '        if processed_df[col].dtype == "object":',
      '            try:',
      '                processed_df[col] = pd.to_numeric(processed_df[col])',
      '            except ValueError:',
      '                pass',
      '    ',
      '    print(f"Processed data shape: {processed_df.shape}")',
      '    return processed_df',
    ];
  }

  /**
   * 生成 Python 分析代码
   */
  private generatePythonAnalysis(params: ExperimentCodeParams): string[] {
    const code = [
      'def perform_analysis(df):',
      '    """Perform the main analysis"""',
      '    print("\\n=== Analysis Results ===")',
      '    results = {}',
      '    ',
    ];

    params.analysisTypes.forEach((analysisType) => {
      switch (analysisType) {
        case AnalysisType.DESCRIPTIVE:
          code.push(
            '    # Descriptive Statistics',
            '    print("\\n--- Descriptive Statistics ---")',
            '    desc_stats = df.describe(include="all")',
            '    print(desc_stats)',
            '    results["descriptive_stats"] = desc_stats',
            '    ',
          );
          break;
        case AnalysisType.MACHINE_LEARNING:
          if (params.researchMethod === ResearchMethod.MACHINE_LEARNING) {
            code.push(
              '    # Machine Learning Analysis',
              '    print("\\n--- Machine Learning Analysis ---")',
              '    ',
              '    # Prepare features and target',
              '    # Note: You need to specify your target column',
              '    numeric_features = df.select_dtypes(include=[np.number]).columns',
              '    if len(numeric_features) > 1:',
              '        X = df[numeric_features[:-1]]  # All but last column as features',
              '        y = df[numeric_features[-1]]   # Last column as target',
              '        ',
              '        # Split the data',
              '        X_train, X_test, y_train, y_test = train_test_split(',
              '            X, y, test_size=0.2, random_state=42',
              '        )',
              '        ',
              '        # Scale features',
              '        scaler = StandardScaler()',
              '        X_train_scaled = scaler.fit_transform(X_train)',
              '        X_test_scaled = scaler.transform(X_test)',
              '        ',
              '        # Train models',
              '        models = {',
              '            "Random Forest": RandomForestClassifier(random_state=42),',
              '            "Logistic Regression": LogisticRegression(random_state=42)',
              '        }',
              '        ',
              '        model_results = {}',
              '        for name, model in models.items():',
              '            model.fit(X_train_scaled, y_train)',
              '            cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)',
              '            model_results[name] = {',
              '                "cv_mean": cv_scores.mean(),',
              '                "cv_std": cv_scores.std(),',
              '                "model": model',
              '            }',
              '            print(f"{name}: CV Score = {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")',
              '        ',
              '        results["ml_models"] = model_results',
              '    ',
            );
          }
          break;
        case AnalysisType.INFERENTIAL:
          if (params.researchMethod === ResearchMethod.STATISTICAL_ANALYSIS) {
            code.push(
              '    # Inferential Statistics',
              '    print("\\n--- Inferential Statistics ---")',
              '    ',
              '    numeric_cols = df.select_dtypes(include=[np.number]).columns',
              '    if len(numeric_cols) >= 2:',
              '        # Correlation analysis',
              '        correlation_matrix = df[numeric_cols].corr()',
              '        print("Correlation Matrix:")',
              '        print(correlation_matrix)',
              '        results["correlation_matrix"] = correlation_matrix',
              '        ',
              '        # Pairwise t-tests (example)',
              '        for i, col1 in enumerate(numeric_cols):',
              '            for col2 in numeric_cols[i+1:]:',
              '                corr, p_value = pearsonr(df[col1].dropna(), df[col2].dropna())',
              '                print(f"Correlation {col1} vs {col2}: r={corr:.3f}, p={p_value:.3f}")',
              '    ',
            );
          }
          break;
      }
    });

    code.push('    return results');
    return code;
  }

  /**
   * 生成 Python 可视化代码
   */
  private generatePythonVisualization(params: ExperimentCodeParams): string[] {
    if (!params.includeVisualization) {
      return ['# Visualization disabled'];
    }

    return [
      'def create_visualizations(df, results):',
      '    """Create comprehensive visualizations"""',
      '    print("\\n=== Creating Visualizations ===")',
      '    ',
      '    # Set up the plotting environment',
      '    fig_size = (12, 8)',
      '    ',
      '    # 1. Data Overview',
      '    plt.figure(figsize=fig_size)',
      '    plt.subplot(2, 2, 1)',
      '    df.hist(bins=30, alpha=0.7)',
      '    plt.title("Data Distribution")',
      '    plt.tight_layout()',
      '    ',
      '    # 2. Correlation Heatmap',
      '    if "correlation_matrix" in results:',
      '        plt.subplot(2, 2, 2)',
      '        sns.heatmap(results["correlation_matrix"], annot=True, cmap="coolwarm", center=0)',
      '        plt.title("Correlation Matrix")',
      '    ',
      '    # 3. Missing Data Pattern',
      '    plt.subplot(2, 2, 3)',
      '    sns.heatmap(df.isnull(), cbar=True, yticklabels=False)',
      '    plt.title("Missing Data Pattern")',
      '    ',
      '    # 4. Statistical Summary',
      '    plt.subplot(2, 2, 4)',
      '    numeric_cols = df.select_dtypes(include=[np.number]).columns[:5]  # Top 5 numeric columns',
      '    if len(numeric_cols) > 0:',
      '        df[numeric_cols].boxplot()',
      '        plt.title("Box Plots")',
      '        plt.xticks(rotation=45)',
      '    ',
      '    plt.tight_layout()',
      '    plt.savefig(f"{output_path}/analysis_overview.png", dpi=300, bbox_inches="tight")',
      '    plt.show()',
      '    ',
      '    # Interactive plots with Plotly',
      '    if len(df.select_dtypes(include=[np.number]).columns) >= 2:',
      '        numeric_cols = df.select_dtypes(include=[np.number]).columns',
      '        fig = px.scatter_matrix(df[numeric_cols], title="Interactive Scatter Matrix")',
      '        fig.write_html(f"{output_path}/interactive_plots.html")',
      '        print("Interactive plots saved to interactive_plots.html")',
    ];
  }

  /**
   * 生成 Python 输出代码
   */
  private generatePythonOutput(params: ExperimentCodeParams): string[] {
    const code = [
      'def generate_report(df, results):',
      '    """Generate comprehensive analysis report"""',
      '    print("\\n=== Generating Report ===")',
      '    ',
    ];

    params.outputFormats.forEach((format) => {
      switch (format) {
        case 'html':
          code.push(
            '    # Generate HTML Report',
            '    html_content = f"""',
            '    <!DOCTYPE html>',
            '    <html>',
            '    <head>',
            '        <title>{experiment_name} - Analysis Report</title>',
            '        <style>',
            '            body {{ font-family: Arial, sans-serif; margin: 40px; }}',
            '            .summary {{ background-color: #f5f5f5; padding: 20px; border-radius: 5px; }}',
            '            table {{ border-collapse: collapse; width: 100%; }}',
            '            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}',
            '            th {{ background-color: #f2f2f2; }}',
            '        </style>',
            '    </head>',
            '    <body>',
            '        <h1>{experiment_name}</h1>',
            '        <div class="summary">',
            '            <h2>Summary</h2>',
            '            <p>Data Shape: {df.shape}</p>',
            '            <p>Analysis Date: {pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")}</p>',
            '        </div>',
            '        <h2>Results</h2>',
            '        <p>Detailed analysis results would be inserted here.</p>',
            '    </body>',
            '    </html>',
            '    """',
            '    ',
            '    with open(f"{output_path}/report.html", "w") as f:',
            '        f.write(html_content)',
            '    print("HTML report saved to report.html")',
            '    ',
          );
          break;
        case 'markdown':
          code.push(
            '    # Generate Markdown Report',
            '    md_content = f"""# {experiment_name}',
            '    ',
            '    ## Summary',
            '    - Data Shape: {df.shape}',
            '    - Analysis Date: {pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")}',
            '    ',
            '    ## Results',
            '    Detailed analysis results would be inserted here.',
            '    """',
            '    ',
            '    with open(f"{output_path}/report.md", "w") as f:',
            '        f.write(md_content)',
            '    print("Markdown report saved to report.md")',
            '    ',
          );
          break;
      }
    });

    return code;
  }

  /**
   * 生成 Python 测试代码
   */
  private generatePythonTesting(params: ExperimentCodeParams): string[] {
    return [
      '# Unit Tests',
      'def test_data_loading():',
      '    """Test data loading functionality"""',
      '    try:',
      '        data = load_data()',
      '        assert not data.empty, "Data should not be empty"',
      '        assert len(data.columns) > 0, "Data should have columns"',
      '        print("✓ Data loading test passed")',
      '    except Exception as e:',
      '        print(f"✗ Data loading test failed: {e}")',
      '    ',
      'def test_preprocessing():',
      '    """Test data preprocessing"""',
      '    try:',
      '        # Create sample data for testing',
      '        sample_data = pd.DataFrame({',
      '            "A": [1, 2, np.nan, 4, 5],',
      '            "B": ["a", "b", None, "d", "e"]',
      '        })',
      '        processed = preprocess_data(sample_data)',
      '        assert processed.isnull().sum().sum() == 0, "No missing values should remain"',
      '        print("✓ Preprocessing test passed")',
      '    except Exception as e:',
      '        print(f"✗ Preprocessing test failed: {e}")',
      '    ',
      'def run_tests():',
      '    """Run all tests"""',
      '    print("\\n=== Running Tests ===")',
      '    test_data_loading()',
      '    test_preprocessing()',
      '    print("Tests completed")',
    ];
  }

  /**
   * 生成 R 代码模板
   */
  private generateRTemplate(params: ExperimentCodeParams): CodeTemplate {
    const imports = [
      'library(tidyverse)',
      'library(readr)',
      'library(readxl)',
      'library(jsonlite)',
      'library(ggplot2)',
      'library(corrplot)',
      'library(psych)',
      'library(knitr)',
      'library(rmarkdown)',
    ];

    if (params.researchMethod === ResearchMethod.STATISTICAL_ANALYSIS) {
      imports.push(
        'library(stats)',
        'library(car)',
        'library(lmtest)',
        'library(nortest)',
      );
    }

    const setup = [
      '# Experiment Configuration',
      `experiment_name <- "${params.experimentName}"`,
      `data_path <- "${params.dataPath || './data/'}"`,
      'output_path <- "./results/"',
      '',
      '# Create output directory',
      'dir.create(output_path, showWarnings = FALSE)',
      '',
      '# Set seed for reproducibility',
      'set.seed(42)',
      '',
      '# Configure plotting',
      'theme_set(theme_minimal())',
    ];

    return {
      imports,
      setup,
      dataLoading: this.generateRDataLoading(params),
      processing: this.generateRProcessing(params),
      analysis: this.generateRAnalysis(params),
      visualization: this.generateRVisualization(params),
      output: this.generateROutput(params),
    };
  }

  /**
   * 生成 R 数据加载代码
   */
  private generateRDataLoading(params: ExperimentCodeParams): string[] {
    const code = [
      'load_data <- function() {',
      '  cat("Loading data...\\n")',
      '  data_frames <- list()',
      '  ',
    ];

    params.dataTypes.forEach((dataType) => {
      switch (dataType) {
        case DataFormat.CSV:
          code.push(
            '  # Load CSV files',
            '  csv_files <- list.files(data_path, pattern = "\\\\.csv$", full.names = TRUE)',
            '  for (file in csv_files) {',
            '    df <- read_csv(file)',
            '    df$source_file <- basename(file)',
            '    data_frames <- append(data_frames, list(df))',
            '  }',
            '  ',
          );
          break;
        case DataFormat.EXCEL:
          code.push(
            '  # Load Excel files',
            '  excel_files <- list.files(data_path, pattern = "\\\\.xlsx?$", full.names = TRUE)',
            '  for (file in excel_files) {',
            '    df <- read_excel(file)',
            '    df$source_file <- basename(file)',
            '    data_frames <- append(data_frames, list(df))',
            '  }',
            '  ',
          );
          break;
      }
    });

    code.push(
      '  if (length(data_frames) == 0) {',
      '    stop("No data files found in the specified path")',
      '  }',
      '  ',
      '  # Combine all data',
      '  combined_data <- bind_rows(data_frames)',
      '  ',
      '  cat("Loaded", nrow(combined_data), "rows from", length(data_frames), "files\\n")',
      '  cat("Data dimensions:", dim(combined_data), "\\n")',
      '  cat("Columns:", paste(names(combined_data), collapse = ", "), "\\n")',
      '  ',
      '  return(combined_data)',
      '}',
    );

    return code;
  }

  /**
   * 生成 R 处理代码
   */
  private generateRProcessing(params: ExperimentCodeParams): string[] {
    return [
      'preprocess_data <- function(df) {',
      '  cat("\\n=== Data Preprocessing ===\\n")',
      '  ',
      '  # Handle missing values',
      '  cat("Missing values before cleaning:\\n")',
      '  print(sapply(df, function(x) sum(is.na(x))))',
      '  ',
      '  # Fill numeric columns with median',
      '  numeric_cols <- sapply(df, is.numeric)',
      '  df[numeric_cols] <- lapply(df[numeric_cols], function(x) {',
      '    ifelse(is.na(x), median(x, na.rm = TRUE), x)',
      '  })',
      '  ',
      '  # Fill character columns with mode',
      '  char_cols <- sapply(df, is.character)',
      '  df[char_cols] <- lapply(df[char_cols], function(x) {',
      '    mode_val <- names(sort(table(x), decreasing = TRUE))[1]',
      '    ifelse(is.na(x), mode_val, x)',
      '  })',
      '  ',
      '  # Remove duplicates',
      '  initial_rows <- nrow(df)',
      '  df <- distinct(df)',
      '  cat("Removed", initial_rows - nrow(df), "duplicate rows\\n")',
      '  ',
      '  cat("Processed data dimensions:", dim(df), "\\n")',
      '  return(df)',
      '}',
    ];
  }

  /**
   * 生成 R 分析代码
   */
  private generateRAnalysis(params: ExperimentCodeParams): string[] {
    const code = [
      'perform_analysis <- function(df) {',
      '  cat("\\n=== Analysis Results ===\\n")',
      '  results <- list()',
      '  ',
    ];

    params.analysisTypes.forEach((analysisType) => {
      switch (analysisType) {
        case AnalysisType.DESCRIPTIVE:
          code.push(
            '  # Descriptive Statistics',
            '  cat("\\n--- Descriptive Statistics ---\\n")',
            '  desc_stats <- describe(df)',
            '  print(desc_stats)',
            '  results$descriptive_stats <- desc_stats',
            '  ',
          );
          break;
        case AnalysisType.INFERENTIAL:
          code.push(
            '  # Inferential Statistics',
            '  cat("\\n--- Inferential Statistics ---\\n")',
            '  numeric_cols <- select_if(df, is.numeric)',
            '  if (ncol(numeric_cols) >= 2) {',
            '    correlation_matrix <- cor(numeric_cols, use = "complete.obs")',
            '    cat("Correlation Matrix:\\n")',
            '    print(correlation_matrix)',
            '    results$correlation_matrix <- correlation_matrix',
            '  }',
            '  ',
          );
          break;
      }
    });

    code.push('  return(results)', '}');
    return code;
  }

  /**
   * 生成 R 可视化代码
   */
  private generateRVisualization(params: ExperimentCodeParams): string[] {
    if (!params.includeVisualization) {
      return ['# Visualization disabled'];
    }

    return [
      'create_visualizations <- function(df, results) {',
      '  cat("\\n=== Creating Visualizations ===\\n")',
      '  ',
      '  # Data overview plot',
      '  numeric_cols <- select_if(df, is.numeric)',
      '  if (ncol(numeric_cols) > 0) {',
      '    p1 <- numeric_cols %>%',
      '      gather(key = "variable", value = "value") %>%',
      '      ggplot(aes(x = value)) +',
      '      geom_histogram(bins = 30, alpha = 0.7) +',
      '      facet_wrap(~variable, scales = "free") +',
      '      labs(title = "Data Distribution") +',
      '      theme_minimal()',
      '    ',
      '    ggsave(paste0(output_path, "data_distribution.png"), p1, width = 12, height = 8)',
      '  }',
      '  ',
      '  # Correlation plot',
      '  if ("correlation_matrix" %in% names(results)) {',
      '    png(paste0(output_path, "correlation_matrix.png"), width = 800, height = 600)',
      '    corrplot(results$correlation_matrix, method = "color", type = "upper",',
      '             order = "hclust", tl.cex = 0.8, tl.col = "black")',
      '    dev.off()',
      '  }',
      '}',
    ];
  }

  /**
   * 生成 R 输出代码
   */
  private generateROutput(params: ExperimentCodeParams): string[] {
    return [
      'generate_report <- function(df, results) {',
      '  cat("\\n=== Generating Report ===\\n")',
      '  ',
      '  # Create R Markdown report',
      '  rmd_content <- paste0(',
      '    "---\\n",',
      '    "title: \\"", experiment_name, "\\"\\n",',
      '    "date: \\"", Sys.Date(), "\\"\\n",',
      '    "output: html_document\\n",',
      '    "---\\n\\n",',
      '    "## Summary\\n\\n",',
      '    "- Data Shape: ", nrow(df), " x ", ncol(df), "\\n",',
      '    "- Analysis Date: ", Sys.time(), "\\n\\n",',
      '    "## Results\\n\\n",',
      '    "Detailed analysis results would be inserted here.\\n"',
      '  )',
      '  ',
      '  writeLines(rmd_content, paste0(output_path, "report.Rmd"))',
      '  cat("R Markdown report saved to report.Rmd\\n")',
      '}',
    ];
  }

  /**
   * 生成其他语言模板（简化实现）
   */
  private generateMatlabTemplate(params: ExperimentCodeParams): CodeTemplate {
    return {
      imports: ['% MATLAB Experiment Framework'],
      setup: [
        `experimentName = '${params.experimentName}';`,
        `dataPath = '${params.dataPath || './data/'}';`,
      ],
      dataLoading: ['% Data loading code would be here'],
      processing: ['% Data processing code would be here'],
      analysis: ['% Analysis code would be here'],
      visualization: ['% Visualization code would be here'],
      output: ['% Output generation code would be here'],
    };
  }

  private generateJuliaTemplate(params: ExperimentCodeParams): CodeTemplate {
    return {
      imports: ['using DataFrames, CSV, Plots, Statistics'],
      setup: [
        `experiment_name = "${params.experimentName}"`,
        `data_path = "${params.dataPath || './data/'}"`,
      ],
      dataLoading: ['# Data loading code would be here'],
      processing: ['# Data processing code would be here'],
      analysis: ['# Analysis code would be here'],
      visualization: ['# Visualization code would be here'],
      output: ['# Output generation code would be here'],
    };
  }

  private generateJavaScriptTemplate(
    params: ExperimentCodeParams,
  ): CodeTemplate {
    return {
      imports: [
        '// JavaScript/Node.js Experiment Framework',
        'const fs = require("fs");',
        'const path = require("path");',
      ],
      setup: [
        `const experimentName = "${params.experimentName}";`,
        `const dataPath = "${params.dataPath || './data/'}";`,
      ],
      dataLoading: ['// Data loading code would be here'],
      processing: ['// Data processing code would be here'],
      analysis: ['// Analysis code would be here'],
      visualization: ['// Visualization code would be here'],
      output: ['// Output generation code would be here'],
    };
  }

  /**
   * 生成文件列表
   */
  private generateFiles(
    params: ExperimentCodeParams,
    template: CodeTemplate,
  ): ExperimentCodeResult['files'] {
    const files: ExperimentCodeResult['files'] = [];

    // 主实验文件
    const mainContent = this.generateMainFile(params, template);
    const extension = this.getFileExtension(params.language);

    files.push({
      filename: `${params.experimentName.toLowerCase().replace(/\s+/g, '_')}_experiment.${extension}`,
      content: mainContent,
      description: 'Main experiment script',
      type: 'main',
    });

    // 配置文件
    files.push({
      filename: 'config.json',
      content: JSON.stringify(
        {
          experimentName: params.experimentName,
          researchMethod: params.researchMethod,
          language: params.language,
          dataTypes: params.dataTypes,
          analysisTypes: params.analysisTypes,
          outputFormats: params.outputFormats,
          dataPath: params.dataPath || './data/',
          outputPath: './results/',
          createdAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      description: 'Experiment configuration file',
      type: 'config',
    });

    // 依赖文件
    if (params.language === ProgrammingLanguage.PYTHON) {
      files.push({
        filename: 'requirements.txt',
        content: this.getDependencies(params).join('\n'),
        description: 'Python dependencies',
        type: 'requirements',
      });
    }

    // README
    files.push({
      filename: 'README.md',
      content: this.generateReadme(params),
      description: 'Project documentation',
      type: 'documentation',
    });

    return files;
  }

  /**
   * 生成主文件内容
   */
  private generateMainFile(
    params: ExperimentCodeParams,
    template: CodeTemplate,
  ): string {
    const sections = [
      template.imports.join('\n'),
      '',
      template.setup.join('\n'),
      '',
      template.dataLoading.join('\n'),
      '',
      template.processing.join('\n'),
      '',
      template.analysis.join('\n'),
      '',
      template.visualization.join('\n'),
      '',
      template.output.join('\n'),
    ];

    if (template.testing) {
      sections.push('', template.testing.join('\n'));
    }

    // 添加主函数
    if (params.language === ProgrammingLanguage.PYTHON) {
      sections.push(
        '',
        'def main():',
        '    """Main experiment execution"""',
        '    print(f"Starting experiment: {experiment_name}")',
        '    ',
        '    # Load data',
        '    data = load_data()',
        '    ',
        '    # Preprocess data',
        '    processed_data = preprocess_data(data)',
        '    ',
        '    # Perform analysis',
        '    results = perform_analysis(processed_data)',
        '    ',
        '    # Create visualizations',
        '    create_visualizations(processed_data, results)',
        '    ',
        '    # Generate report',
        '    generate_report(processed_data, results)',
        '    ',
        params.includeTesting ? '    # Run tests' : '',
        params.includeTesting ? '    run_tests()' : '',
        '    ',
        '    print("Experiment completed successfully!")',
        '',
        'if __name__ == "__main__":',
        '    main()',
      );
    } else if (params.language === ProgrammingLanguage.R) {
      sections.push(
        '',
        '# Main execution',
        'main <- function() {',
        '  cat("Starting experiment:", experiment_name, "\\n")',
        '  ',
        '  # Load data',
        '  data <- load_data()',
        '  ',
        '  # Preprocess data',
        '  processed_data <- preprocess_data(data)',
        '  ',
        '  # Perform analysis',
        '  results <- perform_analysis(processed_data)',
        '  ',
        '  # Create visualizations',
        '  create_visualizations(processed_data, results)',
        '  ',
        '  # Generate report',
        '  generate_report(processed_data, results)',
        '  ',
        '  cat("Experiment completed successfully!\\n")',
        '}',
        '',
        '# Run the experiment',
        'main()',
      );
    }

    return sections.filter((section) => section !== undefined).join('\n');
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(language: ProgrammingLanguage): string {
    switch (language) {
      case ProgrammingLanguage.PYTHON:
        return 'py';
      case ProgrammingLanguage.R:
        return 'R';
      case ProgrammingLanguage.MATLAB:
        return 'm';
      case ProgrammingLanguage.JULIA:
        return 'jl';
      case ProgrammingLanguage.JAVASCRIPT:
      case ProgrammingLanguage.TYPESCRIPT:
        return 'js';
      default:
        return 'txt';
    }
  }

  /**
   * 获取依赖列表
   */
  private getDependencies(params: ExperimentCodeParams): string[] {
    const dependencies: string[] = [];

    if (params.language === ProgrammingLanguage.PYTHON) {
      dependencies.push(
        'pandas>=2.0.0',
        'numpy>=1.24.0',
        'matplotlib>=3.7.0',
        'seaborn>=0.12.0',
        'pathlib',
      );

      if (params.researchMethod === ResearchMethod.MACHINE_LEARNING) {
        dependencies.push('scikit-learn>=1.3.0', 'scipy>=1.10.0');
      }

      if (params.researchMethod === ResearchMethod.STATISTICAL_ANALYSIS) {
        dependencies.push('scipy>=1.10.0', 'statsmodels>=0.14.0');
      }

      if (params.includeVisualization) {
        dependencies.push('plotly>=5.15.0');
      }

      if (params.dataTypes.includes(DataFormat.EXCEL)) {
        dependencies.push('openpyxl>=3.1.0');
      }
    }

    return dependencies;
  }

  /**
   * 生成使用说明
   */
  private generateInstructions(params: ExperimentCodeParams): string[] {
    const instructions = [
      `Welcome to the ${params.experimentName} experiment!`,
      '',
      'Setup Instructions:',
      '1. Ensure you have the required dependencies installed',
      '2. Place your data files in the data/ directory',
      '3. Review and modify the configuration in config.json if needed',
      '4. Run the main experiment script',
      '',
      'File Structure:',
      `- Main script: ${params.experimentName.toLowerCase().replace(/\s+/g, '_')}_experiment.${this.getFileExtension(params.language)}`,
      '- Configuration: config.json',
      '- Dependencies: requirements.txt (Python) or package requirements',
      '- Documentation: README.md',
      '',
      'Expected Data Format:',
      `- Supported formats: ${params.dataTypes.join(', ')}`,
      `- Analysis types: ${params.analysisTypes.join(', ')}`,
      '',
      'Output:',
      `- Formats: ${params.outputFormats.join(', ')}`,
      '- Results will be saved in the results/ directory',
    ];

    if (params.language === ProgrammingLanguage.PYTHON) {
      instructions.push(
        '',
        'Python-specific instructions:',
        '1. Install dependencies: pip install -r requirements.txt',
        '2. Run: python experiment_script.py',
      );
    } else if (params.language === ProgrammingLanguage.R) {
      instructions.push(
        '',
        'R-specific instructions:',
        '1. Install required packages using install.packages()',
        '2. Run: source("experiment_script.R")',
      );
    }

    return instructions;
  }

  /**
   * 估算运行时间
   */
  private estimateRuntime(params: ExperimentCodeParams): string {
    let baseTime = 5; // 基础 5 分钟

    // 根据数据类型增加时间
    baseTime += params.dataTypes.length * 2;

    // 根据分析类型增加时间
    if (params.analysisTypes.includes(AnalysisType.MACHINE_LEARNING)) {
      baseTime += 15;
    }
    if (params.analysisTypes.includes(AnalysisType.INFERENTIAL)) {
      baseTime += 10;
    }

    // 根据研究方法增加时间
    if (params.researchMethod === ResearchMethod.MACHINE_LEARNING) {
      baseTime += 20;
    }

    return `Approximately ${baseTime}-${baseTime + 10} minutes`;
  }

  /**
   * 生成学习资源
   */
  private generateResources(
    params: ExperimentCodeParams,
  ): ExperimentCodeResult['resources'] {
    const resources: ExperimentCodeResult['resources'] = [];

    // 通用资源
    resources.push({
      name: 'Best Practices in Reproducible Research',
      url: 'https://www.nature.com/articles/s41597-022-01143-6',
      description: 'Guidelines for reproducible computational research',
    });

    // 语言特定资源
    if (params.language === ProgrammingLanguage.PYTHON) {
      resources.push(
        {
          name: 'Pandas Documentation',
          url: 'https://pandas.pydata.org/docs/',
          description: 'Comprehensive guide to data manipulation with pandas',
        },
        {
          name: 'Scikit-learn User Guide',
          url: 'https://scikit-learn.org/stable/user_guide.html',
          description: 'Machine learning in Python',
        },
      );
    } else if (params.language === ProgrammingLanguage.R) {
      resources.push(
        {
          name: 'R for Data Science',
          url: 'https://r4ds.had.co.nz/',
          description: 'Complete guide to data science with R',
        },
        {
          name: 'Tidyverse Documentation',
          url: 'https://www.tidyverse.org/',
          description: 'Collection of R packages for data science',
        },
      );
    }

    // 研究方法特定资源
    if (params.researchMethod === ResearchMethod.MACHINE_LEARNING) {
      resources.push({
        name: 'Elements of Statistical Learning',
        url: 'https://web.stanford.edu/~hastie/ElemStatLearn/',
        description: 'Comprehensive reference for statistical learning methods',
      });
    }

    return resources;
  }

  /**
   * 生成 README 文件
   */
  private generateReadme(params: ExperimentCodeParams): string {
    return `# ${params.experimentName}

${params.description || 'Automated experiment framework generated by Research CLI.'}

## Overview

This experiment uses **${params.language}** to perform **${params.researchMethod}** analysis.

### Analysis Types
${params.analysisTypes.map((type) => `- ${type}`).join('\n')}

### Data Formats
${params.dataTypes.map((type) => `- ${type}`).join('\n')}

### Output Formats  
${params.outputFormats.map((format) => `- ${format}`).join('\n')}

## Setup

### Prerequisites
${params.language === ProgrammingLanguage.PYTHON ? '- Python 3.8+' : ''}
${params.language === ProgrammingLanguage.R ? '- R 4.0+' : ''}

### Installation
${params.language === ProgrammingLanguage.PYTHON ? '```bash\npip install -r requirements.txt\n```' : ''}
${params.language === ProgrammingLanguage.R ? '```r\n# Install required packages as shown in the script\n```' : ''}

## Usage

1. Place your data files in the \`data/\` directory
2. Review configuration in \`config.json\`
3. Run the main experiment script
4. Check results in the \`results/\` directory

## Project Structure

\`\`\`
.
├── data/                   # Input data files
├── results/               # Output files and reports
├── config.json           # Experiment configuration
├── ${params.experimentName.toLowerCase().replace(/\s+/g, '_')}_experiment.${this.getFileExtension(params.language)}  # Main script
${params.language === ProgrammingLanguage.PYTHON ? '├── requirements.txt       # Python dependencies' : ''}
└── README.md             # This file
\`\`\`

## Features

${params.includeVisualization ? '- ✅ Data visualization' : '- ❌ Data visualization'}
${params.includeStatistics ? '- ✅ Statistical analysis' : '- ❌ Statistical analysis'}  
${params.includeTesting ? '- ✅ Unit testing' : '- ❌ Unit testing'}

## Generated by

Research CLI - Academic Research Workflow Tool
Generated on: ${new Date().toISOString()}
`;
  }
}
