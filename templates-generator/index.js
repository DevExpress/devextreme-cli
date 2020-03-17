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
    react: './react-config.js'
  };

  if (Object.keys(platformsConfigs).some(item => item === args.platform)) {
    const config = require(platformsConfigs[args.platform], 'utf8');
    generateTemplate(config);
  }
  else if (!args.platform) {
    for (platform in platformsConfigs) {
      const config = require(platformsConfigs[platform], 'utf8');
      generateTemplate(config);
    }
  }
  else {
    console.error(`Platform doesn't exist`);
  }

    function generateTemplate(config) {
      const relativePaths = glob.sync(config.sourceGlob, {
        cwd: config.sourcePath,
        ignore: config.ignoreList
      });
      relativePaths.forEach(relativePath => {
        let content = fs.readFileSync(`${config.sourcePath}${relativePath}`, 'utf8');
        content = updateContent(relativePath, content, config.updateRules);

        writeFile(relativePath, content, config);
      });
    }

    function updateContent(relativePath, content, updateRules) {
      const rules = updateRules.filter(rule => micromatch.isMatch(relativePath, rule.pattern));
      rules.forEach(rule => {
        rule.conditions.forEach(condition => {
          content = content.replace(condition.before, condition.after);
        })
      })

      return content;
    }

    function writeFile(relativePath, content, { replaceRules, targetPath, sourcePath }) {
      const ruleKey = replaceRules.find(rule => micromatch.isMatch(relativePath, rule.pattern));
      const fullPath = ruleKey
        ? `${ruleKey.rule.to}${relativePath.replace(ruleKey.rule.from, '')}`
        : `${targetPath}${relativePath}`;

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
