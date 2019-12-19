const fs = require('fs');
const marked = require('marked');

const convertTelepatCode = () => {
    const code = fs.readFileSync('./markdown/README.md', 'utf8');
    const htmlCodeMaster = fs.readFileSync('./templates/the-code.html', 'utf8');
    const tokens = marked.lexer(code);
    let reachedStartToken = false;
    let alignListRight = false;
    let isBlackSection = false;
    let isFirstSection = true;
    let row_started = false;
    let output = "\n";

    for(token of tokens) {
        if(!reachedStartToken && token.type!== "hr") continue;
        switch(token.type) {
            case "hr":
                if(!reachedStartToken) {
                    reachedStartToken = true;
                }
                break;
            case "heading": 
                if(token.depth === 3) {
                    if(!isFirstSection) {
                        isBlackSection = !isBlackSection;
                        output += `</div>\n</div>\n`
                    }
                    isFirstSection = false;
                    alignListRight = false;
                    if(row_started) {
                        output += `</div> \n`;
                    }
                    let elementOutput = `<div class="principles-section ${isBlackSection?'dark':''}"> \n` +
                    `<div class="principles-wrapper w-container"> \n`+
                    `   <div class="code-title-col w-row"> \n`+
                    `       <div class="code-title-col-left ${isBlackSection?'pro':''} w-col w-col-6 w-col-stack"> \n`+
                    `           <div class="code-title ${isBlackSection?'light':''}">${token.text}</div> \n` +
                    `   </div> \n` +
                    `   <div class="code-title-col-right w-col w-col-6 w-col-stack"> \n` +
                    `       <div class="section-divider principles"></div> \n` +
                    `   </div> \n` +
                    `</div> \n`;
                    output += elementOutput;
                } else if(token.depth === 4) {
                    let elementOutput;
                    if(!alignListRight) {
                        elementOutput = `<div class="code-col w-row"> \n` +
                        `<div class="code-col-left w-col w-col-6 w-col-stack"> \n ` +
                        `<div class="code-item-title ${isBlackSection?'light':''}">${token.text}</div> \n`;
                        row_started = true;
                    } else {
                        elementOutput = `<div class="code-col-right w-col w-col-6 w-col-stack"> \n` +
                        `<div class="code-item-title ${isBlackSection?'light':''}">${token.text}</div> \n`;
                    }
                    output += elementOutput;
                }
                break;
            case "text":
                let elementOutput = `<div class="code-item"> \n` +
                `<div class="code-item-dot ${isBlackSection?'light':''}"></div> \n` +
                `<div class="code-item-txt ${isBlackSection?'light':''}">${token.text}</div> \n`+
                `</div> \n`;
                output += elementOutput;
                break;
            case "list_end":
                if(alignListRight) {
                    output += `</div>\n</div>\n`;
                    row_started = false; 
                }
                else output += `</div> \n`;
                alignListRight = !alignListRight;
                break;
            case "list_item_end":
            case "list_start":
            case "space":
                break;
        }
    }

    fs.writeFileSync('./build/the-code.html', htmlCodeMaster.replace("<!--CONTENT-->",output));
};

module.exports = { convertTelepatCode };