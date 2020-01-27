const fs = require('fs');
const marked = require('marked');

const convertHandbook = () => {
    const markdown = fs.readFileSync('./markdown/HANDBOOK.md', 'utf8');
    const template = fs.readFileSync('./templates/the-handbook.html', 'utf8');
    const tokens = marked.lexer(markdown);
    
    let currentListLevel = -1;
    let currentSection = -1;
    let listCounters = [-1,-1,-1];
    let handbookSections = [];

    for(token of tokens) {
        switch(token.type) {
            case "heading": 
                if(token.depth === 2) continue;
                if(token.depth === 3) {
                    currentListLevel = -1;
                    currentSection ++;
                    listCounters = [-1,-1,-1];
                    handbookSections.push( { text: token.text, children: [] });
                }
                break;
            case "list_start":
                currentListLevel ++;
                break;
            case "list_end":
                listCounters[currentListLevel] = -1;
                currentListLevel --;
                break;
            case "text":
                const slackRegex = /#[a-zA-Z0-9\-]+/g;
                const matches = token.text.toString().match(slackRegex);
                if(matches) {
                    for(match of matches) {
                        token.text = token.text.replace(match, `<span class="inline-bold color">${match}</span>`);
                    }
                    token.text = token.text.replace(/`/g,"");
                }
                switch(currentListLevel) {
                    case 0:
                        handbookSections[currentSection].children.push({ text: token.text, children: [] });
                        listCounters[0] ++;
                        break;
                    case 1:
                        handbookSections[currentSection].children[listCounters[0]].children.push({ text: token.text, children: [] });
                        listCounters[1] ++;
                        break;
                    case 2:
                        handbookSections[currentSection].children[listCounters[0]].children[listCounters[1]].children.push({ text: token.text });
                        break;
                    default:
                        break;
                }
                break;
            default: 
                break;
        }
    }
    
    let htmlOutput = '';

    for(index in handbookSections) {
        const section = handbookSections[index];
        const sectionSize = section.children.length;
        const leftElements = Math.ceil(sectionSize / 2.0);
        handbookSections[index].left = handbookSections[index].children.slice(0, leftElements);
        handbookSections[index].right = handbookSections[index].children.slice(leftElements);
        delete handbookSections[index].children;
    }

    const renderColumn = (level1List) => {
        htmlOutput += `<div class="hbook-header">${level1List.text}</div> \n`;
        if(level1List.children.length > 0) {
            htmlOutput += `<div class="hbook-items"> \n`;
            for(level2List of level1List.children) {
                htmlOutput += `<div class="hbook-item"> \n` +
                `<div class="code-item-dot"></div> \n` +
                `<div class="hbook-txt">${level2List.text}</div> \n` +
                `</div> \n`;
                if(level2List.children.length > 0) {
                    htmlOutput += `<div class="hbook-list"> \n`;
                    for(level3List of level2List.children) {
                        htmlOutput += `<div class="hbook-item"> \n` +
                        `<div class="code-item-dot list"></div> \n` +
                        `<div class="hbook-txt list">${level3List.text}</div> \n` +
                        `</div> \n`;
                    }
                    htmlOutput += `</div> \n`;
                }
            }
            htmlOutput += `</div> \n`;
        }
    };

    for (section of handbookSections) {
        htmlOutput += `<div class="handbook-section-wrapper w-container"> \n` +
        `<div class="hbook-title">${section.text}</div> \n` +
        `<div class="handbook-col w-row"> \n` +
        `<div class="hbook-col-left w-col w-col-6 w-col-stack"> \n`;
        for(level1List of section.left) {
            renderColumn(level1List);
        }
        htmlOutput += '</div> \n';

        if(section.right.length > 0) {
            htmlOutput += `<div class="hbook-col-right w-col w-col-6 w-col-stack"> \n`;
            for(level1List of section.right) {
                renderColumn(level1List);
            }
            htmlOutput += `</div> \n`;
        }
        
        htmlOutput += '</div> \n</div> \n';
    }
    fs.writeFileSync('./build/the-handbook.html', template.replace("<!--CONTENT-->",htmlOutput));
};
module.exports = { convertHandbook };