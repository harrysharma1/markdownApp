import {BrowserOpenURL} from "../wailsjs/runtime/runtime.js";
import markdownit from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownitSup from "markdown-it-sup";
import markdownitSub from "markdown-it-sub";
import markdownitMark from "markdown-it-mark"
import markdownitDeflist from "markdown-it-deflist";
import markdownitIns from "markdown-it-ins";
import markdownitAbbr from "markdown-it-abbr";
import {full as emoji} from "markdown-it-emoji";
import hljs from "highlight.js"
import "highlight.js/styles/github.css";

// Set up global variables
const md = markdownit(
    {
        html: true,
        linkify: true,
        typographer: true,
        breaks: true,
        highlight:  function(str, lang){
            if (lang && hljs.getLanguage(lang)){
                try{
                    return(
                        '<pre class="hljs"><code>' + 
                        hljs.highlight(str, {language:lang, ignoreIllegals:true}).value + 
                        "</code></pre>"
                    );
                }catch (_){}
            }
            return (
                '<pre class="hljs"><code>' +
                md.utils.escapeHtml(str) +
                "</code></pre>"
            );
        },
    })
    .use(markdownItFootnote)
    .use(emoji)
    .use(markdownitSup)
    .use(markdownitSub)
    .use(markdownitMark)
    .use(markdownitIns)
    .use(markdownitDeflist)
    .use(markdownitAbbr);
const plainText = document.getElementById("plainText");
const mdText = document.getElementById("mdText");

// Event listeners
document.addEventListener("click", (event)=>{
    const target = event.target.closest("a");
    if(target && target.href.startsWith("http")){
        event.preventDefault();
        BrowserOpenURL(target.href);
    }
});

plainText.addEventListener("keydown", (event) =>{
    if(event.key === "Tab"){
        event.preventDefault();
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const tabNode = document.createTextNode("  ");
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

// Auto Conversion
function debounce(fn, delay=200){
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(()=>fn(...args), delay);
    };
}

const autoConvert = debounce(()=>{
    const htmlOutput = md.render(plainText.innerText);
    console.log(htmlOutput);
    mdText.innerHTML = htmlOutput;
}, 200);

plainText.addEventListener("input", autoConvert);

// Manual Conversion
function convertToMd(){
    const htmlOutput = md.render(plainText.innerText);
    console.log(htmlOutput);
    mdText.innerHTML = htmlOutput;
}
document.getElementById("convertBtn").addEventListener("click", convertToMd);