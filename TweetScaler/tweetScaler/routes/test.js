var Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");
const express = require('express');
const aposToLexForm = require('apos-to-lex-form');
const natural = require('natural');
const router = express.Router();
const fs = require('fs');
const wordListPath = require('word-list');
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');

const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');

const corpus = [];
wordArray.forEach((word) => {
    corpus.push(word);
})
const spellcheck = new natural.Spellcheck(corpus);
const { WordTokenizer } = natural;
const tokenizer = new WordTokenizer();



const tweet = 'RT @narendramodi: Great nwes! Am told that after the mandatory quarantine, 2 cheetahs have been released to a bigger enclosure for further…'

function getSpellcheck(string){
    const lexedTweet = aposToLexForm(string);
    const casedTweet = lexedTweet.toLowerCase();
    const alphaOnlyTweet = casedTweet.replace(/[^a-zA-Z0-9]/g,' ');
    const tokenizedTweet = tokenizer.tokenize(alphaOnlyTweet);
    tokenizedTweet.forEach((word) => {
        const bool = spellcheck.isCorrect(word);
        const corr = spellcheck.getCorrections(word, 1);
        const checked = {
            "word": word,
            "isCorrect": bool,
            "correcrions": corr
        }
        return checked;
    });
}
console.log(getSpellcheck(tweet));

const lexedTweet = aposToLexForm(tweet);
const casedTweet = lexedTweet.toLowerCase();
const alphaOnlyTweet = casedTweet.replace(/[^a-zA-Z0-9]/g,' ');
const tokenizedTweet = tokenizer.tokenize(alphaOnlyTweet);
tokenizedTweet.forEach((word, index) => {
    console.log(spellcheck.isCorrect(word)); // false
    console.log(spellcheck.getCorrections(word, 1)); // ['something']
    //console.log(spellcheck.getCorrections(word, 2)); // ['something', 'soothing']
});



