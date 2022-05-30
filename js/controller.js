'use strict'

var gElCanvas
var gCtx;
var gChartType = 'bar';
var gInputsShown = 2;
var gCurrImg;
var gChart;
var gRecorder;
var gIsAnimated;
// var gStartPos;

// var testingTxtPos = { x: 200, y: 100, txt: 'wallak', txtSize: 20 } // TESTING: for testing purpses only

// TODO: fix the gChart handling / work with model

function onInit() {
    loadCharts();
    gElCanvas = document.querySelector('canvas');
    gCtx = gElCanvas.getContext('2d');
    gChart = getEmptyChart();
    resetInputColors();
    // addMouseListeners() // TESTING: for testing purpses only
    // drawText(testingTxtPos.txt, testingTxtPos.x, testingTxtPos.y, 'black', 'left') // TESTING: for testing purpses only
}

function onShowCollection(ev) {
    ev.preventDefault();
    renderCollection();
    document.querySelector('.main').classList.add('hidden')
    document.querySelector('.collection').classList.remove('hidden')
}

function onShowEditor(ev) {
    // if (ev) ev.preventDefault();
    document.querySelector('.collection').classList.add('hidden')
    document.querySelector('.main').classList.remove('hidden')

}

function clearCanvas() {
    console.log('clearing')
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height);
}

function resetInputColors() {
    document.querySelectorAll('.data-color').forEach(elClrInput => onSetColor(elClrInput))
}

function onSetColor(elClrInput) {
    elClrInput.parentElement.style.backgroundColor = elClrInput.value;
}

function onAddInput() {
    gInputsShown++;
    if (gInputsShown === 4) document.querySelector('.add-input-btn').classList.add('hidden');
    var elInput = document.querySelector('.data-input.hidden')
    if (!elInput) return;
    elInput.classList.remove('hidden')
}

function onRemoveInput(elInput) {
    gInputsShown--;
    if (gInputsShown === 3) document.querySelector('.add-input-btn').classList.remove('hidden');
    elInput.parentElement.classList.add('hidden')
}

function onChangeChartType(val) {
    // console.log(val);
    gChartType = val;
}

// Perhaps this should be removed and only use the animation drawing
function onDrawCharts() {
    clearCanvas();
    drawChart();
}

function getUserInput() {
    // var elDataInputs = document.querySelectorAll('.data-input')
    var elValInputs = document.querySelectorAll('.data-value');
    var elTxtInputs = document.querySelectorAll('.data-name');
    var elClrInputs = document.querySelectorAll('.data-color');
    // transforming the NODE list into an array:
    return createInputData(elValInputs, elTxtInputs, elClrInputs); // WATCHOUT

    // Moved to chartService: 
    var values = Array.from(elValInputs, elInput => parseInt(elInput.value));
    // filtering falsy values:
    values = values.filter(value => value);
    // summing up the total:
    var total = values.reduce((sum, val) => {
        if (val) return sum += val
    }, 0)
    // returning an array of objects with percentage values:
    var userInputs = values.map((value, idx) => {
        return {
            val: (value / total) * 100,
            realVal: value,
            txt: elTxtInputs[idx].value,
            clr: elClrInputs[idx].value || 'blue'
        }
    });
    return userInputs
}

function drawChart(data) {
    switch (gChartType) {
        case 'bar':
            drawBarChart(data);
            break;
        case 'pie':
            drawPieChart(data);
            break;
        case 'line':
            drawLineChart(data);
            break;
        case 'balloon':
            drawBalloonChart(data);
            break;
        case 'area':
            drawAreaChart(data);
            break;
    }
}

function drawBarChart(data) {
    var inputs = data || getUserInput();
    const TXTPAD = 20;
    const PAD = 40;
    gCtx.beginPath();
    inputs.forEach((input, idx) => {
        var x = PAD + (idx * (50 + PAD));
        var y = gElCanvas.height - (gElCanvas.height * (input.val / 100));
        drawText(input.txt, x + PAD / 2, y - TXTPAD)
        gCtx.strokeStyle = 'black';
        gCtx.fillStyle = input.clr;
        gCtx.fillRect(x, y, 50, gElCanvas.height * (input.val / 100))
        gCtx.rect(x, y, 50, gElCanvas.height * (input.val / 100));
        gCtx.stroke();
    })
    gCtx.closePath();
}

