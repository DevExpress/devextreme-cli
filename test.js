const fs = require('fs');
const path = require('path');

const sourcePath = "testing\\sandbox\\react\\my-app\\src\\";
const targetPath = "templates\\react\\application\\src\\";
const rules = JSON.parse(fs.readFileSync('config.json', 'utf8'));

function getFiles(dir) {
  return fs.readdirSync(dir).reduce(function (list, file) {
    var name = path.join(dir, file);
    var isDir = fs.statSync(name).isDirectory();
    return list.concat(isDir ? getFiles(name) : [name]);
  }, []);
}

function writeFile(path, content) {
  fs.writeFileSync(path, content);
}

const files = getFiles(sourcePath).filter(file => !rules.ignore.some(rule => file.includes(`${sourcePath}${rule}`)));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const updateRules = rules.update.filter(updatedFile => file.includes(updatedFile.fileName))[0];
  if (updateRules) {
    updateRules.rules.forEach(element => {
      content = content.replace(element.before, element.after);
    });

    const index = content.lastIndexOf(`import React, { Component } from 'react';`);
    if (index !== -1) {
      content = content.slice(index, content.length);
    }
  }
  const replaceRule = rules.replace.filter(item => file.includes(item.from))[0];
  if (replaceRule) {
    writeFile(`${replaceRule.to}${file.replace(`${sourcePath}${replaceRule.from}`, '')}`, content);
  }
  else {
    writeFile(`${targetPath}${file.replace(sourcePath, '')}`, content);
  }
});
