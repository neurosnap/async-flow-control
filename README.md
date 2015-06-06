Async-Flow-Control
==================

Presentation on different asynchronous paradigms which illustrate the differences
in their readability.

Comparison
----------

Method #|  Paradigm        |LoC |Avg. Indent|Max. Indent
--------|------------------|----|-----------|-----------
    1   | Callback Hell    | 30 |    4.5    |     8
    2   | Callback Counter | 13 |    2.2    |     4
    3   | Parallel         | 15 |    2.1    |     4
    4   | Promise          | 13 |    1.6    |     3
    5   | Coroutine        | 11 |    1.3    |     2

[Why is code indentation levels important?](https://github.com/neurosnap/code-nest)

Stack
-----

* NodeJS >= 0.11.0 (for generators)
* Gulp
* Browserify
* Babel
* LESS

Configure
---------

config.js in the root directory is required, see config_default.js for an example

Install
-------

```
npm install
bower install
gulp
npm start
```

Credits
-------

* Eric Bower <neurosnap@gmail.com>

