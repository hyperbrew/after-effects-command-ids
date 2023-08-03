var s = [
    // Commands go here
]

var res = {};

for (var i = 0; i < s.length; i++) {
    var element = s[i];
    var elementSimple = element.replace(/\s/g, ''); // most command names work without spaces
    var cmd = app.findMenuCommandId(element)
    var cmdSimple = app.findMenuCommandId(elementSimple);
    if(cmdSimple){
        res[cmd] = elementSimple;
    }else{
        res[cmd] = element;
    }
    
}
JSON.stringify(res);