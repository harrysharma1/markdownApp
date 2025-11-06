import {BrowserOpenURL} from "../wailsjs/runtime/runtime.js";
import markdownit from "markdown-it";
import hljs from "highlight.js"
import "highlight.js/styles/atom-one-dark.css";

// Set up global variables
const md = markdownit(
    {
        html: true,
        linkify: true,
        typographer: true,
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
    });
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
        const tabNode = document.createTextNode("    ");
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

// Conversion
function convertToMd(){
    const htmlOutput = md.render(plainText.innerHTML);
    mdText.innerHTML = htmlOutput;
}
document.getElementById("convertBtn").addEventListener("click", convertToMd);