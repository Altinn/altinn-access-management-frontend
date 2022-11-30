# Frontend for access management

## Getting started 🚀

To run or build the frontend, you'll need [Node](https://nodejs.org/) and [Yarn](https://yarnpkg.com/getting-started/install). Simply run `yarn` to install dependencies and then `yarn start` to start the development environment.

## Project organisation 🧩

The main entry point is `/src/main.tsx`. You'll find React components under `/src/components/`.

The basic file structure for components should be:

```
If the subcomponent's not reusable
components\
  ComponentName\
    - ComponentName.tsx
    - ComponentName.test.tsx (unit tests)
    - index.ts (public interface for the component)
    - style.css (if needed)
      SubComponent1\
        - SubComponent1.tsx (if the subcomponent is not reusable)
        - index.ts (public interface for the component)
        - style.css (if needed)
        SubComponent2\
          - SubComponent2.tsx (if the subcomponent is not reusable)
          - index.ts (public interface for the component)
          - style.css (if needed)


If the subcomponents are reusable and being used by other classes
components\
  ComponentName\
    - ComponentName.tsx
    - ComponentName.test.tsx (unit tests)
    - index.ts (public interface for the component)
    - style.css (if needed)
  SubComponent1\
    - SubComponent1.tsx (if the subcomponent is not reusable)
    - SubComponent1.test.tsx (unit tests)
    - index.ts (public interface for the component)
    - style.css (if needed)
  SubComponent2\
    - SubComponent2.tsx (if the subcomponent is not reusable)
    - SubComponent2.test.tsx (unit tests)
    - index.ts (public interface for the component)
    - style.css (if needed)

```

## Coding conventions 👮‍♀️

### ClassNames

Use [PascalCase](https://techterms.com/definition/pascalcase) for both component and file names.

### Code style

We use [eslint](https://eslint.org/), [prettier](https://prettier.io/), typescript, and automatically set up git hooks to enforce
these on commits. To avoid confusion, it is recommended to set this up your IDE.

### Visual Studio Code

Install the [eslint extension from the marketplace](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). Configure your IDE to run `eslint --fix` on save (prettier will also reformat your code when doing this).

### WebStorm and IntelliJ IDEA

Configure your IDE to run `eslint --fix` on save (prettier will also reformat your code when doing this). It is also recommended to
[set up Prettier as the default formatter](https://www.jetbrains.com/help/webstorm/prettier.html#ws_prettier_default_formatter).

### CSS

We name css classes using camelCase and use one concept from [BEM naming convention](http://getbem.com/naming/). The concept we use is that we give classes '__' extension when there's variants of the class. E.g. alert__danger alert__warning. basically everywhere you'd use the extension '--', we use __ instead. The reason for this is that we can link stylesheets directly, which improves readability.


## Tests 🧨

Run `yarn test` to run cypress tests in browser.

Run `yarn coverage` to see pretty test coverage stats.

Run 'yarn lint' to run lint checks

## Building and deploying 🚚

To create a distributable bundle, run `yarn build`. Environment variables set at build time will be baked into the bundle (e.g. `VITE_DEFAULT_LOCALE=en yarn build`). See the resulting `dist/index.html` for an example on how to load the build. At the moment you have to search for "/locales/${t.language}.json" and change it to "./locales/${t.language}.json".

If the bundled files are to be served from a path other than the server root, you must pass the `--base=/path/to/folder/` argument to `yarn build`. The trailing slash is important.

## Common problems in vs code
1. Sometimes it's needed to restart eslint for it to work properly. E.g. When switching branches, eslint hangs sometimes. To fix this problem in vs code: Do the hot key for workbench.action.quickNaviagtePreviousInFilePicker and run command 'restart eslint server' or restart vs code.
2. It's a common problem when writing reducers in rtk; invalid typescript-errors, prettier and lint-errors occur saying e.g. ',' is missing when in reality it's not. My suggestion is to restart vs code or ignore the error(if it's still possible to run the code). 
