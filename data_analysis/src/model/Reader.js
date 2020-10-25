import React, {Component} from "react";
import FileAnalyzer from "./FileAnalyzer";
import FrequencyDiagram from "../graph/FrequencyDiagram";
import css from "./reader.module.css";

export default class Reader extends Component {
    state = {
        filesInfo: [],
        hamWords: [],
        spamWords: [],
        hamMessagesLength: [],
        spamMessagesLength: [],
        isProceed: false
    }

    showFile = e => {
        this.setState({
            filesInfo: [],
            hamWords: [],
            spamWords: [],
            hamMessagesLength: [],
            spamMessagesLength: [],
            isProceed: true
        });
        Promise.all(this.readFilesAsPromises(Array.from(e.target.files)))
            .then(data => {
                this.proceedFilesAsPromises(data)
                    .then(data => this.setState(data.reduce((first, sec) => {
                        return {
                            hamWords: first.hamWords.concat(sec.hamWords),
                            spamWords: first.spamWords.concat(sec.spamWords),
                            hamMessagesLength: first.hamMessagesLength.concat(sec.hamMessagesLength),
                            spamMessagesLength: first.spamMessagesLength.concat(sec.spamMessagesLength)
                        }
                    })));
                this.setState({
                    filesInfo: data,
                    isProceed: false
                })
            });
    }

    proceedFilesAsPromises(data) {
        return Promise.all(data
            .map(file => new FileAnalyzer(file))
            .map(fileAnalyzer => {
                return new Promise((resolve => resolve(fileAnalyzer.analyzeFile())))
            }));
    }

    readFilesAsPromises = files => {
        return files.map(file => {
            return new Promise((resolve => {
                const fileReader = new FileReader();
                fileReader.onload = () => resolve({
                    fileName: file.name,
                    text: fileReader.result
                });
                fileReader.readAsText(file);
            }))
        });
    }

    getFrequencyMap = array => {
        return array.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    }

    getFrequencyByLengthMap = array => {
        return array.reduce((acc, e) => acc.set(e.length, (acc.get(e.length) || 0) + 1), new Map());
    }

    sortByEntries = array => {
        return Array.from(array.entries())
            .sort((a, b) => b[1] - a[1]);
    }

    render() {
        const hamFrequencies = this.sortByEntries(this.getFrequencyMap(this.state.hamWords));
        const spamFrequencies = this.sortByEntries(this.getFrequencyMap(this.state.spamWords));
        const hamFrequenciesByLength = this.sortByEntries(this.getFrequencyByLengthMap(this.state.hamWords));
        const spamFrequenciesByLength = this.sortByEntries(this.getFrequencyByLengthMap(this.state.spamWords));
        const hamMessagesFrequenciesByLength = this.sortByEntries(this.getFrequencyMap(this.state.hamMessagesLength));
        const spamMessagesFrequenciesByLength = this.sortByEntries(this.getFrequencyMap(this.state.spamMessagesLength));

        const topTwentyWordsByFrequency = "Top 20 words by frequency";
        const topWordsLength = "Top words length by frequency in symbols.";
        const topMessagesLength = "Top messages length by frequency in symbols.";
        
        return <>
            {!this.state.isProceed
                ? (
                    <>
                        <label className={css.readingArea}>Just click here and choose files to read
                            <input type="file" multiple={true} hidden={true} onChange={e => this.showFile(e)}/>
                        </label>
                    </>)
                : <h1>Proceed data, wait please</h1>
            }
            <div className={css.fullCanvas}>
                {hamFrequencies.length > 0 &&
                <div className={css.halfCanvas}>
                    <>HAM</>
                    <FrequencyDiagram
                        label={topTwentyWordsByFrequency}
                        params={Array.from(hamFrequencies.slice(0, 20).map(a => a[0]))}
                        data={Array.from(hamFrequencies.slice(0, 20).map(a => a[1]))}
                    />
                    <FrequencyDiagram
                        label={topWordsLength}
                        params={Array.from(hamFrequenciesByLength.map(a => a[0]))}
                        data={Array.from(hamFrequenciesByLength.map(a => a[1]))}
                    />
                    <FrequencyDiagram
                        label={topMessagesLength}
                        params={Array.from(hamMessagesFrequenciesByLength.map(a => a[0]))}
                        data={Array.from(hamMessagesFrequenciesByLength.map(a => a[1]))}
                    />
                </div>}
                {spamFrequencies.length > 0 &&
                <div className={css.halfCanvas}>
                    <>SPAM</>
                    <FrequencyDiagram
                        label={topTwentyWordsByFrequency}
                        params={Array.from(spamFrequencies.slice(0, 20).map(a => a[0]))}
                        data={Array.from(spamFrequencies.slice(0, 20).map(a => a[1]))}
                    />
                    <FrequencyDiagram
                        label={topWordsLength}
                        params={Array.from(spamFrequenciesByLength.slice(0, 20).map(a => a[0].length))}
                        data={Array.from(spamFrequenciesByLength.slice(0, 20).map(a => a[1]))}
                    />
                    <FrequencyDiagram
                        label={topMessagesLength}
                        params={Array.from(spamMessagesFrequenciesByLength.map(a => a[0]))}
                        data={Array.from(spamMessagesFrequenciesByLength.map(a => a[1]))}
                    />
                </div>}
            </div>
        </>;
    }
}