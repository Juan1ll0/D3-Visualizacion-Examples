// Definición de constantes
const width = 800;
const height = 500;

const margin = {
  top: 10,
  right: 10,
  bottom: 80,
  left: 60,
};

// Gráfico
// Creación del contenedor SVG y grupos: Elementos, Ejes, EjeX, EjeY y Leyenda
const svg = d3
  .select("div#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
const elementGroup = svg.append("g");
const axisGroup = svg.append("g");
const legendGroup = svg.append("g");
const xAxisGroup = axisGroup
  .append("g")
  .attr("id", "xAxisGroup")
  .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`);
const yAxisGroup = axisGroup
  .append("g")
  .attr("id", "yAxisGroup")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
const highestGroupLegend = legendGroup.append("g");
const teamGroupLegend = legendGroup.append("g");

// Creación de las escalas
const x = d3.scaleLinear().range([0, width - margin.right - margin.left]);
const y = d3
  .scaleBand()
  .range([height - margin.top - margin.bottom, 0])
  .padding(0.2);

// Ejes
const xAxis = d3
  .axisBottom()
  .scale(x)
  .tickSize(-height + margin.top + margin.bottom);
const yAxis = d3.axisLeft().scale(y);

// Carga de datos
d3.csv("data.csv").then((data) => {
  // Precalculos
  firstYear = +d3.min(data.map((d) => d.year));
  lastYear = +d3.max(data.map((d) => d.year));
  years = range(firstYear, lastYear, 4);

  // Pintar primera vez completa
  paintChart(getWinnersUntilYear(data, lastYear));

  // Pintar la leyenda
  paintLegendComponent(
    highestGroupLegend,
    "highest",
    "Equipo con más títulos",
    width - margin.right - 200,
    height - margin.bottom + 40
  );

  paintLegendComponent(
    teamGroupLegend,
    "band",
    "Equipo con títulos",
    width - margin.right - 200,
    height - margin.bottom + 60
  );

  // Slider
  slider(data, years);
});

// Helper Functions
// Funcion para generar el rango de años
const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

// Funcion para transformar los datos a un formato mas adecuado para pintar la gráfica
const getWinnersUntilYear = (data = [], year) =>
  data
    // Filtra años vacios y años superiores al dado
    .filter((element) => element.winner && element.year <= year)
    .reduce((acc, obj) => {
      index = acc.findIndex((o) => o.country == obj.winner);
      return index > -1
        ? [
            ...acc.slice(0, index),
            { country: acc[index].country, titles: acc[index].titles + 1 },
            ...acc.slice(index + 1),
          ]
        : [...acc, { country: obj.winner, titles: 1 }];
    }, []);

// Pinta la gráfica
const paintChart = (data) => {
  // Precalculos
  maxTitles = d3.max(data.map((d) => d.titles));

  // Definición de los dominios
  x.domain([0, maxTitles]);
  y.domain(data.map((d) => d.country));

  // Dibujas los ejes
  xAxis.ticks(maxTitles);
  xAxisGroup.transition().duration(500).call(xAxis);
  yAxisGroup.transition().duration(500).call(yAxis);

  // Data binding
  elementGroup
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("class", (d) => (d.titles == maxTitles ? "highest" : "band"))
    .attr("x", margin.left)
    .attr("y", (d, i) => y(d.country) + margin.top)
    .style("stroke-width", 15)
    .attr("height", y.bandwidth())
    .transition()
    .duration(500)
    .attr("width", (d) => x(d.titles));
};

// Pinta un component de la leyenda
const paintLegendComponent = (
  group,
  className,
  legendText,
  xPosition,
  yPosition
) => {
  group
    .append("circle")
    .attr("class", className)
    .attr("cx", xPosition)
    .attr("cy", yPosition)
    .attr("r", 6);

  group
    .append("text")
    .attr("x", xPosition + 20)
    .attr("y", yPosition)
    .text(legendText)
    .attr("alignment-baseline", "middle");
};

// Slider al que le paso un array de años
const slider = (data, years) => {
  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(years)) // rango años
    .max(d3.max(years))
    .step(4) // cada cuánto aumenta el slider
    .width(580) // ancho de nuestro slider
    .ticks(years.length)
    .default(years[years.length - 1]) // punto inicio de la marca
    .on("onchange", (selectedyear) => {
      paintChart(getWinnersUntilYear(data, selectedyear));
    });

  var gTime = d3
    .select("div#slider-time") // div donde lo insertamos
    .append("svg")
    .attr("width", width * 0.8)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  gTime.call(sliderTime);

  d3.select("p#value-time").text(sliderTime.value());
};
