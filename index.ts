import xlsx from 'node-xlsx';

interface Task {
  anchor: string;
  phase: "Analysis" | "Design" | "Development" | "Test Planning" | "Test Execution";
  name: string;
  country: "BJ" | "ID" | "SE" | "KR" | "CZ";
  personMonth: number;
  time: number; // days(ceil int)
}

if (process.argv.length <= 3) {
  throw new Error("Invalid command. Use: bun start <file> <sheet>")
}

const sheets = xlsx.parse(process.argv[2]);
const data = sheets.find(sheet => sheet.name === process.argv[3])!.data

const tasks: Task[] = [];

let phase: Task["phase"] = "Analysis";

for (let i = 0 + 3; i < 30 + 3; i++) {
  for (let j = 0 + 2; j < 19 + 2; j++) {

    if (data[1][j]) phase = data[1][j];

    const count = data[i][j];
    const peopleCount = data[34][j];

    if (count) {
      tasks.push({
        anchor: data[i][0],
        phase,
        name: data[i][1],
        country: data[2][j],
        personMonth: count,
        time: peopleCount ? Math.ceil(count / peopleCount * 31) : -1
      })
    }
  }
}

function createSection(phase: Task["phase"], options: {
  /* 开始日期 */
  startDate?: string,
  /* 紧接的上一个任务，不指定开始日期的时候用 */
  continueTask?: string
}) {
  const progress = new Map<Task["country"], string>();
  let section = ""
  const tmp = tasks.filter(task => task.phase === phase);

  // 为了优化图像，如果前面的任务和当前任务是同一个国家的，那么合并任务
  const merged = tmp.reduce((arr, task) => {
    if (task.country === arr[arr.length - 1]?.country) {
      const t = arr[arr.length - 1];
      t.anchor += `_${task.anchor}`
      t.name += `, ${task.name}`
      t.time += task.time
    } else {
      arr.push(task);
    }
    return arr;
  }, [] as Task[]);

  let currentTaskId: string | undefined = options.continueTask;

  merged.forEach(task => {
    const previousWork = progress.get(task.country);
    const taskId = (task.phase + "_" + task.anchor.split(".").join("")).split(" ").join("");

    if (previousWork) {
      section += `
        [${task.country}]${task.name} :${taskId}, after ${previousWork}, ${task.time}d`;
    } else if (options.continueTask) {
      section += `
        [${task.country}]${task.name} :${taskId}, after ${options.continueTask}, ${task.time}d`;
    } else {
      section += `
        [${task.country}]${task.name} :${taskId}, ${options.startDate}, ${task.time}d`;
    }
    progress.set(task.country, taskId);
    currentTaskId = taskId;
  })

  return [section, currentTaskId];
}

// 指定一个开始时间
const [analysisSection, lastAnalysisTask] = createSection("Analysis", { startDate: "2024-04-16" });

// 紧接着 Analysis 执行
const [designSection, lastDesignTask] = createSection("Design", { continueTask: lastAnalysisTask });

// 紧接着 Design 执行
const [developmentSection, lastDevelopmentTask] = createSection("Development", { continueTask: lastDesignTask });

// 紧接着 Design 执行，即和 Development 并行
const [testPlanningSection] = createSection("Test Planning", { continueTask: lastDesignTask });

// 在 Development 后执行，因为设计上 Development 的周期比 Test Planning 长
const [testExecutionSection] = createSection("Test Execution", { continueTask: lastDevelopmentTask });

const gantt = `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    tickInterval 1month
    axisFormat %Y-%m
    excludes weekends

    section Analysis ${analysisSection}
    section Design ${designSection}
    section Development ${developmentSection}
    section Test Planning ${testPlanningSection}
    section Test Execution ${testExecutionSection}
`;

console.log(gantt);
