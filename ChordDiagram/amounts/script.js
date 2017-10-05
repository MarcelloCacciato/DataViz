////////////////////////////////////////////////////////////
//////////////////////// Set-Up ////////////////////////////
////////////////////////////////////////////////////////////

var margin = {left:90, top:90, right:90, bottom:90},
	width = Math.min(window.innerWidth, 700) - margin.left - margin.right,
    height = Math.min(window.innerWidth, 700) - margin.top - margin.bottom,
    innerRadius = Math.min(width, height) * .39,
    outerRadius = innerRadius * 1.1;
	
var Names = ["Drenthe","Flevoland","Friesland","Gelderland","Groningen","Limburg","North Brabant","North Holland","Overijssel","South Holland","Utrecht","Zeeland","Abroad"],
	colors = ["#92a8d1", "#80ced6", "#d5f4e6", "#deeaee", "#b2b2b2","#b1cbbb","#618685","#eea29a","#f7786b","#c94c4c","#b9936c","#3e4444","#034f84"],
	opacityDefault = 0.8;

var matrix = [
	[0,0,127915,131007.3,0,105710.7,90464.54,46598.69,0,4882.06,18154.84,584.43,0], //drenthe
	[0,0,12727.22,12391.65,0,8990.3,277642.5,53765.75,0,0,402.7485,1665.64,0], //flevoland
	[0,0,2784488,118571.3,0,7057.853,207944,193173.8,0,47184.05,3572.44,173490.8,0], //Friesland
	[0,0,271985.2,695267.5,0,536845.5,779809.7,693334.2,0,58294.93,133061.3,90123.91,0], //Gelderland
        [0,0,21153.98,53401.57,0,12.705,103744.3,30168.54,0,0,1423.7,1146.398,0], //Groningen
	[0,0,36949.9,83822.65,0,31932.3,386031.9,206946.9,0,3093.643,553.454,22191.78,0], //Limburg
	[0,0,318019.9,381325.1,0,94206.23,2650581,811807.1,0,14647.85,165833.6,835593.6,0], //N-Brabant
        [0,0,212845.7,1057625,0,786849.3,879604.7,1818826,0,53260.32,30936.47,81390.92,0], //N-Holland
        [0,0,48496.35,208294.9,0,19138.05,581540.3,139562.2,0,17317.62,804.05,10140.83,0], //Overijssel
        [0,0,489012.9,533815.7,0,5346.171,1324668,1110286,0,436740.9,18137.16,28603.14,0], //Z-Holland
        [0,0,180635,422156.1,0,80865.31,512875,345771.4,0,135508.2,419955.8,91792.38,0], //Utrecht
	[0,0,20578.31,124776,0,3132.284,163317,125294.1,0,302.9356,416.4435,22604.41,0], //Zeeland
	[0,0,80805.71,82859.53,0,4922.156,474825.8,553346.5,0,10902.94,52308.94,65007.49,0], //Abroad
];

////////////////////////////////////////////////////////////
/////////// Create scale and layout functions //////////////
////////////////////////////////////////////////////////////

var colors = d3.scale.ordinal()
    .domain(d3.range(Names.length))
	.range(colors);

var chord = customChordLayout()
    .padding(.05)
    .sortChords(d3.descending)
	.matrix(matrix);
		
var arc = d3.svg.arc()
    .innerRadius(innerRadius*1.01)
    .outerRadius(outerRadius);

var path = d3.svg.chord()
	.radius(innerRadius);
	
////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////
	
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");

////////////////////////////////////////////////////////////
/////////////// Create the gradient fills //////////////////
////////////////////////////////////////////////////////////

//Function to create the unique id for each chord gradient
function getGradID(d){ return "linkGrad-" + d.source.index + "-" + d.target.index; }

//Create the gradients definitions for each chord
var grads = svg.append("defs").selectAll("linearGradient")
	.data(chord.chords())
   .enter().append("linearGradient")
    //Create the unique ID for this specific source-target pairing
	.attr("id", getGradID)
	.attr("gradientUnits", "userSpaceOnUse")
	//Find the location where the source chord starts
	.attr("x1", function(d,i) { return innerRadius * Math.cos((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - Math.PI/2); })
	.attr("y1", function(d,i) { return innerRadius * Math.sin((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - Math.PI/2); })
	//Find the location where the target chord starts 
	.attr("x2", function(d,i) { return innerRadius * Math.cos((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - Math.PI/2); })
	.attr("y2", function(d,i) { return innerRadius * Math.sin((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - Math.PI/2); })

//Set the starting color (at 0%)
grads.append("stop")
	.attr("offset", "0%")
	.attr("stop-color", function(d){ return colors(d.source.index); });

//Set the ending color (at 100%)
grads.append("stop")
	.attr("offset", "100%")
	.attr("stop-color", function(d){ return colors(d.target.index); });
		
////////////////////////////////////////////////////////////
////////////////// Draw outer Arcs /////////////////////////
////////////////////////////////////////////////////////////

var outerArcs = svg.selectAll("g.group")
	.data(chord.groups)
	.enter().append("g")
	.attr("class", "group")
	.on("mouseover", fade(.1))
	.on("mouseout", fade(opacityDefault));

outerArcs.append("path")
	.style("fill", function(d) { return colors(d.index); })
	.attr("d", arc);
	
////////////////////////////////////////////////////////////
////////////////////// Append Names ////////////////////////
////////////////////////////////////////////////////////////

//Append the label names on the outside
outerArcs.append("text")
  .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
  .attr("dy", ".35em")
  .attr("class", "titles")
  .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
  .attr("transform", function(d) {
		return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		+ "translate(" + (outerRadius + 10) + ")"
		+ (d.angle > Math.PI ? "rotate(180)" : "");
  })
  .text(function(d,i) { return Names[i]; });
	
////////////////////////////////////////////////////////////
////////////////// Draw inner chords ///////////////////////
////////////////////////////////////////////////////////////
  
svg.selectAll("path.chord")
	.data(chord.chords)
	.enter().append("path")
	.attr("class", "chord")
	.style("fill", function(d){ return "url(#" + getGradID(d) + ")"; })
	.style("opacity", opacityDefault)
	.attr("d", path);

////////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
////////////////////////////////////////////////////////////

//Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(d,i) {
    svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
		.transition()
        .style("opacity", opacity);
  };
}//fade

