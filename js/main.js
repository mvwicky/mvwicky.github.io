'use strict';
const DEBUG = false;

function log(...args) {
    DEBUG && console.log(...args);
}

function fnMouseOver(event) {
    log(event.target.parentElement);
    let href = event.target.getAttribute('href');
    let li = document.getElementById(href.slice(1));
    let txt = li.querySelector('p').innerHTML;
    event.target.innerHTML = txt;
}

function fnMouseOut(event) {
    let href = event.target.getAttribute('href');
    let num = href.split(':')[1];
    let a = document.createElement('a');
    a.setAttribute('href', href);
    a.setAttribute('class', 'footnote');
    a.appendChild(document.createTextNode(num));
    log(a);
    let sup = document.getElementById(`fnref:${num}`);
    sup.innerHTML = '';
    sup.appendChild(a);
}

function main(e) {
    let footnotes = document.querySelectorAll('.footnote');
    Array.from(footnotes).forEach(function(fn) {
        fn.addEventListener('mouseover', fnMouseOver);
        fn.addEventListener('mouseout', fnMouseOut);
    });
}
// window.addEventListener('load', main);
