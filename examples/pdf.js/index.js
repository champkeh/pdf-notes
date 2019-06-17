// 
// Basic node example that prints document metadata and text content.
// Requires single file built version of PDF.js
// 

const path = require('path');
const pdfjsLib = require('pdfjs-dist');

// Loading file from file system into typed array
const pdfPath = process.argv[2] || path.join(__dirname, '..', 'files', 'invoice.pdf');

// Will be using promises to load document, pages and misc data instead of callback.
const loadingTask = pdfjsLib.getDocument(pdfPath);
loadingTask.promise.then(function(doc) {
    const numPages = doc.numPages;
    console.log('# Document Loaded');
    console.log('Number of Pages: ' + numPages);
    console.log();

    let lastPromise;
    lastPromise = doc.getMetadata().then(function(data) {
        console.log('# Metadata Is Loaded');
        console.log('## Info');
        console.log(JSON.stringify(data.info, null, 2));
        console.log();
        if (data.metadata) {
            console.log('## Metadata');
            console.log(JSON.stringify(data.metadata.getAll(), null, 2));
            console.log();
        }
    });

    let loadPage = function(pageNum) {
        return doc.getPage(pageNum).then(function (page) {
            console.log('# Page ' + pageNum);
            let viewport = page.getViewport({ scale: 1.0 });
            console.log(viewport);
            console.log('Size: ' + viewport.width + 'x' + viewport.height);
            console.log();
            return page.getTextContent().then(function (content) {
                // Content contains lots of information about the text layout and
                // styles, but we need only strings at the moment
                let strings = content.items.map(function (item) {
                    return item.str;
                });
                console.log('## Text Content');
                console.log(strings.join(' '));
            }).then(function () {
                console.log();
            });
        });
    };

    // Loading of the first page will wait on metadata and subsequent loadings
    // will wait on the previous pages.
    for (let i = 1; i <= numPages; i++) {
        lastPromise = lastPromise.then(loadPage.bind(null, i));
    }

    return lastPromise;
}).then(function () {
    console.log('# End of Document');
}, function (err) {
    console.error('Error: ' + err);
});