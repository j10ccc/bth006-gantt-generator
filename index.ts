import xlsx from 'node-xlsx';

interface Task {
  anchor: string;
  phase: "Analysis" | "Design" | "Development" | "Test Planning" | "Test Execution";
  name: string;
  country: "BJ" | "ID" | "SE" | "KR" | "CZ";
  personMonth: number;
  time: number; // days(ceil int)
}

const sheets = xlsx.parse(process.argv[2]);

const data = sheets.find(sheet => sheet.name === "修订版3.0")!.data

const tasks: Task[] = [];

let phase: Task["phase"] = "Analysis";

for (let i = 0 + 3; i < 30 + 3; i++) {
  for (let j = 0 + 2; j < 19 + 2; j++) {

    if (data[1][j]) phase = data[1][j];

    const count = data[i][j];
    const peopleCount = data[42][j];

    if (count) {
      tasks.push({
        anchor: data[i][0],
        phase,
        name: data[i][1],
        country: data[2][j],
        personMonth: count,
        time: peopleCount ? Math.ceil(count / data[42][j] * 31) : -1
      })
    }
  }
}

const phases: Task["phase"][] = ["Analysis", "Design", "Development", "Test Planning", "Test Execution"];

const sections = phases.map(phase => {
  const progress = new Map<Task["country"], string>();
  const startDate = "2024-01-01";
  let section = ""
  const tmp = tasks.filter(task => task.phase === phase);

  tmp.forEach(task => {
    const previousWork = progress.get(task.country);
    const taskId = (task.phase + "_" + task.anchor.split(".").join("")).split(" ").join("");

    if (previousWork) {
      section += `
        [${task.country}]${task.name} :${taskId}, after ${previousWork}, ${task.time}d`;
    } else {
      section += `
        [${task.country}]${task.name} :${taskId}, ${startDate}, ${task.time}d`;
    }
    progress.set(task.country, taskId);
  })

  return section;
})

const gantt = `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    excludes weekends
    section Analysis ${sections[0]}
    section Design ${sections[1]}
    section Development ${sections[2]}
    section Test Planning ${sections[3]}
    section Test Execution ${sections[4]}
`;

console.log(gantt);
