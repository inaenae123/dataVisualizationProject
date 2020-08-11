
var width = 800;
var height = 800;

d3.csv("colleges.csv", function(csv) {

    var maxPop = 0;
    var minPop = 10000;

    // Takes the data from csv and changes the strings to numbers
    for (var i = 0; i < csv.length; ++i) {
        if (maxPop < csv[i].UndergradPopulation) {
            maxPop = csv[i].UndergradPopulation;
        }
        if (minPop > csv[i].UndergradPopulation) {
            minPop = csv[i].UndergradPopulation;
        }
        csv[i].UndergradPopulation = Number(csv[i].UndergradPopulation);
        csv[i].AdmissionRate = Number(csv[i].AdmissionRate);
        csv[i].SAT = +csv[i].SAT;
        csv[i].CompletionRate = +csv[i].CompletionRate * 100;

    }

    var chart1 = d3.select("svg")
	                .attr("width",width)
                    .attr("height",height);

    // Sets domain and range values for the circles
    var size = d3.scaleLinear()
                .domain([minPop - 5, maxPop + 5])
                .range([5,35]);

    // Sets color of the circles
    var keys = ["Low", "Medium", "High"];
    var color = d3.scaleOrdinal()
                .domain(keys)
                .range(["#87CEFA","#4169E1","#4B0082"]);

    // SAT filter
    var keys2 = ["Smart", "Average", "Mediocre"];
    var SATscale = d3.scaleOrdinal()
                .domain(keys2)
                .range([650,325,0]);

    // Completion Rate filter
    var keys3 = ["Low", "Medium", "High"];
    var completionScale = d3.scaleOrdinal()
                .domain(keys3)
                .range([600,900,1200]);

    // Creates the legend for chart1
    var keySize = 20;
    chart1.selectAll("legend")
        .data(keys)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("y", function(d,i){ return 60 + i*(keySize+5)})
            .attr("width", keySize)
            .attr("height", keySize)
            .style("fill", function(d){ return color(d)})

    chart1.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 1 + keySize*1.2)
            .attr("y", function(d,i){ return 60 + i*(keySize+5) + (keySize/2)})
            .style("fill", "black")
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

    chart1.selectAll("title")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 1)
            .attr("y", 50)
            .text("Admission Rate:")

    // Creates a tooltip for chart1
    var Tooltip = d3.select("#chart1")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        Tooltip.style("opacity", 1)
    }

    var mousemove = function(d) {
        Tooltip
            .html(d.Name + "<br>" + "Admissions Rate: " + d.AdmissionRate + "<br>" + "Undergraduate Population: " + d.UndergradPopulation
                + "<br>" + "SAT: " + +d.SAT + "<br>" + "Completion Rate (%): " + +d.CompletionRate + "<br>" + "Mean Salary ($): " + d.MeanEarnings)
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
            .style("display", "inline-block")
    }

    var mouseleave = function(d) {
        Tooltip.style("opacity", 0)
    }

    // Creates node for each data set
    var node = chart1.append("g")
                .selectAll("circle")
                .data(csv.filter(function(d) {return d.SAT >= 600}))
                .enter()
                .append("circle")
                .attr("class", "node")
                .attr("r", function(d){ return size(d.UndergradPopulation)})
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .style("fill", function(d){
                    if (d.AdmissionRate < (1/3)) {
                        return color("Low");
                    } else if (d.AdmissionRate < (2/3)) {
                        return color("Medium");
                    } else {
                        return color("High")
                    }
                })
                .style("fill-opacity", 0.8)
                .attr("stroke", "black")
                .style("stroke-width", 1)
                .on("mouseover", mouseover) // What to do when hovered
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);

    node.attr("cx", function(d){ return d.x; }).attr("cy", function(d){ return d.y; })

    function simulate() {
         d3.select("svg")
        .selectAll("text").remove();
        chart1.selectAll("title")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 1)
            .attr("y", 50)
            .text("Admission Rate:")
        chart1.selectAll("legend")
        .data(keys)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("y", function(d,i){ return 60 + i*(keySize+5)})
            .attr("width", keySize)
            .attr("height", keySize)
            .style("fill", function(d){ return color(d)})

    chart1.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 1 + keySize*1.2)
            .attr("y", function(d,i){ return 60 + i*(keySize+5) + (keySize/2)})
            .style("fill", "black")
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
        var simulation = d3.forceSimulation()
                        .force("center", d3.forceCenter().x(width/2).y(height/2)) // Attraction to the center of the svg area
                        .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
                        .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.UndergradPopulation)) }).iterations(1)) // Force that avoids circle overlapping

        // Apply these forces to the nodes and update their positions.
        // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        simulation
            .nodes(csv)
            .on("tick", function(d){
                node
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; })
        });

        node.call(d3.drag() // Calls specific function when circle is dragged
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(.03).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(.03);
            d.fx = null;
            d.fy = null;
        }

    }

    function simulate2() {

        d3.select("svg")
        .selectAll("text").remove();
        chart1.selectAll("legend")
        .data(keys)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("y", function(d,i){ return 60 + i*(keySize+5)})
            .attr("width", keySize)
            .attr("height", keySize)
            .style("fill", function(d){ return color(d)})

    chart1.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 1 + keySize*1.2)
            .attr("y", function(d,i){ return 60 + i*(keySize+5) + (keySize/2)})
            .style("fill", "black")
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

    chart1.selectAll("title")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 1)
            .attr("y", 50)
            .text("Admission Rate:")
        chart1.selectAll("labels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 70)
            .attr("y", 700)
            .text("Low SAT Scores")


        chart1.selectAll("labels")
            .data(keys)
            .enter()
            .append("text")
                .attr("x", 380)
                .attr("y", 700)
                .text("Average SAT Scores")

        chart1.selectAll("labels")
                .data(keys)
                .enter()
                .append("text")
                    .attr("x", 640)
                    .attr("y", 700)
                    .text("High SAT Scores")

        var simulation2 = d3.forceSimulation()
                        .force("x", d3.forceX().strength(.8).x(function(d){
                    if (d.SAT >= 1400) {
                        return SATscale("Smart");
                    } else if (d.SAT >= 1000) {
                        return SATscale("Average");
                    } else {
                        return SATscale("Mediocre");
                    }}))
                        .force("y", d3.forceY().strength(.1).y(height/2))
                        .force("center", d3.forceCenter().x(width/2).y(height/2)) // Attraction to the center of the svg area
                        .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
                        .force("collide", d3.forceCollide().strength(1).radius(3).iterations(1)) // Force that avoids circle overlapping
                        .alphaDecay(.16)
                        .velocityDecay(.3);
        simulation2
            .nodes(csv)
            .on("tick", function(d){
                node
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; })
                    .on("mouseover", mouseover) // What to do when hovered
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
        });

        node.call(d3.drag() // Calls specific function when circle is dragged
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

        function dragstarted(d) {
            if (!d3.event.active) simulation2.alphaTarget(.03).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation2.alphaTarget(.03);
            d.fx = null;
            d.fy = null;
        }

    }

    function simulate3() {


        d3.select("svg")
                    .attr("transform", "translate(" + 0 + "," + 0 + ")")
        d3.select("svg")
            .selectAll("rect")
            .style("visibility","hidden");
        d3.select("svg")
            .selectAll("text")
            .style("visibility","hidden");
        d3.select("svg")
            .selectAll("g")
            .style("visibility","hidden");
        node.style("visibility", "visible");

        chart1.selectAll("labels2")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 650)
            .attr("y", 200)
            .text("Low Completion Rate")

        chart1.selectAll("labels2")
            .data(keys)
            .enter()
            .append("text")
                .attr("x", 650)
                .attr("y", 400)
                .text("Average Completion Rate")

        chart1.selectAll("labels2")
                .data(keys)
                .enter()
                .append("text")
                    .attr("x", 100)
                    .attr("y", 600)
                    .text("High Completion Rate")

    chart1.selectAll("legend")
        .data(keys)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("y", function(d,i){ return 60 + i*(keySize+5)})
            .attr("width", keySize)
            .attr("height", keySize)
            .style("fill", function(d){ return color(d)})

    chart1.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 1 + keySize*1.2)
            .attr("y", function(d,i){ return 60 + i*(keySize+5) + (keySize/2)})
            .style("fill", "black")
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

    chart1.selectAll("title")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 1)
            .attr("y", 50)
            .text("Admission Rate:")


        var simulation3 = d3.forceSimulation()
                        .force("x", d3.forceX().strength(.8).x(function(d){
                    if (d.SAT >= 1400) {
                        return SATscale("Smart");
                    } else if (d.SAT >= 1000) {
                        return SATscale("Average");
                    } else {
                        return SATscale("Mediocre");
                    }}))
                        .force("y", d3.forceY().strength(.8).y(function(d) {
                            if (d.CompletionRate >= 70) {
                                return completionScale("High");
                            } else if (d.CompletionRate >= 40) {
                                return completionScale("Medium");
                            } else {
                                return completionScale("Low");
                            }
                        })
                    )
                        .force("center", d3.forceCenter().x(width/2).y(height/2)) // Attraction to the center of the svg area
                        .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
                        .force("collide", d3.forceCollide().strength(1).radius(3).iterations(1)) // Force that avoids circle overlapping
                        .alphaDecay(.1)
                        .velocityDecay(.2);

        simulation3
            .nodes(csv)
            .on("tick", function(d){
                node
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; })
        });

        node.call(d3.drag() // Calls specific function when circle is dragged
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));


        function dragstarted(d) {
            if (!d3.event.active) simulation3.alphaTarget(.03).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation3.alphaTarget(.03);
            d.fx = null;
            d.fy = null;
        }
    }
    function slide() {
        d3.select("svg")
        .selectAll("text").remove();
        node.style("visibility", "hidden");
    var chart2 = d3.select("svg")
                    .attr("transform", "translate(" + 0 + "," + -150 + ")")
                    .attr("width",width)
                    .attr("height",height);

    var xScale2 = d3.scaleOrdinal()
                    .domain(["Low","Medium","High"])
                    .range([0,300,600]);

    var yScale2 = d3.scaleLinear()
                    .domain([65000,0])
                    .range([200,800]);

    chart2
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(75,85)')
        .call(d3.axisLeft(yScale2));

    chart2
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(150,885)')
        .call(d3.axisBottom(xScale2));

    chart2.append('text')
        .attr('class', 'title')
        .attr('transform','translate(325,250)')
        .text('Mean Earnings v. Admission Rate');

    chart2.append('text')
        .attr('class', 'label')
        .attr('transform','translate(325,950)')
        .text('Admission Rate(%)');

    chart2.append('text')
        .attr('class', 'label')
        .attr('transform','translate(-15,600) rotate(270)')
        .text('Mean Earnings($)');

    var EarningChart = d3.nest()
        .key(function(d) {
            if (d.AdmissionRate < (1/3)) {
                        return color("Low");
                    } else if (d.AdmissionRate < (2/3)) {
                        return color("Medium");
                    } else {
                        return color("High");
                    }
        })
        .entries(csv);

    var i;
    var earningsAvg = [];
    for (i = 0; i < 3; i++) {
        entity = EarningChart[i].values;
        sum = 0;
        lengthC = 0;
        for (j = 0; j < entity.length; j++){
            sum += +entity[j].MeanEarnings;
            if (entity[j].MeanEarnings!=0) {
                lengthC=lengthC+1;
            }
        }
        avg = sum/(lengthC);
        var avgE = {"group" : EarningChart[i].key, "earnings" : avg}
        earningsAvg.push(avgE);
        console.log(avgE);
    }


    chart2.append("rect")
        .attr("x", 75)
        .attr("y", 885-(earningsAvg[0].earnings/65000)*600)
        .attr("width", 150)
        .attr("height", (earningsAvg[0].earnings/65000)*600)
        .attr("fill", "#87CEFA");

    chart2.append("rect")
        .attr("x", 375)
        .attr("y", 885-(earningsAvg[1].earnings/65000)*600)
        .attr("width", 150)
        .attr("height", (earningsAvg[1].earnings/65000)*600)
        .attr("fill", "#4169E1");

    chart2.append("rect")
        .attr("x", 675)
        .attr("y", 885-(earningsAvg[2].earnings/65000)*600)
        .attr("width", 150)
        .attr("height", (earningsAvg[2].earnings/65000)*600)
        .attr("fill", "#4B0082");

    }

    function scroll(n, offset, func1, func2){
        return new Waypoint({
          element: document.getElementById(n),
          handler: function(direction) {
             direction == 'down' ? func1() : func2();
          },
          //start 75% from the top of the div
          offset: offset
        });
    };


    new scroll('firstslide', '75%', simulate, function() {return});
    new scroll('secondslide', '75%', simulate2, simulate);
    new scroll('thirdslide', '75%', simulate3, simulate2);
    new scroll('fourthslide', '75%', slide, simulate3);

   simulate();

});
