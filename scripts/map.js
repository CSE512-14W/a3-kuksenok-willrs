var loader = d3.dispatch("world");

d3.json("../data/world-110m.json", function(error, world) {
  d3.selectAll("svg").insert("path", ".foreground")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land");
  d3.selectAll("svg").insert("path", ".foreground")
      .datum(topojson.mesh(world, world.objects.countries))
      .attr("class", "mesh");
  loader.world();
});

function orthographicProjection(width, height) {
  return d3.geo.orthographic()
      .precision(.5)
      .clipAngle(90)
      .clipExtent([[1, 1], [width - 1, height - 1]])
      .translate([width / 2, height / 2])
      .scale(width / 2 - 10)
      .rotate([100, 0]);
}

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
}

var width = 500,
    height = 500;
    
window.addEventListener('load', function() {
  d3.select("#map")
  .data([orthographicProjection(width, height)
          .scale(245)
          .translate([width / 2, height * .56])])
  .append("svg")
  .each(function(projection) {
    var path = d3.geo.path().projection(projection),
        svg = d3.select(this).call(drawMap, path, true);
        svg.selectAll(".foreground")
            .call(d3.geo.zoom().projection(projection)
              .scaleExtent([projection.scale() * .7, projection.scale() * 10])
              .on("zoom.redraw", function() {
                d3.event.sourceEvent.preventDefault();
                svg.selectAll("path").attr("d", path);
              }));
        loader.on("world.0", function() { svg.selectAll("path").attr("d", path); });
      });
});


