const margin = { top: 60, right: 40, bottom: 40, left: 60 },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

//  SVG container for the scatterplot
const svg = d3
  .select("#scatterplot") 
  .attr("width", width + margin.left + margin.right) 
  .attr("height", height + margin.top + margin.bottom) 
  .append("g") 
  .attr("transform", `translate(${margin.left},${margin.top})`); 

// tooltip element 
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip") 
  .style("opacity", 0); 
  
// Fetch and process the cyclist data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then((data) => {
  // Parse the data: convert 'Year' to a Date object and 'Time' to seconds
  data.forEach((d) => {
    d.Year = new Date(d.Year, 0); 
    const parsedTime = d3.timeParse("%M:%S")(d.Time); 
    d.TimeInSeconds = parsedTime.getMinutes() * 60 + parsedTime.getSeconds(); 
  });

  // Set up the x-scale (time scale for Year)
  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Year)) 
    .range([0, width]); 

  // Set up the y-scale (linear scale for TimeInSeconds, reversed for top-to-bottom orientation)
  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.TimeInSeconds).reverse()) // Reverse the domain for the y-axis
    .range([height, 0]); 

  // Append the x-axis to the SVG
  svg
    .append("g")
    .attr("id", "x-axis") 
    .attr("transform", `translate(0, ${height})`) 
    .call(d3.axisBottom(x).ticks(d3.timeYear.every(1))); 

  // Append the y-axis to the SVG
  svg
    .append("g")
    .attr("id", "y-axis") // Set an ID for the y-axis
    .call(
      d3.axisLeft(y).tickFormat((d) => {
        const minutes = Math.floor(d / 60); // Convert seconds to minutes
        const seconds = d % 60; // Get the remaining seconds
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`; // Format the time as minutes:seconds
      })
    );

  // Append the dots to the chart
  svg
    .selectAll(".dot")
    .data(data) 
    .enter() 
    .append("circle") 
    .attr("class", "dot") 
    .attr("cx", (d) => x(d.Year)) 
    .attr("cy", (d) => y(d.TimeInSeconds)) 
    .attr("r", 6) 
    .attr("data-xvalue", (d) => d.Year.toISOString()) 
    .attr("data-yvalue", (d) =>
      new Date(
        1970,
        0,
        1,
        0,
        Math.floor(d.TimeInSeconds / 60),
        d.TimeInSeconds % 60
      ).toISOString() 
    )
    .style("fill", (d) => (d.Doping ? "red" : "blue")) // Set the fill color based on doping status
    .on("mouseover", (event, d) => { 
      tooltip.transition().duration(200).style("opacity", 0.9); 
      tooltip
        .html(
          `${d.Name} (${d.Nationality})<br>
              Year: ${d.Year.getFullYear()}, Time: ${d.Time}<br>
              ${d.Doping ? d.Doping : "No Doping Allegation"}`
        ) 
        .style("left", event.pageX + 10 + "px") 
        .style("top", event.pageY - 28 + "px")
        .attr("data-year", d.Year.toISOString());
    })
    .on("mouseout", () => { 
      tooltip.transition().duration(500).style("opacity", 0);
    });
});
