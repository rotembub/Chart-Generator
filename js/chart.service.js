'use strict'

var gCharts;
const KEY = 'userCharts'
// var gChart;

function loadCharts() {
    var charts = loadFromStorage(KEY)
    if (!charts || !charts.length) charts = [];
    gCharts = charts;
    console.log(gCharts)
}

function getCharts() {
    return gCharts;
}

function saveChart(type, inputs, img, chart, bgImg) {
    if (chart && chart.id) saveChanges(type, inputs, img, chart.id, bgImg)
    else createChart(type, inputs, img, bgImg)
}

function getEmptyChart() {
    var chart = {
        id: '',
        type: '',
        inputs: '',
        img: '',
        bgImg: '',
    }
    // gChart = chart;
    return chart
}

function createChart(type, inputs, chartImg, bcgImg) {
    // console.log(bcgImg)
    var chart = {
        id: makeId(),
        type,
        inputs,
        img: chartImg,
        bgImg: bcgImg
    }

    gCharts.push(chart);
    saveToStorage(KEY, gCharts);
    // return chart;
}

function getChartById(chartId) {
    // return gCharts.find(chart => chart.id === chartId)
    var chart = gCharts.find(chart => chart.id === chartId)
    gChart = chart;
    return chart;
}

function saveChanges(chartType, inputs, chartImg, chartId, bgImage) {
    var chart = getChartById(chartId)
    chart.inputs = inputs;
    chart.img = chartImg;
    chart.type = chartType;
    chart.bgImg = bgImage;
    saveToStorage(KEY, gCharts);
    console.log('changes saved')
}

// Not currently in use:
// function updateChart(chartType, inputs, chartImg, chartId, bgImage) {
//     gChart.inputs = inputs;
//     gChart.img = chartImg;
//     gChart.type = chartType;
//     gChart.bgImg = bgImage;
// }

function deleteChart(chartId) {
    gCharts = gCharts.filter(chart => chart.id !== chartId)
    saveToStorage(KEY, gCharts);
}

function createInputData(vals, txts, clrs) {
    var values = Array.from(vals, elInput => parseInt(elInput.value))
    // filtering falsy values:
    values = values.filter(value => value)
    // summing up the total:
    var total = values.reduce((sum, val) => {
        if (val) return sum += val
    }, 0)
    // returning an array of objects with percentage values:
    var userInputs = values.map((value, idx) => {
        return {
            val: (value / total) * 100,
            realVal: value,
            txt: txts[idx].value,
            clr: clrs[idx].value || 'blue'
        }
    });
    return userInputs
}