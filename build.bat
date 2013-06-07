@echo off

set SRC=tpl.debug.js
set MIN=tpl.js

uglifyjs %SRC% -o %MIN% -c -m --comments "/\/*!/"