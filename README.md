# DevExtreme CLI

DevExtreme CLI is a set of command-line tools to be used with DevExtreme controls library.

* [Installation](#installation)
* [Add DevExtreme to an Existing Application](#add-devextreme)
    * [Angular](#add-devextreme-angular)
    * [React](#add-devextreme-react)
    * [Vue](#add-devextreme-vue)
* [DevExtreme Application](#devextreme-app)
    * [Angular](#devextreme-app-angular)
    * [React](#devextreme-app-react)
    * [Vue](#devextreme-app-vue)
    * [Command Line Arguments](#devextreme-app-arguments)
* [Theme Builder](#theme-builder)
    * [One-off Usage](#theme-builder-one-off)
    * [Global package usage](#theme-builder-global)
    * [Command Line Arguments](#theme-builder-arguments)
    * [Examples](#theme-builder-examples)
* [License](#license)
* [Support](#support)

## <a name="installation"></a>Installation

```bash
> npm i -g devextreme-cli
```

Alternatively, you can execute DevExtreme CLI commands by using npx.

## <a name="add-devextreme"></a>Add DevExtreme to an Existing Application

### <a name="add-devextreme-angular"></a>Angular 

Add DevExtreme to an Angular application (follow [this](https://github.com/DevExpress/devextreme-angular#adding-devexteme-to-an-existing-angular-application) link for more information):

#### <a name="add-devextreme-angular-no-global"></a>Without global package usage

```bash
> npx -p devextreme-cli devextreme add devextreme-angular
```

#### <a name="add-devextreme-angular-global"></a>Global package usage

```bash
> devextreme add devextreme-angular
```

### <a name="add-devextreme-react"></a>React 

Add DevExtreme to a React application:

#### <a name="add-devextreme-react-no-global"></a>Without global package usage

```bash
> npx -p devextreme-cli devextreme add devextreme-react
```

#### <a name="add-devextreme-react-global"></a>Global package usage

```bash
> devextreme add devextreme-react
```

### <a name="add-devextreme-vue"></a>Vue 

Add DevExtreme to a Vue application:

#### <a name="add-devextreme-vue-no-global"></a>Without global package usage

```bash
> npx -p devextreme-cli devextreme add devextreme-vue
```

#### <a name="add-devextreme-vue-global"></a>Global package usage

```bash
> devextreme add devextreme-vue
```

## <a name="devextreme-app"></a>DevExtreme Application

### <a name="devextreme-app-angular"></a>Angular

#### <a name="devextreme-app-angular-no-global"></a>Without global package usage

Create a new DevExtreme application:
```bash
> npx -p devextreme-cli devextreme new angular-app app-name [--layout][--empty]
```

Add the DevExtreme layout template to an Angular application (follow [this](https://github.com/DevExpress/devextreme-angular#quick-start) link for more information):
```bash
> npx -p devextreme-cli devextreme add angular-template [--layout][--empty][--resolve-conflicts]
```

Add a view to an Angular application with the DevExtreme layout template:
```bash
> npx -p devextreme-cli devextreme add view view-name [--icon]
```

#### <a name="devextreme-app-angular-global"></a>Global package usage

Create a new DevExtreme application:
```bash
> devextreme new angular-app app-name [--layout][--empty]
```

Add the DevExtreme layout template to an Angular application (follow [this](https://github.com/DevExpress/devextreme-angular#quick-start) link for more information):
```bash
> devextreme add angular-template [--layout][--empty][--resolve-conflicts]
```

Add a view to an Angular application with the DevExtreme layout template:
```bash
> devextreme add view view-name [--icon]
```

### <a name="devextreme-app-react"></a>React

#### <a name="devextreme-app-react-no-global"></a>Without global package usage

Create a new DevExtreme application:
```bash
> npx -p devextreme-cli devextreme new react-app app-name [--layout][--empty]
```

Add a view to the DevExtreme application:
```bash
> npx -p devextreme-cli devextreme add view view-name [--icon]
```

#### <a name="devextreme-app-react-global"></a>Global package usage

Create a new DevExtreme application:
```bash
> devextreme new react-app app-name [--layout][--empty]
```

Add a view to the DevExtreme application:
```bash
> devextreme add view view-name [--icon]
```

### <a name="devextreme-app-vue"></a>Vue

#### <a name="devextreme-app-vue-no-global"></a>Without global package usage

Create a new DevExtreme application:
```bash
> npx -p devextreme-cli devextreme new vue-app app-name [--layout][--empty]
```

Add a view to the DevExtreme application:
```bash
> npx -p devextreme-cli devextreme add view view-name [--icon]
```

#### <a name="devextreme-app-vue-global"></a>Global package usage

Create a new DevExtreme application:
```bash
> devextreme new vue-app app-name [--layout][--empty]
```

Add a view to the DevExtreme application:
```bash
> devextreme add view view-name [--icon]
```

### <a name="devextreme-app-arguments"></a>Command line arguments

* `--layout` – Specifies the type of a DevExtreme layout to add (default: `side-nav-outer-toolbar`)
  Available values:
  * side-nav-outer-toolbar
  * side-nav-inner-toolbar

* `--empty` – Specifies whether to skip sample views generation (default: `false`)

* `--resolve-conflicts` – Specifies whether to override the existing app component or create a component with another name. (default: `createNew`)
  Available values:
  * createNew
  * override

* `--icon` – Specifies the view's icon name (default: `folder`)
  You can choose the icon name from the [icon library](https://js.devexpress.com/Documentation/Guide/Themes/Icon_Library/)


## <a name="theme-builder"></a>ThemeBuilder

### <a name="theme-builder-one-off"></a>One-off usage

Build a custom color scheme:
```bash
> npx -p devextreme-cli devextreme build-theme [--base-theme][--input-file][--make-swatch][--output-file][--output-color-scheme]
```

Export theme variables as a less/scss file:
```bash
> npx -p devextreme-cli devextreme export-theme-vars [--base-theme][--input-file][--output-format][--output-file][--base]
```

Export theme variables as a json metadata file:
```bash
> npx -p devextreme-cli devextreme export-theme-meta [--base-theme][--input-file][--output-file][--base]
```


### <a name="theme-builder-global"></a>Global package usage

Build a custom color scheme:
```bash
> devextreme build-theme [--base-theme][--input-file][--make-swatch][--output-file][--output-color-scheme][--help]
```

Export theme variables as a less/scss file:
```bash
> devextreme export-theme-vars [--base-theme][--input-file][--output-format][--output-file][--base][--help]
```

Export theme variables as a json metadata file:
```bash
> devextreme export-theme-meta [--base-theme][--input-file][--output-file][--base][--help]
```


### <a name="theme-builder-arguments"></a>Command line arguments

* `--base-theme` – Specifies a base theme’s name (the default value is `generic.light`)

* `--input-file` – Specifies the name of the file that contains input data (a .json file with metadata or a .less/.scss file with Bootstrap variables)

* `--output-file` – Specifies the output file name

* `--output-format` – Specifies the format of the output variables (`less` or `scss`) (the default value is `less` or the extension extracted from the `--output-file` value (if it contains any))

* `--output-color-scheme` – Specifies the custom color scheme name (the default value is `custom-scheme`)

* `--make-swatch` – If present, adds a CSS scope to each CSS rule (.dx-swatch-xxx), where xxx is the value from the `--output-color-scheme` parameter

* `--base` – Exports only base variables which are used to produce the derived variables


### <a name="theme-builder-examples"></a>Examples

The following command generates a new `custom` color swatch using Generic Dark as a base theme:
```bash
> npx -p devextreme-cli devextreme build-theme --base-theme="generic.dark" --make-swatch --output-color-scheme="custom"
```

The following command generates a new `pink` color scheme based on Material Blue Light theme using constants from pink.json file:
```bash
> npx -p devextreme-cli devextreme build-theme --base-theme="material.blue.light" --input-file="pink.json" --output-color-scheme="pink"
```

The following command exports base variables for Generic Carmine theme in LESS format:
```bash
> npx -p devextreme-cli devextreme export-theme-vars --base-theme="generic.carmine" --output-format="less" --base
```

## <a name="license"></a>License

Familiarize yourself with the
[DevExtreme License](https://js.devexpress.com/Licensing/).
[Free trial is available!](http://js.devexpress.com/Buy/)

**DevExtreme CLI is released as a MIT-licensed (free and open-source) add-on to DevExtreme.**

## <a name="support"></a>Support

Feel free to ask questions, share your ideas and report bugs using [DevExpress Support Center](https://www.devexpress.com/Support/Center).
