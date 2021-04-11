// define range field

pandemic_periods = [
    '2020-12-15', 
    '2020-12-31', 
    '2021-01-15', 
    '2021-01-31', 
    '2021-02-15', 
    '2021-02-28', 
    '2021-03-15', 
    '2021-03-31', 
    '2021-04-15'
]

pandemic_period_idx = d3.select("#pandemic-period-range").property('value')
d3.select("#pandemic-period-label").text("until " + pandemic_periods[pandemic_period_idx])

// load dataset

base_url = window.location.origin
promise_ds = d3.csv(base_url + '/files/vaccinations').then(function(data) {
    let parseDate = d3.utcParse("%Y-%m-%d")
    data.forEach(function(d) {
        d.date = parseDate(d.date)
        d.daily_vaccinations = d.daily_vaccinations == "" ? 0 : eval(d.daily_vaccinations)
    })
    return data
});

// create graphics after load dataset

Promise.all([promise_ds]).then((dataset_vaccine) => {
    
    // number of countries

    top_n = 50

    let facts = crossfilter(dataset_vaccine[0])

    let date_dimension = facts.dimension(d => d.date).filterRange([new Date('2020-01-01'), new Date(pandemic_periods[pandemic_period_idx])])
    let country_dimension = facts.dimension(d => d.country)
    let daily_vaccinations_by_country = country_dimension.group().reduceSum(d => d.daily_vaccinations)
    let country_names = daily_vaccinations_by_country.top(top_n).map(d => d.key)
    var x_country_scale = d3.scaleOrdinal().domain(country_names);
    
    let daily_vaccinations_chart = dc.barChart(document.getElementById("countries-bar-graph"))

    daily_vaccinations_chart
        .width(1000)
        .height(300)
        .margins({top: 10, right: 10, bottom: 120, left:40})
        .dimension(country_dimension)
        .group(daily_vaccinations_by_country)
        .transitionDuration(1000)
        .centerBar(false)
        .renderHorizontalGridLines(true)
        .x(x_country_scale)
        .elasticY(true)
        .xUnits(dc.units.ordinal)
        .renderlet(function (chart) {
            elements = chart.selectAll("g.x text")
            elements._groups[0].forEach(item => {
                text_length = item.innerHTML.length
                item.setAttribute("dx", -15 -text_length - 1.2 * text_length);
                item.setAttribute("y", 0);
                item.setAttribute("transform", "rotate(-70)");
            })
        });
        daily_vaccinations_chart.yAxis().tickFormat(d3.format('.1s'));

    dc.renderAll()
    
    // update graphic

    d3.select("#pandemic-period-range").on('change', function() {
        d3.select("#pandemic-period-label").text("until " + pandemic_periods[this.value])
        date_dimension.filterRange([new Date('2020-01-01'), new Date(pandemic_periods[this.value])])
        
        country_names = daily_vaccinations_by_country.top(top_n).map(d => d.key)
        x_country_scale = d3.scaleOrdinal().domain(country_names);
        daily_vaccinations_chart.x(x_country_scale)

        dc.redrawAll();
    })    

});