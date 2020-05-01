//To run:
//node read.js -l sample.txt -o output.epub -t "HN Test" -d "This book is a test"

//TODO:
//Medium specific bug - look at safari read only mode - it's picking up thumbnails
//- source: https://medium.com/@kentbeck_7670/decisions-decisions-or-why-baskets-of-options-dominate-9ac63658b593
//- thumbnail: https://miro.medium.com/max/60/1*JH5aU60tco7n5WG0dxPD-w.png?q=20
//- actual: https://miro.medium.com/max/4916/1*JH5aU60tco7n5WG0dxPD-w.png?q=20
//Overlay book title onto cover image

const args = require('minimist')(process.argv.slice(2));
const request = require('sync-request');
const JSDOM = require('jsdom').JSDOM;
const readability = require('./index.js');
const Readability = readability.Readability;
const EPub = require('epub-gen'); 
const fs = require('fs');
const path = require('path');
const getUrls = require('get-urls');
const urlP = require('url');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const tempDir = './tempDir';
if (!fs.existsSync(tempDir)){
    fs.mkdirSync(tempDir);
}

const domains = ["amazon.com","google.com","twitter.com","b-ok.cc","b-ok.xyz","libgen.io","libgen.is","facebook.com","youtube.com","vimeo.com","instagram.com","bookface.ycombinator.com","github.com"];

//args.l = textfile containing the links
//args.o = output epub file
//args.t = title of book
//args.d = description of book

if(!args.l) {
    console.log("-l links.txt");
    process.exit(-1);
}
if(!args.o) {
    console.log("-o output.epub");
    process.exit(-1);
}
if(!args.t) {
    console.log("-t 'title of book'");
    process.exit(-1);
}
if(!args.d) {
    console.log("-d 'Book about life advice'");
    process.exit(-1);
}

const linksFile = args.l;
const outputFile = args.o;
const bookTitle = args.t;
const bookDesc = args.d;

let contents = fs.readFileSync(linksFile, 'utf8');
//Clean up work
contents = contents.replace(/\([^\)]*\)/g,'');
contents = contents.replace(/\[/g,'');
contents = contents.replace(/\]/g,'');
//console.log(contents);

const urls = getUrls(contents);
//console.log(urls);

let q = [];
let firstChapter = { "title": "About Book: " + bookTitle, "data": "<p>" + bookDesc + "</p>" };
q.push(firstChapter);

//Get cool random cover art for the book!
const coverUrl = "https://picsum.photos/750/1000";
const covRes = getRes(coverUrl);
const coverImage = covRes.url;

urls.forEach(function(url) {
    let res = getRes(url);
    let obj = getObj(url, res);

    //skip if url download or readability fails
    if(obj.fail) { 
        return;
    }

    //special case - it's a HN link - we need to resolve the final link
    if(url.match(/\/item\?id=/)) {
        let resContent = res.body.toString('utf8');
        // test for link match
        //<a href="https://dariusforoux.com/skill-stacking/" class="storylink">
        let linkMatch = resContent.match(/<a href=\"(http[^\"]*)\" class=\"storylink\">/);
        if(linkMatch) {
            let storylink = linkMatch[1];
            let storyRes = getRes(storylink);
            let storyObj = getObj(storylink, storyRes);

            //skip if url download or readability fails
            if(storyObj.fail) { 
                //console.log("SKIP - " + url);
                return;
            }
            else {
                //extract the actual link
                //push actual link into quue
                //console.log(storyObj);
                q.push(storyObj);
            }
        }
    }

    //Push the hacker news url into queue
    //console.log(obj);
    q.push(obj);

});

//download them all one by one
function getRes(url) {
    console.log("Requesting - " + url);

    //Domain Blacklist skip
    const myURL = urlP.parse(url);
    let fail = 0;
    domains.forEach(function(domain) {
        let re = new RegExp(domain, 'g');
        if(myURL.hostname.match(re)) {
        fail = 1;
        }
    });
    if(fail) {
        console.log("Domain blacklist - skipping " + myURL.hostname);
        return { "fail": 1 };
    }

    //PDF Skip
    if(url.match(/\.pdf/i)) {
        console.log("Skipping PDF - " + url);
        return { "fail": 1 };
    }

    let res;
    try {
    res = request('GET', url);
    }
    catch(err) {
        console.log("Failed to request - " + url);
        return { "fail": 1 };
    }

    //TODO: Check for status code? >=400??

    return res;
}

//readability
function getObj(url, res) {
    let obj = {};
    if(res.fail) return { "fail": 1 };

    let body = res.body.toString('utf8');
    body = entities.decode(body);

    let doc, reader, article;
    doc = new JSDOM(body, { url: url }); //not catchin error - probably because it's async - grr

    try {
    reader = new Readability(doc.window.document);
    article = reader.parse();
    }
    catch(err) {
        console.log("Failed to readability parse - " + url);
        return { "fail": 1 };
    }

    if(!article) {
        console.log("Failed to extract anything - " + url);
        return { "fail": 1 };
    }

    obj.title = article.title + " - " + url;
    obj.data = article.content;
    console.log("Title = " + obj.title);

    return obj;

}

//inject into epub
//generate epub
const bookOptions  = {
    title: bookTitle,
    author: "netvarun",
    publisher: "Varun Publishers",
    cover: coverImage,
    version: 3,
    content: q
};

new EPub(bookOptions, path.resolve(__dirname, tempDir + '/' + outputFile)).promise.then(function() {
        return console.log(`${options.title} is generated successfully`);
});



