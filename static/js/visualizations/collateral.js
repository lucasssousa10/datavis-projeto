base_url = window.location.origin

// functions

function showTooltip(state_name, count, x, y, width) {
    const offset = 10;
    const t = d3.select("#tooltip");
    t.select("#num-collateral-effects-val").text(count);
    t.select("#state-tooltip-val").text(state_name);
    t.classed("hidden", false);
    const rect = t.node().getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (x + offset + w > width) {
        x = x - w;
    }
    t.style("left", x + offset + "px").style("top", y - h + "px");
}

function hideTooltip(){
    d3.select("#tooltip")
    .classed("hidden", true)
}

// load datasets 

dataset_collateral = d3.csv(base_url + "/files/vaccinations_collateral")
dataset_us_map = d3.json(base_url + "/files/us_map")

Promise.all([dataset_collateral, dataset_us_map]).then((datasets) => {
    ds_data = datasets[0]
    ds_map = datasets[1]

    state_by_code = new Map()
    ds_data.forEach((state) => {
        state_by_code.set(state.CODE, {state: state.STATE, state_name: state.STATE_NAME})
    })

    facts = crossfilter(ds_data)
    state_code_dimension = facts.dimension(d => d.CODE)
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

    const width = 600
    const height = 360
    const svg = d3.select("#map-us")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
    let path = d3.geoPath()
    
    svg.append("g")
        .attr("class", "states")
        .attr("transform", "scale(0.6)")
    .selectAll("path")
        .data(topojson.feature(ds_map, ds_map.objects.states).features)
        .enter()
            .append("path")
            .attr("fill", d => colorScaleMap(stateCountMap.get(d.id)))
            .attr("d", path)
            .on("mouseover", function(d){
                d3.select(this)
                    .style("cursor", "pointer")
                    .attr("stroke-width", 3)
                    .attr("stroke","#000000")
                
                const rect = this.getBoundingClientRect();
                showTooltip(state_by_code.get(d.id).state_name, stateCountMap.get(d.id), rect.x, rect.y, width)
            })
            .on("mouseout", function(d){
                d3.select(this)
                    .style("cursor", "default")
                    .attr("stroke-width", 1)
                    .attr("stroke", "rgb(185, 184, 184)");
                    hideTooltip()
            })
})

