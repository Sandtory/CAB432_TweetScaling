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

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();


module.exports = {
    analyzeTweet(tweet){
    //const { tweet } = req.body;
    const lexedTweet = aposToLexForm(tweet);
    const casedTweet = lexedTweet.toLowerCase();
    const alphaOnlyTweet = casedTweet.replace('/[^a-zA-Z\s]+/g', '');
  
    const { WordTokenizer } = natural;
    const tokenizer = new WordTokenizer();
    const tokenizedTweet = tokenizer.tokenize(alphaOnlyTweet);
  
    tokenizedTweet.forEach((word, index) => {
      tokenizedTweet[index] = spellCorrector.correct(word);
    })
    const filteredTweet = SW.removeStopwords(tokenizedTweet);
  
    const { SentimentAnalyzer, PorterStemmer } = natural;
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const analysis = analyzer.getSentiment(filteredTweet);
  
    return analysis;
    }
};