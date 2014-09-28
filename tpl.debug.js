/*! tpl.js 0.3.1, github.com/niceue/tpl.js */

/* 类似于PHP的嵌入方式, 可以嵌入js语句
   模板语法：
       嵌入传入的变量: <#=xxx#> , 注意，xxx变量不能为javascript关键字
       嵌入任意js语句：<#if(xxx){#> foo <#}else{#> bar <#}#>
       内置 echo() 和 include() 两个方法
       <###>之间的内容会被跳过编译<###>
   调用：
        方式一(直接输出结果)：tpl(template, data)
        方式二(预编译，二次调用传入data)：tpl(template)(data)

        其中，如果template变量传入#id，会自动获取innerHTML
 */
(function (window) {

    function tpl(html, data) {
        var fn = compiler(html);
        return data ? fn(data) : fn;
    }
    tpl.begin = '<#';
    tpl.end = '#>';

    function compiler(html) {
        html = html || '';
        if (html.charAt(0)==='#') html = document.getElementById(html.substring(1)).innerHTML;
        var trim = function(str) {
                return str.trim ? str.trim() : str.replace(/^\s*|\s*$/g, '');
            },
            ecp = function(str){
                return str.replace(/('|\\|\r?\n)/g, '\\$1');
            },
            begin = tpl.begin,
            end = tpl.end,
            v = tpl.variable,
            arg1 = v || "$",
            str = "var "+ arg1 +"="+ arg1 +"||this,__='',___,\
                echo=function(s){__+=s},\
                include=function(t,d){__+=tpl(t).call(d||"+ arg1 +")};"+ (v?"":"with($||{}){"),
            blen = begin.length, elen = end.length,
            b = html.indexOf(begin), e,
            skip,
            tmp;
            
        while(b != -1) {
            e = skip ? b + blen : html.indexOf(end);
            if(e < b) break; //出错后不再编译
            str += "__+='" + ecp(html.substring(0, b)) + "';";

            if (skip) {
                html = html.substring(blen+elen+1);
                skip--;
            } else {
                tmp = trim(html.substring(b+blen, e));
                if ('#'===tmp) {
                    skip = 1;
                } else if( tmp.indexOf('=') === 0 ) { //模板变量
                    tmp = tmp.substring(1);
                    str += "___=" + tmp + ";typeof ___!=='undefined'&&(__+=___);";
                } else { //js代码
                    str += "\n" + tmp + "\n";
                }
            }

            html = html.substring(e + elen);
            b = html.indexOf( begin + (skip ? '#'+end : '') );
        }
        str += "__+='" + ecp(html) + "'"+ (v?";":"}") +"return __";
        return new Function(arg1, str);
    }

    //Browser global
    window.tpl = tpl;
    //AMD and CMD (RequireJS, OzJS, curl, SeaJS ...)
    typeof define === 'function' && define('tpl',[],function(){return tpl});
})(this);