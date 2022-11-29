# altinn-access-management-frontend
Frontend for access management

# Front end for Altinn 3 Authorization

## Getting started 🚀

To run or build the front end standalone (without Docker), you'll need [Node](https://nodejs.org/) and [Yarn](https://yarnpkg.com/getting-started/install). Simply run `yarn` to install dependencies and then `yarn dev` to start the development environment.

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

### TypeScript

Use [PascalCase](https://techterms.com/definition/pascalcase) for both component and file names. We use ESLint with Prettier rules — you might want to add an ESLint plugin to your editor. 

### CSS

We name css classes using camelCase and use one concept from [BEM naming convention](http://getbem.com/naming/). The concept we use is that we give classes '__' extension when there's variants of the class. E.g. alert__danger alert__warning. basically everywhere you'd use the extension '--', we use __ instead. The reason for this is that we can link stylesheets directly, which improves readability.


## Tests 🧨

Run `yarn test` to run cypress tests in browser.

Run `yarn coverage` to see pretty test coverage stats.

## Building and deploying 🚚

To create a distributable bundle, run `yarn build`. Environment variables set at build time will be baked into the bundle (e.g. `VITE_DEFAULT_LOCALE=en yarn build`). See the resulting `dist/index.html` for an example on how to load the build. At the moment you have to search for "/locales/${t.language}.json" and change it to "./locales/${t.language}.json".

If the bundled files are to be served from a path other than the server root, you must pass the `--base=/path/to/folder/` argument to `yarn build`. The trailing slash is important.
