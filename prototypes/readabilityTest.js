var request = require('sync-request');
var JSDOM = require('jsdom').JSDOM;
var Readability = require('../readability.js');

//const scrapeUrl = "https://news.ycombinator.com/item?id=19328451";
const scrapeUrl = "https://zedshaw.com/archive/the-master-the-expert-the-programmer";

var res = request('GET', scrapeUrl);
var doc = new JSDOM(res.body,  {
  url: scrapeUrl,
});
let reader = new Readability(doc.window.document);
let article = reader.parse();

console.log(article);

if(article) {
console.log(article.title);
console.log(article.content);
}


