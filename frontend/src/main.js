import { BrowserOpenURL } from "../wailsjs/runtime/runtime.js";
import { SaveMdFile } from "../wailsjs/go/main/App.js";
import { OpenMdFile } from "../wailsjs/go/main/App.js";
import markdownit from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownitSup from "markdown-it-sup";
import markdownitSub from "markdown-it-sub";
import markdownitMark from "markdown-it-mark"
import markdownitDeflist from "markdown-it-deflist";
import markdownitIns from "markdown-it-ins";
import markdownitAbbr from "markdown-it-abbr";
import { full as emoji } from "markdown-it-emoji";
import hljs from "highlight.js"
import "highlight.js/styles/nord.css";

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
const mdContainer = document.getElementById("mdContainer");
const mdText = document.getElementById("mdText");
const copyButton = document.getElementById("copyBtn");   
const copyStatus = document.getElementById("copyStatus"); 
const saveButton = document.getElementById("saveBtn");
const openButton = document.getElementById("openBtn");

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

copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(plainText.innerText);

        copyStatus.classList.remove("opacity-0", "-translate-y-2");
        copyStatus.classList.add("opacity-100", "translate-y-0");

        setTimeout(() => {
            copyStatus.classList.remove("opacity-100", "translate-y-0");
            copyStatus.classList.add("opacity-0", "-translate-y-2");
        }, 2000);
    } catch (err) {
        console.error("Failed to copy text:", err);
        alert("Failed to copy text.");
    }
});

saveButton.addEventListener("click", async () =>{
    await SaveMdFile(plainText.innerText);
});

openButton.addEventListener("click", async () =>{
    const file = await OpenMdFile();
    plainText.innerText = file;
    autoConvert();
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


// Sync scroll
let isSyncingScroll = false;

function syncScroll(src, target) {
    if (isSyncingScroll) return;

    isSyncingScroll = true;

    const scrollTopRatio = src.scrollTop / (src.scrollHeight - src.clientHeight);
    const scrollLeftRatio = src.scrollLeft / (src.scrollWidth - src.clientWidth);

    target.scrollTop = scrollTopRatio * (target.scrollHeight - target.clientHeight);
    target.scrollLeft = scrollLeftRatio * (target.scrollWidth - target.clientWidth);

    setTimeout(() => { isSyncingScroll = false; }, 50);

}

plainText.addEventListener("scroll", () => syncScroll(plainText, mdContainer));
mdContainer.addEventListener("scroll", () => syncScroll(mdContainer, plainText));