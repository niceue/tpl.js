/*! tpl.js 0.1.0, github.com/niceue/tpl.js */

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
    function trim(str) {
        return str.trim ? str.trim() : str.replace(/^\s*|\s*$/g, '');
    }
    function ecp(str){
        return str.replace(/('|\\)/g, '\\$1');
    }
    function render(html, data) {
        if (html.charAt(0) === '#' && html.indexOf('<') === -1) html = document.getElementById(html.substring(1)).innerHTML;
        var that = new Tpl(html);
        return data ? that.render(data) : that;
    }
    function Tpl(html) {
        this._init(html);
    }
    Tpl.prototype = {
        begin: '<%',
        end: '%>',
        _init: function(html) {
            html = html || '';
            var me = this,
                str = 'var __=\'\',echo=function(s){__+=s};with(this){',
                blen = me.begin.length,
                elen = me.end.length,
                b = html.indexOf(me.begin),
                e,
                tmp;
            while(b != -1) {
                e = html.indexOf(me.end);
                if(e < b) break; //出错后不再编译
                str += '__+=\'' + ecp(html.substring(0, b)) + '\';';
                tmp = trim(html.substring(b+blen, e));
                if( tmp.indexOf('=') === 0 ) { //模板变量
                    str += '__+=' + tmp.substring(1) + ';';
                } else { //js代码
                    str += tmp;
                }
                html = html.substring(e + elen);
                b = html.indexOf(me.begin);
            }
            str += '__+=\'' + ecp(html) + '\'}' + 'return __';
            str = str.replace(/\r|\n/g, '');
            me.compiler = new Function(str);
        },
        render: function(data) {
            return this.compiler.call( data || {} );
        }
    };
    return render;
}));