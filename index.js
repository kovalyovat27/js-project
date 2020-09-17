const state = {
    hamWordList: [],
    spamWordList: [],
    hamMessageLengthList: [],
    spamMessageLengthList: [],
}

const stemming = Object.values([
    { suf: 'ic', ending: 'ation', adding: 'ate' },
    { suf: 'ic', ending: 'ity', adding: '' },
    { suf: 'ic', ending: 'ally', adding: '' },
    { suf: 'at', ending: 'iv', adding: 'e' },
    { suf: 'at', ending: 'ive', adding: 'e' },
    { suf: 'at', ending: 'or', adding: 'ion' },
    { suf: 'iv', ending: 'ity', adding: 'e' },
    { suf: 'iv', ending: 'ly', adding: 'e' },
    { suf: 'able', ending: 'ity', adding: 'e' },
    { suf: 'able', ending: 'ly', adding: '' },
    { suf: 'abl', ending: 'ly', adding: 'e' },
    { suf: 'ous', ending: 'ly', adding: '' },
]);

const toRemoveArray = [];

function handleFiles(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        cleanData();
        Object.keys(files).forEach(i => {
            const file = event.target.files[i];
            if (file) {
                const fileName = file.name;
                const fileReader = new FileReader();
                fileReader.onload = function () {
                    var contents = fileReader.result;
                    if (fileName.endsWith(".csv")) {
                        proceedCsvText(contents);
                    } else {
                        proceedPEDFile(fileName, contents);
                    }
                    if (i == files.length - 1) {
                        drawGraphics();
                    }
                }
                fileReader.readAsText(file);
            }
        });
    }
}


function cleanData() {
    state.hamWordList = [];
    state.spamWordList = [];
    state.hamMessageLengthList = [];
    state.spamMessageLengthList = [];

    cleanOutputArea();
}

function proceedCsvText(csvText) {
    const phrasesArray = csvText.split(",,,");

    for (const key in phrasesArray) {
        phrase = phrasesArray[key].trim();
        if (phrase.startsWith('ham,')) {
            state.hamWordList = [...state.hamWordList, ...parsePhrase(phrase)];
            state.hamMessageLengthList = [...state.hamMessageLengthList, phrase.length];
        } else if (phrase.startsWith('spam,')) {
            state.spamWordList = [...state.spamWordList, ...parsePhrase(phrase)];
            state.spamMessageLengthList = [...state.spamMessageLengthList, phrase.length];
        } else {
            console.error(`This phrase '${phrase}' is not spam or ham`);
        }
    }
}

function proceedPEDFile(fileName, pedData) {
    if (fileName.endsWith("spam.txt")) {
        state.spamWordList = [...state.spamWordList, ...parsePhrase(pedData)];
        state.spamMessageLengthList = [...state.spamMessageLengthList, pedData.length];
    } else if (fileName.endsWith("ham.txt")) {
        state.hamWordList = [...state.hamWordList, ...parsePhrase(pedData)];
        state.hamMessageLengthList = [...state.hamMessageLengthList, pedData.length];
    }
}

function parsePhrase(phrase) {
    return phrase.replace(/[^a-zA-Z ]/g, '')
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(string => doStemming(string))
        .filter(el => !toRemoveArray.includes(el));
}

function doStemming(string) {
    stemming.forEach(elem => {
        const compositeEnding = elem.suf + elem.ending;
        if (string.length > elem.suf.length + elem.ending.length && string.endsWith(elem.suf + elem.ending)) {
            var n = string.lastIndexOf(compositeEnding);
            var pat = new RegExp(compositeEnding, 'i')
            return string.slice(0, n) + string.slice(n).replace(pat, elem.suf + elem.adding);
        }
        return string;
    });
    return string;
}

function convertArrayIntoFrequencyMap(array) {
    return array.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
}

function convertArrayIntoFrequencyMapByWordsLength(array) {
    return array.reduce((acc, e) => acc.set(e.length, (acc.get(e.length) || 0) + 1), new Map());
}

function buildFrequencyGraphByWords(hamFrequencyMap, spamFrequencyMap) {
    if (spamFrequencyMap && spamFrequencyMap.size > 0) {
        const frequencySpamArray = Array.from(spamFrequencyMap.entries());
        const spamAverage = frequencySpamArray.sort((a, b) => b[1] - a[1]).slice(0, 20);
        buildFrequencyChart(spamAverage, 'Top 20 SPAM words by frequency', 'top-spam-frequency-chart')
    }
    if (hamFrequencyMap && hamFrequencyMap.size > 0) {
        const frequencyHamArray = Array.from(hamFrequencyMap.entries());
        const hamAverage = frequencyHamArray.sort((a, b) => b[1] - a[1]).slice(0, 20);
        buildFrequencyChart(hamAverage, 'Top 20 HAM words by frequency', 'top-ham-frequency-chart');
    }
}

