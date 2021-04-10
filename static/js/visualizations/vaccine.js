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
d3.select("#pandemic-period-range").on('change', function() {
    d3.select("#pandemic-period-label").text("until " + pandemic_periods[this.value])
})

// load dataset

base_url = window.location.origin
dataset_vaccine = d3.csv(base_url + '/files/vaccinations').then(function(data) {
    let parseDate = d3.utcParse("%Y-%m-%d")
    data.forEach(function(d) {
        d.date = parseDate(d.date)
    })
    return data
});

facts = crossfilter(dataset_vaccine)
dateDimension = facts.dimension( d => d.date)