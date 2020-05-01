var request = require('sync-request');
var JSDOM = require('jsdom').JSDOM;
var Readability = require('./readability.js');
var EPub, optionsAlice, path;

  EPub = require("epub-gen"); 

  path = require("path");

const scrapeUrl1 = "https://raihansaputra.com/hn-wisdom/";
const scrapeUrl2 = "https://news.ycombinator.com/item?id=18891069";

var res1 = request('GET', scrapeUrl1);
var doc1 = new JSDOM(res1.body,  {
  url: scrapeUrl1,
});
let reader1 = new Readability(doc1.window.document);
let article1 = reader1.parse();


var res2 = request('GET', scrapeUrl2);
var doc2 = new JSDOM(res2.body,  {
  url: scrapeUrl2,
});
let reader2 = new Readability(doc2.window.document);
let article2 = reader2.parse();


  optionsAlice = {
    title: "Life Advice",
    author: "netvarun",
    publisher: "Hacker News Publishers",
    cover: "http://orig10.deviantart.net/e272/f/2013/255/0/0/alice_in_wonderland_book_cover_by_pannucabaguana-d6m003p.jpg", // url or path
    version: 3,
content: [
      {
        title: "HN Advice",
        data: article1.content
      },
      {
        title: "Hacker News Real",
        data: article2.content
      }
]};
 new EPub(optionsAlice, path.resolve(__dirname, "./tempDir/book.epub")).promise.then(function() {
    return console.log(`${options.title} is generated successfully`);
  });



