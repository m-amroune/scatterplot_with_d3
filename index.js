// Chart dimensions
const margin = {
  top: 20,
  right: 30,
  bottom: 40,
  left: 40,
};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3
  .select("#scatterplot")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Data load
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then((data) => {
  data.forEach((d) => {
    d.Year = new Date(d.Year, 0, 1);
    d.Time = d3.timeParse("%M:%S")(d.Time);
  });

  // Scales
  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Year))
    .range([0, width]);

  const y = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Time))
    .range([height, 0]);

  // Axis
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)));

  svg
    .append("g")
    .attr("id", "y-axis")
    .call(
      d3
        .axisLeft(y)
        .ticks(d3.timeMinute.every(5))
        .tickFormat(d3.timeFormat("%M:%S"))
    );
});
