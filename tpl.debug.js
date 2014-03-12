/*! tpl.js 0.3.0, github.com/niceue/tpl.js */

/* 类似于PHP的嵌入方式, 可以嵌入js语句
   模板语法：
       嵌入传入的变量: <#=xxx#> , 注意，xxx变量不能为javascript关键字
       嵌入任意js语句：<#if(xxx){#> foo <#}else{#> bar <#}#>
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
        if (/^#\w+$/.test(html)) html = document.getElementById(html.substring(1)).innerHTML;
        var begin = tpl.begin,
            end = tpl.end,
            v = tpl.variable,
            arg1 = v || "$",
            trim = function(str) {
                return str.trim ? str.trim() : str.replace(/^\s*|\s*$/g, '');
            },
            ecp = function(str){
                return str.replace(/('|\\|\r?\n)/g, '\\$1');
            },
            str = "var "+ arg1 +"="+ arg1 +"||this,__='',echo=function(s){__+=s},include=function(t,d){__+=tpl(t).call(d||"+ arg1 +")};"+ (v?"":"with($||{}){"),
            blen = begin.length,
            elen = end.length,
            b = html.indexOf(begin),
            e,
            tmp;
            
        while(b != -1) {
            e = html.indexOf(end);
            if(e < b) break; //出错后不再编译
            str += "__+='" + ecp(html.substring(0, b)) + "';";
            tmp = trim(html.substring(b+blen, e));
            if( tmp.indexOf('=') === 0 ) { //模板变量
                tmp = tmp.substring(1);
                str += "typeof (" + tmp + ")!=='undefined'&&(__+=" + tmp + ");";
            } else { //js代码
                str += tmp + ";";
            }
            html = html.substring(e + elen);
            b = html.indexOf(begin);
        }
        str += "__+='" + ecp(html) + "'"+ (v?";":"}") +"return __";
        return new Function(arg1, str);
    }

    //Browser global
    window.tpl = tpl;
    //AMD and CMD (RequireJS, OzJS, curl, SeaJS ...)
    typeof define === 'function' && define('tpl',[],function(){return tpl});
})(window);