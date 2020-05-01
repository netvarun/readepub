var request = require('sync-request');
var JSDOM = require('jsdom').JSDOM;
var Readability = require('../readability.js');
var EPub, optionsAlice, path;

  EPub = require("epub-gen"); 

  path = require("path");

if (process.argv.length <= 2) {
    console.log("Usage: node epubBug.js url");
    process.exit(-1);
}
const scrapeUrl1 = process.argv[2];

var res1 = request('GET', scrapeUrl1);
var doc1 = new JSDOM(res1.body,  {
  url: scrapeUrl1,
});
let reader1 = new Readability(doc1.window.document);
let article1 = reader1.parse();

console.log(article1.content);

  optionsAlice = {
    title: "Bug Test",
    author: "netvarun",
    publisher: "Hacker News Publishers",
    version: 3,
content: [
      {
        title: article1.title,
        data: article1.content
      },
]};
 new EPub(optionsAlice, path.resolve(__dirname, "./bug.epub")).promise.then(function() {
    return console.log(`${options.title} is generated successfully`);
  });



