const fs = require('fs');
const buildOptions = require('minimist-options');
const path = require('path');
const glob = require('glob');
const micromatch = require("micromatch");
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
    const ruleKey = Object.keys(updateRules).find(key => micromatch.isMatch(file, key))
    if (ruleKey) {
      updateRules[ruleKey].forEach((updateRule) => {
        content = content.replace(updateRule.before, updateRule.after);
      })
    }

    return content;
  }

  function writeFile(file, content, { replaceRules, targetPath }) {
    let fullPath = '';
    const ruleKey = Object.keys(replaceRules).find(key => micromatch.isMatch(file, key))
    if (ruleKey) {
      fullPath = `${replaceRules[ruleKey].to}${file.replace(replaceRules[ruleKey].from, '')}`;
    } else {
      fullPath = `${targetPath}${file}`;
    }

    createNestedFolder(fullPath, content);
    fs.writeFileSync(fullPath, content);
  }

  function createNestedFolder(fullPath) {
    const dirName = path.dirname(fullPath);
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }
  }
  
  process.exit();
})();
