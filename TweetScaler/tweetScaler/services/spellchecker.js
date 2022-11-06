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
let spellcheckList = [{
    word: "word", 
    isCorrect: "bool", 
    corrections: []
}];
const corpus = [];
wordArray.forEach((word) => {
    corpus.push(word);
})

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();
const spellcheck = new natural.Spellcheck(corpus);
const { WordTokenizer } = natural;
const tokenizer = new WordTokenizer();



module.exports = {
    getSpellcheck(tweet){
        const lexedTweet = aposToLexForm(tweet);
        const casedTweet = lexedTweet.toLowerCase();
        const alphaOnlyTweet = casedTweet.replace(/[^a-zA-Z0-9]/g,' ');
        const tokenizedTweet = tokenizer.tokenize(alphaOnlyTweet);
        tokenizedTweet.forEach((word, index) => {
            console.log(spellcheck.isCorrect(word));
            console.log(spellcheck.getCorrections(word, 1));
        });
    }
}