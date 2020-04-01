const fs = require('fs');
const buildOptions = require('minimist-options');
const path = require('path');
const glob = require('glob');
const micromatch = require('micromatch');
const args = require('minimist')(process.argv.slice(2),
    buildOptions({ platform: {
        type: 'string',
        alias: 'p'
    }
    }));

const platformsConfigs = {
    react: './react-config.js',
    angular:'./angular-config.js'
};

const commands = args['_'];
    if(commands.length) {
        throw new Error(`Unexpected command(s) '${args._}'`);
    }

    if(args.platform in platformsConfigs) {
        generateTemplate(args.platform);
    } else if(!args.platform) {
        for(let platform in platformsConfigs) {
            generateTemplate(platform);
        }
    } else {
        throw new Error('Platform doesn\'t exist');
    }

    function generateTemplate(platform) {
        const config = require(platformsConfigs[platform], 'utf8');
        const relativePaths = glob.sync(config.sourceGlob, {
            cwd: config.sourcePath,
            ignore: config.ignoreList
        });
        relativePaths.forEach(relativePath => {
            let content = fs.readFileSync(`${config.sourcePath}${relativePath}`, 'utf8');
            content = updateContent(relativePath, content, config.replaceRules, config.removeRules);

            writeFile(relativePath, content, config);
        });
    }

    function updateContent(relativePath, content, replaceRules, removeRules) {
        const replacements = replaceRules.filter(info => micromatch.isMatch(relativePath, info.glob));
        replacements.forEach(replacement => {
            replacement.definitions.forEach(definition => {
                content = content.replace(definition.before, definition.after);
            });
        });

        const removals = removeRules.filter(info => micromatch.isMatch(relativePath, info.glob));
        removals.forEach(removal => {
            removal.definitions.forEach(definition => {
                content = content.replace(definition, '');
            });
        });
        return content;
    }

    function writeFile(relativePath, content, { moveRules, targetPath }) {
        const rule = moveRules.find(rule => micromatch.isMatch(relativePath, rule.glob));
        const fullPath = rule
            ? `${rule.definition.targetPath}${relativePath.replace(rule.definition.sourcePath, '')}`
            : `${targetPath}${relativePath}`;

        createNestedFolder(fullPath, content);
        fs.writeFileSync(fullPath, content);
    }

    function createNestedFolder(fullPath) {
        const dirName = path.dirname(fullPath);
        if(!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
    }
