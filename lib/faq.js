const fs = require('fs');
const marked = require('marked');

const convertFaq = () => {
    const markdown = fs.readFileSync('./markdown/FAQ.md', 'utf8');
    const template = fs.readFileSync('./templates/faq.html', 'utf8');
    const tokens = marked.lexer(markdown);

    const questions = [];
    let currentQuestion;
    let currentList;
    
    for(token of tokens) {
        switch(token.type) {
            case "heading":
                if(token.depth === 3) {
                    if(currentQuestion !== null) {
                        questions.push(currentQuestion);
                    }
                    currentQuestion = { text: token.text, children: [] };
                }
                break;
            case "paragraph":
                currentQuestion.children.push({ type: "paragraph", text: token.text });
                break;
            case "list_start":
                currentList = { type: "list", children: [] };
                break;
            case "list_end":
                currentQuestion.children.push(currentList);
                break;
            case "text":
                currentList.children.push(token.text);
                break;
        }
    }

    questions.push(currentQuestion);

    // console.log(JSON.stringify(questions, null, 2));

    let htmlOutput = '';
    const q = questions.map((question, index) => {
        if(index === 1) {
            htmlOutput += '<div class="handbook-section-wrapper w-container"> \n' +
            '<div class="hbook-title">What’s Telepat North about?</div> \n' +
            '<div class="handbook-col w-row"> \n' +
            '  <div class="hbook-col-left w-col w-col-6 w-col-stack"> \n' +
            '    <div class="hbook-txt">Telepat North is a private coder club centered around two main pillars:</div> \n' +
            '  </div> \n' +
            '  <div class="hbook-col-right w-col w-col-6 w-col-stack"></div> \n' +
            '</div> \n' +
            '<div class="handbook-col answer w-row"> \n' +
            '  <div class="hbook-col-left w-col w-col-6 w-col-stack"> \n' +
            '    <div class="hbook-txt light">Craft</div> \n' +
            '    <div class="hbook-txt">Members are owners, maintainers, and adherents of the The Telepat North Ethical, Professional and Personal Code for Extraordinary Coders.</div> \n' +
            '  </div> \n' +
            '  <div class="hbook-col-right learning w-col w-col-6 w-col-stack"> \n' +
            '   <div class="hbook-txt light">Permanent Learning</div> \n' +
            '    <div class="hbook-txt">Members are continuously engaged in personal development and share learnings with the community.</div> \n' +
            '  </div> \n' +
            '</div> \n' +
            '</div> \n';
        } else {
            // console.log(JSON.stringify(question, null, 2));
        }
    });

    // fs.writeFileSync('./build/faq.html', template.replace("<!--CONTENT-->",htmlOutput));

};

module.exports = { convertFaq };