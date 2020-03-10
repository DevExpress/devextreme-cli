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
(() => {
  if (commands.length) {
    console.error('');
    return;
  }

  const platforms = {
    react: './react-config.js'
  };
  function getConfg(platform) {
    if (!args.platform) {
      console.error('The platform is not defined.');
      return;
    }
    if (platforms[platform]) {
      return require(platforms[platform], 'utf8');
    } else {
      console.error(`Unknown platform '${platform}'`);
    }
  }

  const config = getConfg(args.platform);
  config && genarateTemplate(config);

  function getFileList(dir) {
    return fs.readdirSync(dir).reduce(function (list, file) {
      const name = path.join(dir, file);
      const isDir = fs.statSync(name).isDirectory();
      return list.concat(isDir ? getFileList(name) : [name]);
    }, []);
  }

  function writeFile(file, content, sourcePath, config) {
    const targetPath = `${config.targetPath}`;
    const replaceRule = config.replace.filter(item => file.includes(item.from))[0];
    if (replaceRule) {
      const filePath = file.replace(`${sourcePath}${replaceRule.from}`, '');
      fs.writeFileSync(`${replaceRule.to}${filePath}`, content);
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
  }

  function defineContent(file, content, config) {
    const updateRules = config.update.filter(updatedFile => file.includes(updatedFile.fileName))[0];
    if (updateRules) {
      updateRules.rules.forEach(element => {
        return content.replace(element.before, element.after);
      });
    }
    else {
      return content;
    }
  }

  function genarateTemplate(config) {
    const sourcePath = path.normalize(`${config.sourcePath}`);
    const ignoredPaths = config.ignore.map(ignoredPath => path.join(sourcePath, ignoredPath));

    const files = getFileList(sourcePath);
    files.forEach(file => {
      if (ignoredPaths.some(rule => file.includes(rule))) {
        return;
      }
      let content = fs.readFileSync(file, 'utf8');
      content = defineContent(file, content, config);
      writeFile(file, content, sourcePath, config);
    });
  }
  process.exit();
})();
