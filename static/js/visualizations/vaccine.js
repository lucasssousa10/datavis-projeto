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
        d.people_fully_vaccinated = d.people_fully_vaccinated == "" ? 0 : eval(d.people_fully_vaccinated)
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
    let vaccine_dimension = facts.dimension(d => d.vaccines)
    let daily_vaccinations_by_country = country_dimension.group().reduceSum(d => d.daily_vaccinations)
    let vaccine_by_company = vaccine_dimension.group().reduceSum(d => d.daily_vaccinations)
    let country_fully_vaccined = country_dimension.group().reduceSum(d => d.people_fully_vaccinated)
    let country_names = daily_vaccinations_by_country.top(top_n).map(d => d.key)
    let x_country_scale = d3.scaleOrdinal().domain(country_names)
    let x_vaccine_scale = d3.scaleLog().domain([0,vaccine_by_company.top(1)[0].value])
    
    // find informations to cards
    
    pioneer_vaccination = date_dimension.bottom(1)[0]
    
    country_most_fully_vaccined = {key: "", value: 0};
    country_least_fully_vaccined = {key: "", value: Infinity};
    country_fully_vaccined.all().forEach(function(item) {
        if(item.value > country_most_fully_vaccined.value) {
            country_most_fully_vaccined.key = item.key
            country_most_fully_vaccined.value = item.value 
        }

        if(item.value < country_least_fully_vaccined.value) {
            country_least_fully_vaccined.key = item.key
            country_least_fully_vaccined.value = item.value 
        }   
    })
    
    
    d3.select("#country-pioneer-vaccination").text(pioneer_vaccination.country)
    d3.select("#country-most-immunized").text(country_most_fully_vaccined.value > 0 ? country_most_fully_vaccined.key : "")
    d3.select("#country-least-immunized").text(country_least_fully_vaccined.key)
    // d3.select("#country-more-vaccine-types", country_more_variety_countries.value > 0 ? country_more_variety_countries.key : "")

    // create charts

    let daily_vaccinations_chart = dc.barChart(document.getElementById("countries-bar-graph"))
    let horizontal_chart = new dc.RowChart("#bar-vaccine-type");

    daily_vaccinations_chart
        .width(800)
        .height(300)
        .margins({top: 30, right: 10, bottom: 110, left:40})
        .dimension(country_dimension)
        .group(daily_vaccinations_by_country, "Vaccine amount")
        .transitionDuration(1000)
        .centerBar(false)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(700).y(0).itemHeight(13).gap(5))
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
    daily_vaccinations_chart.yAxis().tickFormat(d3.format('.2s'));

    horizontal_chart
        .width(400)
        .height(300)
        .dimension(vaccine_dimension)
        .group(vaccine_by_company)
        .x(x_vaccine_scale)
        .elasticX(true)
        .on("renderlet", function(chart) {
            rects = chart.selectAll('.row').selectAll('rect')
            rects._groups.forEach(function(rect) {
                if(rect[0] !== undefined)
                    rect[0].setAttribute("style", "width:" + rect[0].getAttribute("width") + ";")
            })
            texts = chart.selectAll('.row').selectAll('text')
            texts._groups.forEach(function(txt) {
                if(txt[0] !== undefined)
                    txt[0].setAttribute("style", "fill: #000000;")
            })
        })
        .xAxis().tickFormat(d3.format('.2s')).ticks(5)
        

    dc.renderAll()
    
    // update graphic

    d3.select("#pandemic-period-range").on('change', function() {
        d3.select("#pandemic-period-label").text("until " + pandemic_periods[this.value])
        date_dimension.filterRange([new Date('2020-01-01'), new Date(pandemic_periods[this.value])])
        
        country_names = daily_vaccinations_by_country.top(top_n).map(d => d.key)
        x_country_scale = d3.scaleOrdinal().domain(country_names);
        daily_vaccinations_chart.x(x_country_scale)

        x_vaccine_scale = d3.scaleLog().domain([0,vaccine_by_company.top(1)[0].value])
        
        country_most_fully_vaccined = {key: "", value: 0};
        country_least_fully_vaccined = {key: "", value: Infinity};
        country_fully_vaccined.all().forEach(function(item) {
            if(item.value > country_most_fully_vaccined.value) {
                country_most_fully_vaccined.key = item.key
                country_most_fully_vaccined.value = item.value 
            }

            if(item.value < country_least_fully_vaccined.value) {
                country_least_fully_vaccined.key = item.key
                country_least_fully_vaccined.value = item.value 
            }   
        })
        
        d3.select("#country-most-immunized").text(country_most_fully_vaccined.value > 0 ? country_most_fully_vaccined.key : "")
        d3.select("#country-least-immunized").text(country_least_fully_vaccined.key)

        dc.redrawAll();
    })    

});