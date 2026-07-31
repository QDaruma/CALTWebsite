import { CALT_REQUIREMENT } from "./caltVersion";
// Generates the README.md placed at the root of a "full project" download.
// Plain, beginner-friendly, English (it sits next to the code).
//
// Installation is conda-based: a single `calt-env` environment that bundles
// SageMath (needed by the polynomial tasks) via conda-forge, with calt-x and the
// small pip extras installed on top. This mirrors the environment the tasks were
// tested in, so every task — including groebner_basis / border_basis — works.

export interface ReadmeOpts {
  projectName: string;
  /** Folder names included in the project (real example tasks + custom). */
  taskFolders: string[];
  /** Subset of taskFolders that require SageMath (informational only). */
  sageTasks: string[];
}

export function buildProjectReadme(o: ReadmeOpts): string {
  const tasks = o.taskFolders.length ? o.taskFolders : ["<task>"];
  const first = tasks[0];
  const taskList = tasks.map((t) => `- \`${t}/\``).join("\n");

  const sageNote = o.sageTasks.length
    ? `\n> Some tasks here compute their answers with **SageMath** (${o.sageTasks
        .map((t) => `\`${t}\``)
        .join(", ")}). The conda environment below already includes it, so there
> is nothing extra to install.\n`
    : "";

  return `# ${o.projectName}

This project was created with the **CALT Task Builder**. It trains a small
Transformer model to solve a task by learning from many worked examples.
You run it with a few copy-paste commands. No need to write any code yourself.

## 1. Install (just once)

Installation uses **conda** (Miniforge or Anaconda). This is the setup the tasks
were tested with: one environment, called \`calt-env\`, that contains SageMath,
PyTorch and the CALT engine together, so every task works, including the
polynomial ones.

> Don't have conda yet? Install **Miniforge** first:
> https://github.com/conda-forge/miniforge

Open a terminal in this folder and run, one line at a time:

\`\`\`bash
# 1. Create an environment with SageMath (this is the big download, ~once)
conda create -n calt-env -c conda-forge sage python=3.12 -y

# 2. Activate it
conda activate calt-env

# 3. Install the CALT engine and helpers
pip install ${CALT_REQUIREMENT} matplotlib click
\`\`\`

> **Note**: \`calt-x\` 1.3.0 includes the offline pre-tokenization the tasks rely on.

Check it worked:

\`\`\`bash
python -c "import calt, sage.all; print('CALT + SageMath OK')"
\`\`\`
${sageNote}
> **Every time** you open a new terminal to use this project, first run:
> \`conda activate calt-env\`

## 2. Run a task

This project includes:

${taskList}

Each task runs in three steps. From the task's \`scripts\` folder:

\`\`\`bash
conda activate calt-env
cd ${first}/experiments/toy/scripts
python generate.py    # 1. create the training examples
python train.py       # 2. train the model (add --dryrun for a quick test)
python evaluate.py    # 3. see how often it gets the answer right
\`\`\`

Start with \`python train.py --dryrun\`: it trains for just a moment so you can
confirm the whole pipeline works end to end before launching a real run.

## What is inside

- \`<task>/core/\` : how the examples are made and how answers are scored.
- \`<task>/experiments/toy/configs/\` : settings (data size, model size, vocabulary).
- \`<task>/experiments/toy/scripts/\` : the generate / train / evaluate commands.
- \`shared/\` : helper code used by every task.

Learn more about CALT: https://github.com/HiroshiKERA/calt
`;
}
