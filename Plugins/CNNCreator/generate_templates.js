/*
 * @author brollb / https://github/brollb
 */

"use strict";

var fs = require('fs'),
LANG_DIR = 'templates/',
_outFileName = 'templates.js',
FILECONTENT = "/*globals define*/\n/*\n" +
    "* GENERATED LANGUAGE FILES *      \n" +
    "* DO NOT EDIT MANUALLY *    \n" +
    "* TO GENERATE PLEASE RUN node generate_lang.js    \n" +
    "*/  \n" +
"\n" +
    "define([ __PATHLIST__ ], function ( __NAMELIST__ ) {    \n" +
    "\t'use strict';           \n" +
    "                            \n" +
    "\tvar templates = {};\n__CODE__\n"+
    "    return templates;\n" +
    "});";

//Recursively search through directories
var walk = function(dir, done) {
    console.log("READING ", dir);
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) {
            return done(err);
        }
        var pending = list.length;
        if (!pending){ 
            return done(null, results);
        }
        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) {
                            done(null, results);
                        }
                    });
                } else {
                    results.push(file);
                    if (!--pending) {
                        done(null, results);
                    }
                }
            });
        });
    });
};

walk(LANG_DIR.replace('/',''), function(err, list){
    if (!err){
        var fileList = JSON.stringify(list).split(LANG_DIR).join(''),
        fileContent,
        base = '\t\ttemplates.__PATH__ = __PATH__;\n',
        paths = '',
        names = '',
        name,
        index,
        code = '';

        for (var i = 0; i < list.length; i++){
            name = list[i].replace(/\.js/g, "");
            paths += '"./' + name + '"'; 

            index = name.lastIndexOf('/');
            if (index > -1){//Remove leading dir paths
                name = name.substring(index+1);
            }

            names += name;
            if (i < list.length-1){
                paths += ',\n';
                names += ',\n';
            }

            code += base.replace(/__PATH__/g, name);
        }

        fileContent = FILECONTENT.replace('___FILELIST___', fileList)
        .replace('__CODE__', code)
        .replace('__PATHLIST__', paths)
        .replace('__NAMELIST__', names);

        fs.writeFileSync(_outFileName, fileContent);
        console.log(_outFileName + ' has been generated\n');
    } else {
        console.log("Failed with error: " + err);
    }
});

