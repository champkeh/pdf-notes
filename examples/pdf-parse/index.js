const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// default render callback
function render_page(pageData) {
    // check documents https://mozilla.github.io/pdf.js/
    let render_options = {
        normalizeWhhitespace: false,
        disableCombineTextItems: false,
    }

    return pageData.getTextContent(render_options)
        .then(textContent => {
            let lastY, text = '';
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY) {
                    text += item.str;
                } else {
                    text += '\n' + item.str;
                }
                lastY = item.transform[5];
            }
            return text;
        });
}

let options = {
    pagerender: render_page
}

let dataBuffer = fs.readFileSync(path.join(__dirname, '../files/invoice.pdf'));

pdf(dataBuffer, options).then(data => {
    console.log(data.text);
});