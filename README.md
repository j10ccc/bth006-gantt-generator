# bth007 Gantt chart generator

For bth007, create a gantt chart following the task assignment
of your team.

The gantt chart will be printed as a text 
of [mermaid](https://mermaid.js.org). You can copy them
to [Live Editor](https://mermaid.live/edit) to preview.

## Requirements

- The xlsx file which is the teacher provided(the table shape must be consistent).
- You should modified the xlsx with your own task assignment.
- You should insert a line to declare the amount of people in line 35 in the xlsx.

> [!NOTE]
> There some rules in the gantt creation
> 
> - Tasks are ordered by their indexes declared in `ID` column of the xlsx.
> - For more compact layout, tasks that are adjacent and executed by the same country will be displayed as merged.

## Get Started

To install dependencies:

```bash
bun install
```

To run:

```bash
# Copy the output of mermaid text to a file
bun start <xlsx_file_path> <sheet_name> > <output_file> 

# Run the example
bun start ./example/data.xlsx Estimated > ./output/mermaid-text
```

Also, there are some config you can update easily in
the variable `gantt`.

```ts
const gantt = `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    tickInterval 1month
    axisFormat %Y-%m
    excludes weekends

    ...
`
```

- Exclude weekend(turn on default)
- Tick Interval(1 month default)
- etc.

## Examples

![xlsx-screenshot](/images/xlsx-example.png)

![gantt-screenshot](/images/gantt-example.png)

