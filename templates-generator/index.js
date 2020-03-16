const fs = require('fs');
const path = require('path');
const buildOptions = require('minimist-options');
const glob = require('glob');
const micromatch = require("micromatch")
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
    } else {
      return;
    }
  }

  if ((!args.platform)) {
    for (platform in platformsConfigs) {
      const config = getConfig(platform);
      generateTemplate(config);
    }
  }

  if (args.platform === 'react') {
    const config = getConfig(args.platform);
    config && generateTemplate(config);
  }

  function generateTemplate(config) {
    const files = glob.sync('**/*.{js,scss,json}', {
      cwd: config.sourcePath,
      ignore: config.ignoreList
    });
    files.forEach(file => {
      let content = fs.readFileSync(`${config.sourcePath}${file}`, 'utf8');
      content = updateContent(file, content, config);
      writeFile(file, content, config);
    });
  }

  function updateContent(file, content, { updateRules }) {
    const updateKey = Object.keys(updateRules).find(item => micromatch.isMatch(file, item))
    if (updateKey) {
      updateRules[updateKey].forEach((updateRule) => {
        content = content.replace(updateRule.before, updateRule.after);
      })
    }

    return content;
  }

  function writeFile(file, content, { replaceRules, targetPath }) {
    const replaceKey = Object.keys(replaceRules).find(item => micromatch.isMatch(file, item))
    let fullPath = '';
    if (replaceKey) {
      fullPath = `${replaceRules[replaceKey].to}${file.replace(replaceRules[replaceKey].from, '')}`;
    } else {
      fullPath = `${targetPath}${file}`;
    }
    createNestedFolder(fullPath, content);
  }

  function createNestedFolder(fullPath, content) {
    const fileName = path.basename(fullPath);
    const shortPath = fullPath.replace(fileName, '');
    if (!fs.existsSync(shortPath)) {
      fs.mkdirSync(shortPath, { recursive: true });
    }
    fs.writeFileSync(path.normalize(fullPath), content);
  }
  process.exit();
})();
