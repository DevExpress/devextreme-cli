module.exports = {
  sourcePath: 'packages/devextreme-cli/testing/sandbox/react/my-app/',
  targetPath: 'packages/devextreme-cli/templates/react/application/',
  sourceGlob: '**/*.{js,scss,json}',
  updateRules: [
    {
      pattern: '**/src/app-routes.js',
      conditions: [
        {
          before: 'import',
          after: '<%=^empty%>import'
        },
        {
          before: '];',
          after: '<%=/empty%>];'
        },
        {
          before: 'export default [',
          after: '<%=/empty%>export default [<%=^empty%>'
        }
      ],
    },
    {
      pattern: '**/src/app-info.js',
      conditions: [{
        before: 'My App',
        after: '<%=project%>'
      }
      ],
    },
    {
      pattern: '**/src/app-navigation.js',
      conditions: [
        {
          before: '= [',
          after: '= [<%=^empty%>'
        },
        {
          before: '];',
          after: '<%=/empty%>];'
        }
      ]
    },
    {
      pattern: '**/src/App.js',
      conditions: [
        {
          before: 'SideNavOuterToolbar',
          after: '<%=layout%>'
        },
        {
          before: 'SideNavInnerToolbar',
          after: '<%=layout%>'
        },
        {
          before: 'import \'devextreme/dist/css/dx.common.css\';\n',
          after: ''
        },
        {
          before: 'import \'./themes/generated/theme.base.css\';\n',
          after: ''
        },
        {
          before: 'import \'./themes/generated/theme.additional.css\';\n',
          after: ''
        },
        {
          before: '))}',
          after: '))}<%=^empty%>'
        },
        {
          before: '<Redirect to={\'/home\'} />',
          after: '<Redirect to={\'/home\'} /><%=/empty%>'
        }
      ]
    },
    {
      pattern: '**/themes/metadata.additional.json',
      conditions: [
        {
          before: /"baseTheme": ".*?"/,
          after: '"baseTheme": "material.orange.dark"'
        }
      ]
    },
    {
      pattern: '**/themes/metadata.base.json',
      conditions: [
        {
          before: /"baseTheme": ".*?"/,
          after: '"baseTheme": "material.orange.light"'
        }
      ]
    },
    {
      pattern: '**/themes/metadata.**.json',
      conditions: [
        {
          before: /"items":\s+\[[^]*?\]/,
          after: '"items": []'
        }
      ]
    }
  ],
  replaceRules: [
    {
      pattern: '**/src/pages/**/*.*',
      rule: {
        from: 'src/pages',
        to: 'packages/devextreme-cli/templates/react/sample-pages'
      }
    },
    {
      pattern: '**/devextreme.json',
      rule: {
        from: '',
        to: 'packages/devextreme-cli/templates/react/application/'
      }
    }
  ],
  ignoreList: [
    '**/themes/generated/**/*.*',
    '**/src/App.test.js',
    '**/src/setupTests.js',
    '**/src/serviceWorker.js',
    '**/src/index.js',
    '**/node_modules/**/*.*',
    '**/public/**/*.*',
    'package.json',
    'package-lock.json'
  ]
}
