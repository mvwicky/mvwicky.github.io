'use strict';
const DEBUG = true;

function log(...args) {
  DEBUG && console.log(...args);
}

function byId(id) {
  return document.getElementById(id);
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

function handleFootnotes(e) {
  let footnotes = document.querySelectorAll('.footnote');
  Array.from(footnotes).forEach((fn) => {
    fn.addEventListener('mouseover', fnMouseOver);
    fn.addEventListener('mouseout', fnMouseOut);
  });
}

function print_style(elem, prop) {
  let style = window.getComputedStyle(elem);
  console.log(prop, style.getPropertyValue(prop));
}

function styleDebug(e) {
  let title = document.querySelector('.post-title');
  console.log(title.innerText);

  let container = byId('container');
  let style = window.getComputedStyle(container);

  let p = document.querySelector('p');
  print_style(p, 'font-family');

  let h2 = document.querySelector('h2');
  print_style(h2, 'font-family');
}

function postData(e) {
  let titles = document.querySelectorAll('div.post-title');

  Array.from(titles).forEach((e) => {
    console.log(e.dataset.tags.split(' '));
  });
}

function main(e) {
  document.body.classList.add('hidden');
  let postList = document.querySelector('div#posts-list');
  if (postList !== null) {
    postData(e);
  }
  document.body.classList.remove('hidden');
}

// window.addEventListener('load', handleFootnotes);
// window.addEventListener('load', styleDebug);
// window.addEventListener('load', postData);
window.addEventListener('load', main);
