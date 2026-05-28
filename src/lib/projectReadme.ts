// Generates the README.md placed at the root of a "full project" download.
// Plain, beginner-friendly, English (it sits next to the code).

export interface ReadmeOpts {
  projectName: string;
  /** Folder names included in the project (real example tasks + custom). */
  taskFolders: string[];
  /** Subset of taskFolders that require SageMath. */
  sageTasks: string[];
}

export function buildProjectReadme(o: ReadmeOpts): string {
  const tasks = o.taskFolders.length ? o.taskFolders : ["<task>"];
  const first = tasks[0];
  const taskList = tasks.map((t) => `- \`${t}/\``).join("\n");

  const sageNote = o.sageTasks.length
    ? `\n> Some tasks here use polynomials and also need **SageMath**, which the setup
> script cannot install on its own. Follow the conda hint the script prints.
> Tasks that need it: ${o.sageTasks.map((t) => `\`${t}\``).join(", ")}.\n`
    : "";

  return `# ${o.projectName}

This project was created with the **CALT Task Builder**. It trains a small
Transformer model to solve a task by learning from many worked examples.
You run it with a few copy-paste commands. No need to write any code yourself.

## 1. Install (just once)

Open a terminal in this folder and run the setup script for your system:

- **Linux, macOS, or WSL:** \`bash install.sh\`
- **Windows (PowerShell):** \`./install.ps1\`

This creates a local environment (\`.venv\`) and installs everything from
\`requirements.txt\`.
${sageNote}
## 2. Run a task

This project includes:

${taskList}

Each task runs in three steps. From the task's \`scripts\` folder:

\`\`\`bash
cd ${first}/experiments/toy/scripts
python generate.py    # 1. create the training examples
python train.py       # 2. train the model (add --dryrun for a quick test)
python evaluate.py    # 3. see how often it gets the answer right
\`\`\`

## What is inside

- \`<task>/core/\` : how the examples are made and how answers are scored.
- \`<task>/experiments/toy/configs/\` : settings (data size, model size, vocabulary).
- \`<task>/experiments/toy/scripts/\` : the generate / train / evaluate commands.
- \`shared/\` : helper code used by every task.

Learn more about CALT: https://github.com/HiroshiKERA/calt
`;
}
