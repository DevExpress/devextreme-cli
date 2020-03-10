const fs = require('fs');
const path = require('path');
const buildOptions = require('minimist-options');
const args = require('minimist')(process.argv.slice(2), buildOptions({
  platform: {
    type: 'string',
    alias: 'p',
    default: 'react'
  }
}));

const commands = args['_'];
if (!commands.length && args.platform === 'react') {
  const config = require('./react-config.js', 'utf8').config;
  templateGenarator(config);
} else {
  console.error('The DevExtreme command is not specified.');
}
process.exit();

function templateGenarator(config) {
  const sourcePath = path.normalize(`${config.commonPath}${config.sourcePath}`);
  const targetPath = `${config.commonPath}${config.targetPath}`;

  function getFiles(dir) {
    return fs.readdirSync(dir).reduce(function (list, file) {
      const name = path.join(dir, file);
      const isDir = fs.statSync(name).isDirectory();
      return list.concat(isDir ? getFiles(name) : [name]);
    }, []);
  }
  const ignoredPaths = config.ignore.map(ignoredPath => path.join(sourcePath, ignoredPath));

  const files = getFiles(sourcePath).filter(file => !ignoredPaths.some(rule => file.includes(rule)));
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    const updateRules = config.update.filter(updatedFile => file.includes(updatedFile.fileName))[0];
    if (updateRules) {
      updateRules.rules.forEach(element => {
        content = content.replace(new RegExp(element.before), element.after);
      });
    }

    const replaceRule = config.replace.filter(item => file.includes(item.from))[0];
    if (replaceRule) {
      const filePath = file.replace(`${sourcePath}${replaceRule.from}`, '');
      fs.writeFileSync(`${config.commonPath}${replaceRule.to}${filePath}`, content);
    }
    else {
      const fullPath = `${targetPath}${file.replace(sourcePath, '')}`;
      const fileName = path.basename(file);
      const shortPath = fullPath.replace(fileName, '');
      if (!fs.existsSync(shortPath)) {
        fs.mkdirSync(shortPath, { recursive: true });
      }

      fs.writeFileSync(fullPath, content);
    }
  });
}