function drawPieChart(data) {
    const RADIUS = 200;
    const TXTPAD = 20;
    var inputs = data || getUserInput();
    var currStartAngle = 0 * Math.PI;
    var prevValuePercentageSum = 0;

    inputs.forEach((input, idx) => {
        var rndColor = getRandomColor();
        var endAngle = (currStartAngle) ? 2 * Math.PI - ((2 - 2 * prevValuePercentageSum) * Math.PI - (input.val / 100 * 2 * Math.PI)) : (input.val / 100 * 2 * Math.PI);
        // console.log(endAngle, currStartAngle)
        gCtx.beginPath();
        gCtx.strokeStyle = input.clr || rndColor;
        gCtx.fillStyle = input.clr || rndColor;
        gCtx.arc(gElCanvas.width / 2, gElCanvas.height / 2, RADIUS, currStartAngle, endAngle);
        gCtx.lineTo(gElCanvas.width / 2, gElCanvas.height / 2);
        gCtx.stroke();
        gCtx.fill()
        drawText(input.txt, 10, TXTPAD + TXTPAD * idx, input.clr, 'left')
        currStartAngle = endAngle;
        prevValuePercentageSum += (input.val / 100)
        // var area = (endAngle - currStartAngle) * RADIUS ** 2;
        // var circumference = 2 * (endAngle - currStartAngle) * RADIUS
        // console.log(area, circumference);
        // var area = 2*Math.PI*RADIUS**2
        // drawText(input.txt,) // <-- VERY COMPLICATED needs to calculate the center of the shape and then fit it in somehow
        // console.log('drawing pie', 'end:', currStartAngle)
    })
    gCtx.closePath()
}

// OLD DRAW LINE - KEEP FOR REF

// function drawLineChart(data) {
//     var inputs = data || getUserInput();
//     const TXTPAD = 20;
//     const PAD = gElCanvas.width / inputs.length;
//     gCtx.beginPath();
//     gCtx.moveTo(0, gElCanvas.height);
//     inputs.forEach((input, idx) => {
//         var x = PAD + (idx * + PAD);
//         var y = gElCanvas.height - (gElCanvas.height * (input.val / 100));
//         gCtx.lineWidth = 2;
//         // gCtx.strokeStyle = input.clr;
//         // gCtx.fillStyle = 'blue';
//         gCtx.lineTo(x, y)
//         gCtx.strokeStyle = 'black';
//         gCtx.stroke();
//         var txtY = (inputs[idx - 1] && inputs[idx].value < inputs[idx - 1].value) ? y - TXTPAD : y + TXTPAD;
//         drawText(input.txt, x - PAD / 2, txtY, input.clr)
//     })
//     gCtx.closePath()
// }

function drawLineChart(data) {
    var inputs = data || getUserInput();
    const SPACING = 50;
    const TXTPAD = 20;
    const PAD = (gElCanvas.width - SPACING * 2) / inputs.length;
    gCtx.beginPath();
    gCtx.moveTo(SPACING, gElCanvas.height);
    inputs.forEach((input, idx) => {
        var x = PAD + (idx * PAD);
        var y = gElCanvas.height - (gElCanvas.height * (input.val / 100));
        gCtx.lineWidth = 2;
        // gCtx.strokeStyle = input.clr;
        // gCtx.fillStyle = 'blue';
        gCtx.lineTo(x, y)
        gCtx.strokeStyle = 'black';
        gCtx.stroke();
        drawText(input.txt, x, y - TXTPAD, input.clr)
    })
    gCtx.lineTo(gElCanvas.width - SPACING, gElCanvas.height) // WATCHOUT
    gCtx.lineTo(SPACING, gElCanvas.height) // WATCHOUT
    gCtx.fillStyle = 'blue';
    gCtx.fill() // WATCHOUT
    gCtx.closePath()
}

function drawText(txt, x, y, clr, align = 'center') {
    // gCtx.beginPath()
    // console.log('drawing txt:', txt, x, y, clr)
    gCtx.strokeStyle = clr || 'black';
    gCtx.font = '20px serif';
    gCtx.textAlign = align;
    gCtx.strokeText(txt, x, y);
}