function buildFrequencyGraphByWordLength(hamFrequencyMap, spamFrequencyMap) {
    if (spamFrequencyMap && spamFrequencyMap.size > 0) {
        const averageValue = state.spamWordList.reduce((a, b) => !!a ? a += b.length : b.length, 0) / state.spamWordList.length;

        buildGraph(averageValue, spamFrequencyMap, 'SPAM', 'spam-average-length-chart');
    }
    if (hamFrequencyMap && hamFrequencyMap.size > 0) {
        const averageValue = state.hamWordList.reduce((a, b) => !!a ? a += b.length : b.length, 0) / state.hamWordList.length;

        buildGraph(averageValue, hamFrequencyMap, 'HAM', 'ham-average-length-chart')
    }

    function buildGraph(averageValue, frequencyMap, type, id) {
        const frequencyArray = Array.from(frequencyMap.entries());
        const sortedFrequencyArray = frequencyArray.sort((a, b) => b[1] - a[1]);

        buildFrequencyChart(sortedFrequencyArray, `Frequency by word length (${type} average: ${averageValue})`, id);
    }
}

function buildFrequencyGraphByMessageLength(hamFrequencyMap, spamFrequencyMap) {
    if (spamFrequencyMap && spamFrequencyMap.size > 0) {
        const averageValue = state.spamMessageLengthList.reduce((a, b) => !!a ? a += b : b, 0) / state.spamMessageLengthList.length;

        buildGraph(averageValue, spamFrequencyMap, 'SPAM', 'spam-average-sequence-length');
    }
    if (hamFrequencyMap && hamFrequencyMap.size > 0) {
        const averageValue = state.hamMessageLengthList.reduce((a, b) => !!a ? a += b : b, 0) / state.hamMessageLengthList.length;

        buildGraph(averageValue, hamFrequencyMap, 'HAM', 'ham-average-sequence-length');
    }

    function buildGraph(averageValue, frequencyMap, type, id) {
        const frequencyArray = Array.from(frequencyMap.entries());
        const sortedFrequencyArray = frequencyArray.sort((a, b) => b[1] - a[1]);

        buildFrequencyChart(sortedFrequencyArray, `Frequency by message length (${type} average: ${averageValue})`, id);
    }
}

/** Draws ui functions */

function insertHtmlData() {
    const element = document.getElementById('output');
    element.innerHTML = `<div class="row border border-primary">
            <h2 class="col-12 text-center">Frequencies graphic</h2>
            <hr>
            <div class="col-2"></div>
            <div class="col-8">
                <canvas id="top-ham-frequency-chart"></canvas>
                <canvas id="top-spam-frequency-chart"></canvas>
                <canvas id="ham-average-length-chart"></canvas>
                <canvas id="spam-average-length-chart"></canvas>
                <canvas id="ham-average-sequence-length"></canvas>
                <canvas id="spam-average-sequence-length"></canvas>
            </div>
            <div class="col-2"></div>
        </div>`;
}

function cleanOutputArea() {
    const element = document.getElementById('output');
    element.innerHTML = ``;
}

function buildFrequencyChart(freqValues, title, elementId) {
    new Chart(document.getElementById(elementId), {
        type: 'bar',
        data: {
            labels: Array.from(freqValues.map(a => a[0])),
            datasets: [
                {
                    label: "value",
                    backgroundColor: ["#3e95cd"],
                    data: Array.from(freqValues.map(a => a[1]))
                }
            ]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: title
            }
        }
    });
}

function drawGraphics() {
    const hamFrequencyMap = convertArrayIntoFrequencyMap(state.hamWordList);
    const spamFrequencyMap = convertArrayIntoFrequencyMap(state.spamWordList);
    const hamFrequencyLengthMap = convertArrayIntoFrequencyMapByWordsLength(state.hamWordList);
    const spamFrequencLengthyMap = convertArrayIntoFrequencyMapByWordsLength(state.spamWordList);
    const hamMessFrequencyLengthMap = convertArrayIntoFrequencyMap(state.hamMessageLengthList);
    const spamMessFrequencyLengthMap = convertArrayIntoFrequencyMap(state.spamMessageLengthList);

    insertHtmlData();
    buildFrequencyGraphByWords(hamFrequencyMap, spamFrequencyMap);
    buildFrequencyGraphByWordLength(hamFrequencyLengthMap, spamFrequencLengthyMap);
    buildFrequencyGraphByMessageLength(hamMessFrequencyLengthMap, spamMessFrequencyLengthMap);
}

document.getElementById('inputfile').addEventListener('change', handleFiles, false);