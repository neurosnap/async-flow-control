'use strict';

// polyfile required for ES6 generators
import polyfill from 'babel/polyfill';
import $ from 'jquery';
import _ from 'lodash';
import Promise from 'bluebird';

$.expr[':'].external = function(obj) {
  return !obj.href.match(/^mailto\:/)
    && (obj.hostname != location.hostname)
    && !obj.href.match(/^javascript\:/)
    && !obj.href.match(/^$/);
};

$(function() {
  $('a:external').attr('target', '_blank');
});