function drawBalloonChart(data) {
    var inputs = data || getUserInput();
    const PAD = 20;
    var start = PAD;

    inputs.forEach((input, idx) => {
        start += (input.val + PAD)
        gCtx.beginPath();
        gCtx.lineWidth = 2;
        gCtx.arc(start, gElCanvas.height / 2, input.val, 0, 2 * Math.PI);
        gCtx.fillStyle = input.clr;
        gCtx.closePath();
        gCtx.fill();
        gCtx.stroke();
        gCtx.moveTo(start, gElCanvas.height / 2);
        gCtx.lineTo(start, gElCanvas.height - PAD * 2)
        gCtx.stroke();
        drawText(input.txt, start, gElCanvas.height - PAD)
        start += input.val + PAD;
    })
    gCtx.closePath();
}


function drawAreaChart(data) {
    var inputs = data || getUserInput();
    var xStart = 0;
    inputs.forEach((input, idx) => {
        var width = gElCanvas.width * (input.val / 100);
        gCtx.beginPath();
        // gCtx.rect(xStart, 0, width, height);
        gCtx.fillStyle = input.clr
        gCtx.fillRect(xStart, 0, width, gElCanvas.height);
        // gCtx.stroke();
        gCtx.closePath()
        drawText(input.txt, xStart + width / 2, gElCanvas.height / 2)
        xStart += width;
    })
}

function onSaveChart() {
    var chartInputs = getUserInput();
    var bcgImg = gCurrImg ? gCurrImg.src : null;
    saveChart(gChartType, chartInputs, gElCanvas.toDataURL('image/png'), gChart, bcgImg);
}

function renderCollection() {
    const charts = getCharts();
    var strHtmls = charts.map(chart => {
        return `
            <div class="chart-preview">
            <button class="delete-btn" onclick="onDeleteChart('${chart.id}')">X</button>
            <img onclick="onEditChart('${chart.id}')" src="${chart.img}" alt="">
            </div>
        `
    })
    if (!charts || !charts.length) strHtmls = '<h1>So empty in here! create some charts! 😀'
    else strHtmls = strHtmls.join('');
    document.querySelector('.collection-gallery').innerHTML = strHtmls;
}

function onEditChart(chartId) {
    gChart = getChartById(chartId);
    gCurrImg = gChart.bgImg
    if (gCurrImg) loadImage(gCurrImg);
    gChartType = gChart.type;
    onShowEditor();
    setInputsVals(gChart);
    animateCharts();
}

function setInputsVals(chart) {
    var elValInputs = document.querySelectorAll('.data-value');
    var elTxtInputs = document.querySelectorAll('.data-name');
    var elClrInputs = document.querySelectorAll('.data-color');
    document.querySelector('#chart-types').value = chart.type;
    chart.inputs.forEach((input, idx) => {
        elValInputs[idx].parentElement.classList.remove('hidden');
        elValInputs[idx].value = input.realVal;
        elTxtInputs[idx].value = input.txt;
        elClrInputs[idx].value = input.clr;
    })
}

function animateCharts() {
    if (gIsAnimated) return;
    var inputs = getUserInput();
    var copyInputs = JSON.parse(JSON.stringify(inputs));
    copyInputs.forEach(input => {
        input.val = 0;
    })
    // startRecording()// WATCHOUT FOR THE RECORDER!
    gIsAnimated = true;
    var intervalID = setInterval(() => {
        clearCanvas();
        if (gCurrImg) drawImg() // WATCHOUT
        var changes = 0;
        copyInputs.forEach((input, idx) => {
            if (copyInputs[idx].val < inputs[idx].val) {
                input.val += 0.2;
                changes++;
            }
        })
        drawChart(copyInputs)
        if (!changes) {
            gIsAnimated = false;
            if (gRecorder) gRecorder.stop()
            clearInterval(intervalID)
        }
    }, 1);

}

// Downloading chart:
function onDownloadChart(elAnchor) {
    elAnchor.href = gElCanvas.toDataURL('image/png');
}

// Uploading background IMG section:

