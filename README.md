# DevExtreme CLI

DevExtreme CLI is a set of command-line tools to be used with DevExtreme controls library.

## Installation

```bash
npm i -g devextreme-cli
```

Alternatively, you can execute ThemeBuilder commands by using npx.


## Create a new DevExtreme application

### Angular
```bash
devextreme new angular-app my-app
```


## ThemeBuilder

### One-off usage

Build a custom color scheme:
```bash 
> npx devextreme-cli build-theme [--base-theme][--input-file][--make-swatch][--output-file][--output-color-scheme]
```

Export theme variables as a less/scss file:
```bash
> npx devextreme-cli export-theme-vars [--base-theme][--input-file][--output-format][--output-file][--base]
```

Export theme variables as a json metadata file:
```bash
> npx devextreme-cli export-theme-meta [--base-theme][--input-file][--output-file][--base]
```


### Global package usage

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


### Command line arguments

* `--base-theme` – Specifies a base theme’s name (the default value is `generic.light`) 

* `--input-file` – Specifies the name of the file that contains input data (a .json file with metadata or a .less/.scss file with Bootstrap variables)

* `--output-file` – Specifies the output file name

* `--output-format` – Specifies the format of the output variables (`less` or `scss`) (the default value is `less` or the extension extracted from the `--output-file` value (if it contains any))

* `--output-color-scheme` – Specifies the custom color scheme name (the default value is `custom-scheme`)

* `--make-swatch` – If present, adds a CSS scope to each CSS rule (.dx-swatch-xxx), where xxx is the value from the `--output-color-scheme` parameter

* `--base` – Exports only base variables which are used to produce the derived variables


### Examples

The following command generates a new `custom` color swatch using Generic Dark as a base theme:
```bash 
> npx devextreme-cli build-theme --base-theme="generic.dark" --make-swatch --output-color-scheme="custom"
```

The following command generates a new `pink` color scheme based on Material Blue Light theme using constants from pink.json file:
```bash 
> npx devextreme-cli build-theme --base-theme="material.blue.light" --input-file="pink.json" --output-color-scheme="pink"
```

The following command exports base variables for Generic Carmine theme in LESS format:
```bash 
> npx devextreme-cli export-theme-vars --base-theme="generic.carmine" --output-format="less" --base 
```

## Links

- Official website: [js.devexpress.com](https://js.devexpress.com)
- Pricing: [js.devexpress.com/buy](https://js.devexpress.com/Buy)
- Licensing: [js.devexpress.com/licensing](https://js.devexpress.com/Licensing)
- Support: [www.devexpress.com/support](https://www.devexpress.com/support) 
