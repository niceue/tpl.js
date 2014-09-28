var fs = require("fs");

function compiler(html) {
    html = html || '';
    if (/\.(?=tpl|html)$/.test(html)) html = fs.readFileSync(html);
    
    var ecp = function(str){
            return str.replace(/('|\\)/g, '\\$1').replace(/\r\n/g, '\\r\\n').replace(/\n/g, '\\n');
        },
        begin = '<#',
        end = '#>',
        blen = begin.length, elen = end.length,
        b = html.indexOf(begin), e,
        str = "var __='',___,echo=function(s){__+=s},include=function(t,d){__+=tpl(t,d||_$)};with($||{}){",
        tmp;

        while(b != -1) {
            e = html.indexOf(end);
            if(e < b) break; //出错后不再编译
            str += "__+='" + ecp(html.substring(0, b)) + "';";
            tmp = html.substring(b+blen, e).trim();
            if( tmp.indexOf('=') === 0 ) { //模板变量
                tmp = tmp.substring(1);
                str += "___=" + tmp + ";typeof ___!=='undefined'&&(__+=___);";
            } else { //js代码
                str += tmp + ";";
            }
            html = html.substring(e + elen);
            b = html.indexOf(begin);
        }
        str += "__+='" + ecp(html) + "'}return __";
        return = new Function("$", str);
}

function tpl(html, data) {
    var fn = compiler(html);
    return data ? fn(data) : fn;
};
    
module.exports = tpl;