function onUploadImg(ev) {
    loadInputImage(ev, drawImg)
}
// TODO: FIX THE IMG WHEN LOADING CHART FROM COLLECTION
function loadInputImage(ev, drawImage) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image();
        img.onload = drawImage.bind(null, img);
        img.src = event.target.result;
        gCurrImg = img;
    }
    reader.readAsDataURL(ev.target.files[0]);
}

function loadImage(img) {
    gCurrImg = new Image();
    gCurrImg.src = img;
    gCurrImg.onload = () => {
        gCtx.drawImage(gCurrImg, 0, 0, gElCanvas.width, gElCanvas.height);
    };
}

function drawImg() {
    gCtx.drawImage(gCurrImg, 0, 0, gElCanvas.width, gElCanvas.height);
}

function onDeleteChart(chartId) {
    deleteChart(chartId);
    renderCollection();
}



// foreign code taken from stackoverflow
function startRecording() {
    const chunks = []; // here we will store our recorded media chunks (Blobs)
    const stream = gElCanvas.captureStream(); // grab our gCMediaStream
    gRecorder = new MediaRecorder(stream); // init the recorder
    // every time the recorder has new data, we will store it in our array
    gRecorder.ondataavailable = e => chunks.push(e.data);
    // only when the recorder stops, we construct a complete Blob from all the chunks
    gRecorder.onstop = () => {
        exportVid(new Blob(chunks, { type: 'video/webm' }));
    }
    gRecorder.start();
    // setTimeout(() => rec.stop(), 3000); // stop recording in 3s
}

function exportVid(blob) {
    console.log(blob);
    const vid = document.createElement('video');
    vid.src = URL.createObjectURL(blob);
    vid.controls = true;
    const elAnchor = document.querySelector('.vid-download');
    elAnchor.download = 'chartVid.webm';
    elAnchor.href = vid.src;
    elAnchor.classList.remove('hidden');
    gRecorder = null;
}

function onDownloadVid(ev) {
    ev.preventDefault();
    if (!getUserInput().length) return;
    startRecording();
    animateCharts();

}

function removeLink(elAnchor) {
    elAnchor.classList.add('hidden');
}


// *** Everything below is a Work in progress: ***

// function onTitleAdd() {
//     gChart.title = document.querySelector('.title-input').value;
// }



// function isTitleClicked(ev) {
//     const pos = getEvPos(ev);
//     const x = testingTxtPos.x;
//     const y = testingTxtPos.y
//     const length = testingTxtPos.txt.length * testingTxtPos.txtSize / 2;
//     const height = testingTxtPos.txtSize;
//     // const x = gChart.title.pos.x;
//     // const y = gChart.title.pos.y
//     // const length = gChart.title.txt.length * gChart.title.txtSize;
//     // const height = gChart.title.txtSize;
//     console.log((pos.x >= x && pos.x <= x + length && pos.y <= y && pos.y >= y - height))
//     return (pos.x >= x && pos.x <= x + length && pos.y <= y && pos.y >= y - height)
// }

// function addMouseListeners() {
//     // gElCanvas.addEventListener('mousedown', onDown)
//     // gElCanvas.addEventListener('mousemove', onMove)
//     // gElCanvas.addEventListener('mouseup', onUp)
//     gElCanvas.addEventListener('click', isTitleClicked)
// }

// function onDown(ev) {
//     const pos = getEvPos(ev)
//     if (!isTitleClicked(pos)) return
//     setCircleDrag(true)
//     gStartPos = pos
//     document.body.style.cursor = 'grabbing'

// }

// function onMove(ev) {
//     const circle = getCircle();
//     if (circle.isDrag) {
//         const pos = getEvPos(ev)
//         const dx = pos.x - gStartPos.x
//         const dy = pos.y - gStartPos.y
//         moveCircle(dx, dy)
//         gStartPos = pos
//         renderCanvas()
//     }
// }

// function onUp() {
//     setCircleDrag(false)
//     document.body.style.cursor = 'grab'
// }

// function getEvPos(ev) {
//     var pos = {
//         x: ev.offsetX,
//         y: ev.offsetY
//     }
//     // if (gTouchEvs.includes(ev.type)) {
//     //     ev.preventDefault()
//     //     ev = ev.changedTouches[0]
//     //     pos = {
//     //         x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
//     //         y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
//     //     }
//     // }
//     return pos
// }