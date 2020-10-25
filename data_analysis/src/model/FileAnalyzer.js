import {doStemming, isWordShouldBeRemoved} from "./utils";

export default class FileAnalyzer {
    constructor(file) {
        this.file = file;
        this.state = {
            hamWords: [],
            spamWords: [],
            hamMessagesLength: [],
            spamMessagesLength: [],
        }
    }

    analyzeFile = () => {
        if (this.file.fileName.endsWith(".csv")){
            this.analyzeCSVFile(this.file);
        } else {
            this.analyzePEDFile(this.file)
        }
        return this.state;
    }

    analyzeCSVFile = file => {
        const fileText = file.text;
        const phrasesArray = fileText.split(",,,");

        phrasesArray
            .map(value => value.trim())
            .forEach(phrase => {
                if (phrase.startsWith('ham,')) {
                    this.setHamData(phrase);
                } else if (phrase.startsWith('spam,')) {
                    this.setSpamData(phrase);
                }
            });
    }

    analyzePEDFile = file => {
        const fileName = file.fileName.toUpperCase();
        const pedData = file.text;
        if (fileName.endsWith(".SPAM.TXT")) {
            this.setSpamData(pedData);
        } else if (fileName.endsWith(".HAM.TXT")) {
            this.setHamData(pedData);
        }
    }

    setSpamData = phrase => {
        this.state.spamWords = [...this.state.spamWords, ...this.parsePhrase(phrase)];
        this.state.spamMessagesLength = [...this.state.spamMessagesLength, phrase.length];
    }

    setHamData = phrase => {
        this.state.hamWords = [...this.state.hamWords, ...this.parsePhrase(phrase)];
        this.state.hamMessagesLength = [...this.state.hamMessagesLength, phrase.length];
    }

    parsePhrase = phrase => {
        return phrase.replace(/[^a-zA-Z ]/g, '')
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .map(string => doStemming(string))
            .filter(el => !isWordShouldBeRemoved(el));
    }
}