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
    console.error(`Command is redundent`);
    return;
  }

  const platformsConfig = {
    react: './react-config.js'
  };

  const config = getConfig(args.platform);

  function getConfig(platform) {
    if (!args.platform) {
      console.error(`The platform is not defined.`);
      return;
    }
    if (platformsConfig[platform]) {
      return require(platformsConfig[platform], 'utf8');
    } else {
      console.error(`Unknown platform '${platform}'`);
    }
  }

  config && generateTemplate();

  function generateTemplate() {
    const sourcePath = path.normalize(`${config.sourcePath}`);
    const ignoredPaths = config.ignore.map(ignoredPath => path.join(sourcePath, ignoredPath));

    const files = getFileList(sourcePath);
    files.forEach(file => {
      if (ignoredPaths.some(rule => file.includes(rule))) {
        return;
      }
      let content = fs.readFileSync(file, 'utf8');
      content = updateContent(file, content);
      writeFile(file, content, sourcePath);
    });
  }

  function getFileList(dir) {
    return fs.readdirSync(dir).reduce(function (list, file) {
      const name = path.join(dir, file);
      const isDir = fs.statSync(name).isDirectory();
      return list.concat(isDir ? getFileList(name) : [name]);
    }, []);
  }

  function updateContent(file, content) {
    const updateRules = config.update.filter(updatedFile => file.includes(updatedFile.fileName))[0];
    if (updateRules) {
      updateRules.rules.forEach(element => {
        content = content.replace(element.before, element.after);
      });
    }
    return content;
  }

  function writeFile(file, content, sourcePath) {
    const replaceRule = config.replace.filter(item => file.includes(item.from))[0];
    if (replaceRule) {
      const filePath = file.replace(`${sourcePath}${replaceRule.from}`, '');
      fs.writeFileSync(`${replaceRule.to}${filePath}`, content);
    }
    else {
      const fullPath = `${config.targetPath}${file.replace(sourcePath, '')}`;
      const fileName = path.basename(file);
      const shortPath = fullPath.replace(fileName, '');
      if (!fs.existsSync(shortPath)) {
        fs.mkdirSync(shortPath, { recursive: true });
      }

      fs.writeFileSync(fullPath, content);
    }
  }

  process.exit();
})();
