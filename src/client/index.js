'use strict';

// polyfile required for ES6 generators
//import polyfill from 'babel/polyfill';
//import Promise from 'bluebird';

//import impress from 'impress';
import hljs from 'highlight.js';
hljs.registerLanguage('javascript', require('hljs-js'));
hljs.initHighlightingOnLoad();

//impress().init();