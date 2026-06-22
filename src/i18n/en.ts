export const en = {
  nav: {
    brand: "CALT",
    tagline: "A Library for Computer Algebra with Transformer",
    startOver: "Start over",
    confirmReset: "Start over and clear all your current choices?",
    github: "GitHub",
    toggleTheme: "Toggle light / dark",
    language: "Language",
  },
  welcome: {
    title: "Build a CALT project,",
    titleHighlight: "ready to train",
    subtitle:
      "Pick ready-made tasks, adjust a few settings, and download a complete project that's ready to train on your own machine with a few copy-paste commands.",
    nameLabel: "Name your project",
    namePlaceholder: "e.g. My CALT project",
    getStarted: "Get started",
    nameHelpEmpty:
      "This only sets the name of the downloaded project folder. You can rename it anytime.",
    namedAs: (snake: string) => `Your project folder will be named “${snake}”.`,
    howTitle: "How it works",
    how: [
      {
        title: "Pick tasks",
        body: "Choose from ready-made CALT example tasks, or build your own from scratch.",
      },
      {
        title: "Add your own (optional)",
        body: "Describe your idea and write it, or let an AI write the code for you.",
      },
      {
        title: "Download",
        body: "Get the full project, or just the tasks, as a ready-to-run ZIP.",
      },
    ],
    trustBrowser: "Runs in your browser, nothing uploaded",
    trustSetup: "No technical setup to use the builder",
    trustOpen: "Built on the open-source CALT library",
  },
  tasks: {
    eyebrow: "Step 1",
    title: "Define your task",
    subtitle:
      "Define your own task, add ready-made example tasks, or both. Each example is complete and ready to run.",
    chooseReal: "Add example tasks",
    sageNote:
      "Some tasks need SageMath, a free math toolkit. It comes bundled in the conda setup, so there's nothing extra to install.",
    selectAll: "Select all",
    clearAll: "Clear all",
    needsSage: "needs SageMath",
    buildOwnEyebrow: "Custom",
    buildOwnTitle: "Build your own task",
    buildOwnDesc: "Write your own data recipe, or have an AI write it for you.",
    includeCustom: "Include in project",
    included: (n: number) => `${n} in your project`,
    continueLabel: "Continue",
    startFrom: "Start from a template",
    customNameLabel: "Task name",
    customNamePlaceholder: "e.g. Add two numbers",
    measurements: "What to measure (optional)",
    measurementsHint: "Statistics computed about your custom task's data.",
    tokenizer: "Tokenizer / vocabulary (optional)",
    optionsLabel: "Options",
    tabGenerator: "Generator",
    tabTokenizer: "Tokenizer",
    tabMeasure: "Measurements",
    sectionTabs: "Custom task sections",
    items: {
      parity: {
        name: "Permutation parity",
        summary: "Decide whether a shuffled list needs an even or odd number of swaps to sort.",
      },
      groebner_basis: {
        name: "Gröbner basis",
        summary: "Compute the Gröbner basis of a pair of polynomials.",
      },
      border_basis: {
        name: "Border basis",
        summary: "Compute the border basis of a zero-dimensional polynomial ideal.",
      },
      integer_factorization: {
        name: "Prime factor listing",
        summary: "List the prime factors of a given integer.",
      },
      gf17_addition: {
        name: "Modular running sums",
        summary: "Add up a list of numbers step by step, wrapping around at 17 (finite-field arithmetic).",
      },
      eigvec_3x3: {
        name: "Dominant eigenvector",
        summary: "Find the main direction (top eigenvector) of a 3×3 symmetric matrix, on real-valued data.",
      },
      polynomial_addition: {
        name: "Polynomial addition",
        summary: "Add a sequence of polynomials step by step (cumulative sums).",
      },
    } as Record<string, { name: string; summary: string }>,
  },
  data: {
    recipeNote: "Keep a class with __call__(self, seed) that returns a (problem, answer) pair of text.",
    editsGenerator: "This becomes core/generator.py in the task folder. Edit it there later for local tweaks.",
    editsMetrics: "These lines go into core/metrics.py (the instance_stats function).",
    editsLexer: "This becomes experiments/toy/configs/lexer.yaml. Edit it there later if your generator changes.",
    tabWrite: "Write code",
    tabAi: "Ask an AI to write it",
    aiIntro:
      "Don't want to write code? Describe your idea, copy the prompt, and paste it into any AI assistant (ChatGPT, Claude, Gemini). Then paste its reply into the “Write code” tab.",
    aiDescLabel: "Describe your task: input, output, and assumptions",
    aiDescPlaceholder:
      "Input: two integers, each from 1 to 100, separated by a space. Output: their greatest common divisor. Example: \"48 36\" → \"12\".",
    aiDescHint:
      "Be specific about the input (and its ranges, e.g. how big the numbers can be) and the exact output. The model can only learn what your examples show, and these assumptions also become tunable settings in data.yaml.",
    aiPromptLabel: "Your ready-to-send prompt",
    copyPrompt: "Copy prompt",
    copied: "Copied!",
    downloadTxt: "Download .txt",
    aiPasteHint: "When the AI replies, paste its code into the “Write code” tab.",
  },
  insights: {
    measureTitle: "Add your own measurement",
    measureDescLabel: "Describe what you want to measure",
    measureDescPlaceholder: "e.g. how many prime numbers appear in the answer",
    measureCodeNote:
      'Add one line per measurement, like stats["my_measure"] = len(str(answer).split()). You can use re, math, and _ints(text), which lists the numbers in a string.',
  },
  review: {
    eyebrow: "Step 3",
    title: "Download your project",
    subtitle: "Take a look inside, then save your project.",
    empty: "No tasks selected yet. Go back and add at least one.",
    download: "Download",
    saved: "Saved. See “How to use it” below.",
    settings: "Custom task settings",
    optional: "optional",
    examplesQ: "Training sample size",
    examplesInfoTitle: "Number of examples",
    examplesInfo:
      "More examples usually help the model learn better, but take longer to prepare and train. “Balanced” is a good default; use “Quick” to test the pipeline faster, or “Thorough” for the best results.",
    sizeQuick: "Quick",
    sizeBalanced: "Balanced",
    sizeThorough: "Intense",
    brainQ: "Model size",
    brainInfoTitle: "Model size",
    brainInfo:
      "A bigger model can learn harder patterns but trains more slowly. Start small; you can always rebuild a bigger one.",
    brainSmall: "Small",
    brainMedium: "Medium",
    brainLarge: "Large",
    brainNoteSmall: "Fast to train. Great for a first try and simpler patterns.",
    brainNoteMedium: "A balanced choice that works well for most patterns.",
    brainNoteLarge: "Most capable, but slower. Best run on a powerful computer.",
    posEmb: "Position embedding",
    posEmbInfoTitle: "Position embedding",
    posEmbInfo:
      "How the model knows the order of the tokens (which symbol is 1st, 2nd, and so on). “Learned” is the default and works well for most tasks; the rest are alternative methods.",
    posEmbLearned: "Learned",
    posEmbSinusoidal: "Sinusoidal",
    posEmbRope: "RoPE",
    posEmbNone: "None",
    posEmbNoteGeneric:
      "The model learns the positions by itself during training. A solid default that fits most tasks.",
    posEmbNoteSinusoidal:
      "Fixed wave patterns (the original Transformer recipe). Can help with inputs longer than those seen in training.",
    posEmbNoteRope:
      "Rotary positions. Often the best at handling inputs longer than those seen in training.",
    posEmbNoteNone:
      "No position information at all. Only pick this if the order of the tokens does not matter for your task.",
    rounds: "Training rounds",
    roundsInfoTitle: "Training rounds",
    roundsInfo:
      "How many times the model reviews all the examples while learning. More rounds can improve accuracy up to a point.",
    logging: "Progress logging",
    loggingInfoTitle: "Weights & Biases",
    loggingInfo:
      "An optional online dashboard for tracking training (Weights & Biases). If you turn it on, it's added to your install. You'll just need a free account and to run “wandb login” once. Leave it off otherwise.",
    on: "On",
    off: "Off",
    treeTitle: "What's inside",
    treeBody: "The files in your download. Edit any of them later for local tweaks.",
    treeNotes: {
      core: "the task logic (generator, metrics)",
      configs: "customized at Step 2",
      scripts: "run these: generate, train, evaluate",
      shared: "utilities shared by every task",
    } as Record<string, string>,
    howToUse: "How to use it",
    prereq: "You'll need conda and a terminal. Just copy-paste the commands below.",
    howUnzipProject: (proj: string) => `Unzip ${proj}.zip (a complete CALT project).`,
    howInstall: "Install everything once with conda (full details in README.md).",
    howRun: "Then open a terminal and, for each task, run:",
    setupLabel: "One-time setup commands",
    sTasks: "Tasks",
    back: "Back",
  },
  lexer: {
    intro:
      "Set the tokenizer to match the data your generator produces. Every symbol that can appear in the input or output must be listed here, or it becomes an unknown token.",
    symbols: "Symbols in your data",
    symbolsHint: "Space-separated. Include every operator/letter that appears, e.g. + - * ^ | x y",
    numMin: "Smallest number",
    numMax: "Largest number",
    digitGroup: "How numbers become tokens",
    digitGroupHint:
      "Whole = one token per number. 1 / 2 / 3 = split numbers into digit groups, so large numbers reuse a tiny vocabulary.",
    whole: "Whole",
    attachSign: "Attach sign to numbers",
    allowFloat: "Allow decimals (e.g. 0.71)",
    symbolsInfo:
      "List every operator or letter that can appear in your problems or answers. Numbers are set separately below. Anything you forget becomes an “unknown” token the model can't read.",
    numMinInfo:
      "The smallest (most negative) whole number your data can contain. Set it to cover every value your generator can produce.",
    numMaxInfo:
      "The largest whole number your data can contain. Together with the smallest, this sets the range of number tokens the model knows.",
    digitGroupInfo:
      "“Whole” gives each number its own token: simple, but it needs a large vocabulary. Splitting into 1, 2 or 3-digit groups lets big numbers reuse a tiny vocabulary, at the cost of longer sequences.",
    attachSignInfo:
      "On: a leading minus is part of the number, so “-5” is a single token (for signed values). Off: “-” is treated as a separate symbol, like a subtraction sign.",
    allowFloatInfo:
      "Turn on if your numbers can have a decimal point (e.g. 0.71). Leave it off if your data only uses whole numbers.",
  },

  settings: {
    eyebrow: "Step 2",
    title: "Settings",
    subtitle: "Fine-tune each task's training settings. The defaults already work well.",
    appliesNote:
      "These are saved into each task's config when you download. To change them later, edit the files in experiments/toy/configs/ inside the task folder: data.yaml for the number of examples, train.yaml for the model size, training rounds, position embedding and logging, and lexer.yaml for the tokenizer vocabulary.",
    noTasks: "No tasks selected yet. Go back and pick at least one.",
    continueLabel: "Continue",
    previewLegend: "This is what your settings write into the task's config files. Highlighted lines are the ones the controls edit; a line flashes when it changes.",
    previewLexer: "Tokenizer vocabulary",
    previewFiles: "Config file",
  },
  details: {
    label: "Details",
    learnMore: "Learn more in the CALT docs",
    docsUrl: "https://hiroshikera.github.io/calt/",
    tasks:
      "A CALT task frames a math problem as a translation: an input string (the problem) maps to an output string (the answer). You define one instance generator that returns (problem, answer) pairs from a seed; the example cards are ready-made generators you can add as they are.",
    settings:
      "These controls set the dataset size, the Transformer model size, how many training rounds run, and how token positions are encoded. Each one is written into the task's data.yaml / train.yaml, shown live on the right.",
    finish:
      "Your download is a complete, runnable CALT project: one folder per task (generator, configs, scripts), shared utilities, a pinned pyproject.toml and a README. The workflow is generate → train → evaluate.",
  },
  rail: { tasks: "Tasks", settings: "Settings", finish: "Finish" },
  railSub: { tasks: "Define instance generator", settings: "Data, model & training", finish: "Download" },
  mobileStep: (n: number, total: number) => `Step ${n} of ${total}`,
  a11y: {
    decrease: "Decrease",
    increase: "Increase",
    remove: "Remove",
    whatsThis: "What's this?",
    settingsTabs: "Settings for each task",
  },
  stats: {
    input_length: { label: "Problem length", desc: "How many pieces each problem is made of." },
    output_length: { label: "Answer length", desc: "How many pieces each answer is made of." },
    input_chars: { label: "Problem size", desc: "How many characters long each problem is." },
    output_chars: { label: "Answer size", desc: "How many characters long each answer is." },
    max_abs_value: { label: "Biggest number", desc: "The largest number that appears in each problem." },
    num_elements: { label: "Number of parts", desc: "How many parts the problem is split into (by the “|” symbol)." },
  } as Record<string, { label: string; desc: string }>,
};

export type Dict = typeof en;
