const stemming = [
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
    { suf: 'e', ending: 's', adding: ''}
];

const toRemoveArray = [];

export function doStemming (word) {
    const stemmingPattern = stemming.find(elem => {
        const compositeEnding = elem.suf + elem.ending;
        return word.length > compositeEnding.length && word.endsWith(compositeEnding);
    })
    if (stemmingPattern){
        const compositeEnding = stemmingPattern.suf + stemmingPattern.ending;
        return word.slice(0, word.lastIndexOf(compositeEnding)) + stemmingPattern.suf + stemmingPattern.adding
    }
    return word;
}

export function isWordShouldBeRemoved(word) {
    return toRemoveArray.includes(word);
}