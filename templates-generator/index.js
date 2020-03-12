const fs = require('fs');
const path = require('path');
const buildOptions = require('minimist-options');
const args = require('minimist')(process.argv.slice(2), buildOptions({
  platform: {
    type: 'string',
    alias: 'p'
  }
}));

const commands = args['_'];
(() => {
  if (commands.length) {
    console.error(`Command is redundant`);
    return;
  }

  const platformsConfigs = {
    'react': './react-config.js'
  };

  function getConfig(platform) {
    if (platformsConfigs[platform]) {
      return require(platformsConfigs[platform], 'utf8');
    }
    else {
      return;
    }
  }

  if ((!args.platform)) {
    for (platform in platformsConfigs) {
      const config = getConfig(platform);
      generateTemplate(config)
    }
  }

  if (args.platform === 'react') {
    const config = getConfig(args.platform);
    config && generateTemplate(config);
  }

  function generateTemplate(config) {
    const sourcePath = path.normalize(config.sourcePath);
    const ignoredPaths = config.ignoreList.map(ignoredPath => path.join(sourcePath, ignoredPath));

    const files = getFileList(sourcePath);
    files.forEach(file => {
      if (ignoredPaths.some(rule => file.includes(rule))) {
        return;
      }
      let content = fs.readFileSync(file, 'utf8');
      content = updateContent(file, content, config);
      writeFile(file, content, sourcePath, config);
    });
  }

  function getFileList(dir) {
    return fs.readdirSync(dir).reduce(function (list, file) {
      const name = path.join(dir, file);
      const isDir = fs.statSync(name).isDirectory();
      return list.concat(isDir ? getFileList(name) : [name]);
    }, []);
  }

  function updateContent(file, content, { updateRules }) {
    const rulesKey = Object.keys(updateRules).find(element => file.includes(element));
    if (rulesKey) {
      updateRules[rulesKey].forEach((element) => {
        content = content.replace(element.before, element.after);
      })
    }
    return content;
  }

  function writeFile(file, content, sourcePath, { replaceRules, targetPath }) {
    const replaceRule = replaceRules.find(item => file.includes(item.from));
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

  process.exit();
})();
