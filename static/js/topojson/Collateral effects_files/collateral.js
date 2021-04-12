base_url = window.location.origin

// load datasets 

dataset_collateral = d3.csv(base_url + "/files/vaccinations_collateral")
dataset_us_map = d3.json(base_url + "/files/us_map")

Promise.all([dataset_collateral, dataset_us_map]).then((datasets) => {
    ds_data = datasets[0]
    ds_map = datasets[1]

    facts = crossfilter(ds_data)
    state_code_dimension = facts.dimension(d => d.STATE_CODE)
    state_code_count = state_code_dimension.group().reduceCount().all()
    

    minimal_state = {key: "", value: Infinity};
    max_state = {key: "", value: 0};

    let stateCountMap = new Map()
    state_code_count.forEach((item) => {

        if (item.key !== "") {
            stateCountMap.set(item.key, item.value)
        }

        if (item.key !== "" && (item.value < minimal_state.value)) {
            minimal_state.key = item.key
            minimal_state.value = item.value
        }

        if (item.key !== "" && (item.value > max_state.value)) {
            max_state.key = item.key
            max_state.value = item.value
        }
    });

    colorScaleMap = d3.scaleQuantize()
        .domain([minimal_state.value, max_state.value])
        .range(d3.schemeGreens[9])

    const width = 960
    const height = 600
    const svg = d3.select("#map-us")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewbox", "0 0 100 100");
    let path = d3.geoPath()

    svg.append("g")
        .attr("class", "states")
    .selectAll("path")
        .data(topojson.feature(ds_map, ds_map.objects.states).features)
        .enter()
            .append("path")
            .attr("fill", d => colorScaleMap(stateCountMap.get(d.id)))
            .attr("d", path)

    
})

