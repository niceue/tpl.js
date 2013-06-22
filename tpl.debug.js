/*! tpl.js 0.2.0, github.com/niceue/tpl.js */

/* 类似于PHP的嵌入方式, 可以嵌入js语句
   模板语法：
       嵌入传入的变量: <%=xxx%> , 注意，xxx变量不能为javascript关键字
       嵌入任意js语句：<% if(xxx){ %> foo <%}else{%> bar <%}%>
   调用：
       var html = tpl('#tpl_id', data);
       console.log(html);
 */
(function (root, factory) {
    //AMD and CMD (RequireJS, OzJS, curl, SeaJS ...)
    typeof define === 'function' && define(factory);
    //Node.js and Browser global
    (typeof exports !== 'undefined' ? exports : root).tpl = factory();
}(this, function () {

    function Compiler(html) {
        html = html || '';
        if (/^#\w+$/.test(html)) html = document.getElementById(html.substring(1)).innerHTML;
        var begin = '<%',
            end = '%>',
            trim = function(str) {
                return str.trim ? str.trim() : str.replace(/^\s*|\s*$/g, '');
            },
            ecp = function(str){
                return str.replace(/('|\\)/g, '\\$1');
            },
            str = "var __='',echo=function(s){__+=s};with(_$||{}){",
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
                    str += "typeof(" + tmp + ")!='undefined'&&(__+=" + tmp + ");";
                } else { //js代码
                    str += tmp;
                }
                html = html.substring(e + elen);
                b = html.indexOf(begin);
            }
            str += "__+='" + ecp(html) + "'}return __";
            str = str.replace(/\r|\n/g, '');
            this.render = new Function("_$", str);
    }

    return function(html, data) {
        var me = new Compiler(html);
        return data ? me.render(data) : me;
    };
}));