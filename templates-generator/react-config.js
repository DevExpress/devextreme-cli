module.exports = {
  sourcePath: 'packages/devextreme-cli/testing/sandbox/react/my-app/src/',
  targetPath: 'packages/devextreme-cli/templates/react/application/src/',
  update: [
    {
      fileName: 'app-routes.js',
      rules: [
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
      ]
    },
    {
      fileName: 'app-info.js',
      rules: [
        {
          before: 'My App',
          after: '<%=project%>'
        }
      ]
    },
    {
      fileName: 'app-navigation.js',
      rules: [
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
      fileName: 'App.js',
      rules: [
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
      fileName: 'metadata.additional.json',
      rules: [
        {
          before: /"items":\s+\[[^]*?\]/,
          after: '"items": []'
        },
        {
          before: /"baseTheme": ".*?"/,
          after: '"baseTheme": "material.orange.dark"'
        }
      ]
    },
    {
      fileName: 'metadata.base.json',
      rules: [
        {
          before: /"items":\s+\[[^]*?\]/,
          after: '"items": []'
        },
        {
          before: /"baseTheme": ".*?"/,
          after: '"baseTheme": "material.orange.light"'
        }
      ]
    }
  ],
  replace: [
    {
      from: 'pages',
      to: 'packages/devextreme-cli/templates/react/sample-pages'
    }
  ],
  ignore: [
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
