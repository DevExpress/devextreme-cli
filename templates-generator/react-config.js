module.exports = {
  sourcePath: 'packages/devextreme-cli/testing/sandbox/react/my-app/src/',
  targetPath: 'packages/devextreme-cli/templates/react/application/src/',
  updateRules: {
    'app-routes.js': [
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
    'app-info.js': [
      {
        before: 'My App',
        after: '<%=project%>'
      }
    ],
    'app-navigation.js': [
      {
        before: '= [',
        after: '= [<%=^empty%>'
      },
      {
        before: '];',
        after: '<%=/empty%>];'
      }
    ],
    'App.js': [
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
    'themes/metadata.additional.json': [
      {
        before: /"items":\s+\[[^]*?\]/,
        after: '"items": []'
      },
      {
        before: /"baseTheme": ".*?"/,
        after: '"baseTheme": "material.orange.dark"'
      }
    ],
    'themes/metadata.base.json': [
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
  replaceRules: [
    {
      from: 'pages',
      to: 'packages/devextreme-cli/templates/react/sample-pages'
    }
  ],
  ignoreList: [
    'themes/generated',
    'App.css',
    'App.test.js',
    'logo.svg',
    'serviceWorker.js',
    'setupTests.js',
    'index.css',
    'index.js'
  ]
}
