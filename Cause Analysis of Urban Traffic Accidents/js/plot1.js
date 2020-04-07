
var svg = d3.select("svg"),
    margin = {top: 50, right: 50, bottom: 300, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y/%m/%d");

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0])
    .domain([0,850]);

var brushy = d3.scaleLinear()
    .rangeRound([height-margin.bottom-margin.top-20,0]);

var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

var brushline=d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return brushy(d.value); });

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

console.log(yAxis)
var xbrushAxis = d3.axisTop(x);
var ybrushAxis = d3.axisLeft(brushy);

g.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

let zoom = d3.zoom()
    .scaleExtent([1.11, 100])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoomed);

let zoomRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .call(zoom);

let xGrooup = g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

let yGrooup = g.append("g")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Number of accidents");

let brush = d3.brushX()
    .extent([[0, 0], [width, 80]])
    .on("brush end", brushed);

let brushBox = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + (height + margin.top * 2) + ")")
    .attr("class", "brushBox");


d3.csv("time.csv", function(d) {
    d.date = parseTime(d.date);
    d.value = +d.value;
    return d;
}, function(error, data) {
    if (error) throw error;


    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    y.domain(d3.extent(data, function (d) {
        return d.value;
    }));
    brushy.domain(d3.extent(data, function (d) {
        return d.value;
    }));

    let updateLine = g.append("g")
        .attr("class", "chart")
        .datum(data);

    let path = updateLine.append("path")
        .attr("clip-path", "url(#clip)")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 0.5)
        .attr("d", line);


    brushBox.append("path")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 0.2)
        .attr("d", brushline(data));

    brushBox.append("g")
        .attr("class", "brush")
        .attr("fill", 'red')
        .call(brush)
        .call(brush.move, x.range())
        .selectAll("rect")
        .attr("width", width)
        .attr("height", 80);

    brushBox.append("g")
        .attr("transform", "translate(0,0)")
        .call(xbrushAxis);

    brushBox.append("g")
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end");


});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") {
        return;
    }
    var s = d3.event.selection || x.range();

    zoomRect.call(zoom.transform, d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0));

}

function zoomed() {

    let t = d3.event.transform.rescaleX(x);

    xGrooup.call(xAxis.scale(t));

    g.select("path.line")
        .attr("d", line.x(function (d) {
            return t(d.date)
        }));

    brushBox.select(".brush")
        .call(brush.move, x.range().map(d3.event.transform.invertX, d3.event.transform))
}
