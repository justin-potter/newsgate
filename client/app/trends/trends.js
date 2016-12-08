angular.module('newsgate.trends', [])
.controller('TrendsController', function($scope) {

})
.directive('trendGraph', function(Trends) {
  console.log('isD3 Loaded?', d3);
  return {
    restrict: 'E',
    link: function(scope, element) {

      var margin = {top: 20, right: 20, bottom: 30, left: 50},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      // parse the date / time
      var parseTime = d3.timeParse("%d-%b-%y");

      // set the ranges
      var x = d3.scaleTime().range([0, width]);
      var y = d3.scaleLinear().range([height, 0]);

      // define the line
      var valueline = d3.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d['value']); });

      // append the svg obgect to the body of the page
      // appends a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      var svg = d3.select(element[0]).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

      // Get the data
      d3.csv("/app/test/data.csv", function(error, data) {
        if (error) throw error;
        console.log('original data', data);
        // format the data
        data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.close = +d.close;
            // console.log('d.date:', d.date);
            // console.log('d.close:', d.close);
        });
        console.log('original data after formating', data);
        data = Trends.getTestData();
        console.log(data);

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d['value']; })]);

        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", valueline);

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

      });

    }
  };
});
