var loader = d3.dispatch("world");

d3.json("data/world-110m.json", function(error, world) {
  d3.selectAll("svg").insert("path", ".foreground")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land");
  d3.selectAll("svg").insert("path", ".foreground")
      .datum(topojson.mesh(world, world.objects.countries))
      .attr("class", "mesh");
  loader.world();
});

function cluster(ufos) {
  var locs = {};
  var bubbles = [];
  ufos.forEach(function(ufo) {
    if (!ufo[0] || ufo[0][0] === 0 || ufo[0][1] === 0 ||
        ufo[0][0] === undefined || ufo[0][1] === undefined) {
      return;
    }
    var key = ufo[0][0] + ',' + ufo[0][1]
    if (locs[key]) {
      bubbles[locs[key]].count += 1;
    } else {
      locs[key] = bubbles.length;
      var ll = [ufo[0][1], ufo[0][0]];
      bubbles.push({
        name: ufo[1],
        loc: ll,
        count: 1
      });
    }
  });
  bubbles.forEach(function(bubble) {
    bubble.radius = Math.sqrt(bubble.count);
  });
  return bubbles;
}

d3.json("data/ufo_metadata.json", function(error, data) {
  var bub = cluster(data);
  d3.select("g.sightings").selectAll("circle")
  .data(bub).enter()
  .append("circle")
  .attr("class", "point")
  .attr("cx", function(d) {return proj(d.loc)[0];})
  .attr("cy", function(d) {return proj(d.loc)[1];})
  .attr("r", function(d) {return d.radius;});
});

function orthographicProjection(width, height) {
/*  return d3.geo.equirectangular()
      .precision(.5)
      .clipAngle(90)
      .clipExtent([[1, 1], [width - 1, height - 1]])
      .translate([width / 2, height / 2])
      .scale(width / 2 - 10)
      .rotate([100, 0]);*/
  return d3.geo.mercator()
      .precision(.5)
      .translate([0, 0])
      .scale(width / 2);
}
var zoom;

function drawMap(svg, path, mousePoint) {
  var projection = path.projection();

  svg.append("path")
      .datum(d3.geo.graticule())
      .attr("class", "graticule")
      .attr("d", path);

  svg.append("path")
      .datum({type: "Sphere"})
      .attr("class", "foreground")
      .attr("d", path);
  
  svg.append("g")
      .attr("class", "sightings");
  
  zoom = d3.behavior.zoom()
          .scaleExtent([1, 8])
          .on("zoom", move);
  svg.call(zoom);
}

function move() {

  var t = d3.event.translate;
  var s = d3.event.scale;  
  var h = height / 3;
  
  t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
  t[1] = Math.min(height / 2 * (s - 1) + h * s, Math.max(height / 2 * (1 - s) - h * s, t[1]));

  zoom.translate(t);
  d3.selectAll("g").style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
  d3.selectAll("path").attr("transform", "translate(" + t + ")scale(" + s + ")");
}



var width = 500,
    height = 500,
    proj = orthographicProjection(width, height)
          .scale(245)
          .translate([width / 2, height * .56]);
    
window.addEventListener('load', function() {
  d3.select("#map")
  .data([proj])
  .append("svg")
  .each(function(projection) {
    var path = d3.geo.path().projection(projection),
        svg = d3.select(this).call(drawMap, path, true);
      /*  svg.selectAll(".foreground, .point")
            .call(d3.geo.zoom().projection(projection)
              .scaleExtent([projection.scale() * .7, projection.scale() * 10])
              .on("zoom.redraw", function() {
                d3.event.sourceEvent.preventDefault();
                svg.selectAll("path").attr("d", path);
                svg.selectAll("circle")
                .attr("cx", function(d) { return projection(d.loc)[0]})
                .attr("cy", function(d) { return projection(d.loc)[1]});
              }));*/
        loader.on("world.0", function() { svg.selectAll("path").attr("d", path); });
      });
});


