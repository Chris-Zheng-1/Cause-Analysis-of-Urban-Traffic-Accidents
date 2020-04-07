

var margin = {top: 0, right: 40, bottom: 40, left: 250},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    colors = d3.scaleLinear().range(["white","orange"]).domain([-1,1]),
    clabel= ['Road_Type','Speed_limit','Light_Conditions','Weather_Conditions','Road_Surface_Conditions','Age_of_Driver','Sex_of_Driver','Age_of_Vehicle'];


var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var x = d3.scaleBand()
    .range([0,width])
    .domain(clabel)
    .padding(0.1);
svg.append("g")
    .attr("transform","translate(0,"+height+")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("dy", ".75em")
    .attr('transform', 'rotate(-8)');



var y = d3.scaleBand()
    .range([height,0])
    .domain(clabel)
    .padding(0.1);

svg.append("g")
    .call(d3.axisLeft(y));

/* 读取数据 */
d3.csv("heatmap_corr.csv", function(err,data) {
    if(err){console.log("error")};
    console.log(data);

    // create a tooltip
    var tooltip = d3.select("#tooltip_1")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    var mouseover = function(d) {
        tooltip.style("opacity", 1)
    }
    var mousemove = function(d) {
        tooltip
            .html("The correlation value of "+d.condition1+" and "+d.condition2+" is: " + d.value)
            .style("left", (d3.mouse(this)[0]+70) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
        tooltip.style("opacity", 0)
    }

    // add the squares
    svg.selectAll()
        .data(data, function(d) {return d.condition1+':'+d.condition2;})
        .enter()
        .append("rect","title")
        .attr("x", function(d) { return x(d.condition1) })
        .attr("y", function(d) { return y(d.condition2) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return colors(d.value)} )
        .text(function (d) { return d.value })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
})
