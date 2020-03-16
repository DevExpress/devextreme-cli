module.exports = {
  sourcePath: 'packages/devextreme-cli/testing/sandbox/react/my-app/',
  targetPath: 'packages/devextreme-cli/templates/react/application/',
  updateRules: {
    '**/src/app-routes.js': [
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
    '**/src/app-info.js': [
      {
        before: 'My App',
        after: '<%=project%>'
      }
    ],
    '**/src/app-navigation.js': [
      {
        before: '= [',
        after: '= [<%=^empty%>'
      },
      {
        before: '];',
        after: '<%=/empty%>];'
      }
    ],
    '**/src/App.js': [
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
    ],
    '**/themes/metadata.additional.json': [
      {
        before: /"items":\s+\[[^]*?\]/,
        after: '"items": []'
      },
      {
        before: /"baseTheme": ".*?"/,
        after: '"baseTheme": "material.orange.dark"'
      }
    ],
    '**/themes/metadata.base.json': [
      {
        before: /"items":\s+\[[^]*?\]/,
        after: '"items": []'
      },
      {
        before: /"baseTheme": ".*?"/,
        after: '"baseTheme": "material.orange.light"'
      }
    ],
  },
  replaceRules: {
    '**/src/pages/**/*.*': {
      from: 'src/pages',
      to: 'packages/devextreme-cli/templates/react/sample-pages'
    },
    '**/devextreme.json': {
      from: '',
      to: 'packages/devextreme-cli/templates/react/application/'
    }
  },
  ignoreList: [
    '**/themes/generated/**/*.*',
    '**/src/App.test.js',
    '**/src/serviceWorker.js',
    '**/src/setupTests.js',
    '**/src/index.css',
    '**/src/index.js',
    '**/node_modules/**/*.*',
    '**/public/**/*.*',
    'package.json',
    'package-lock.json'
  ]
}
