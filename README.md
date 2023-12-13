# Frontend for access management

## Getting started 🚀

To run or build the frontend, you'll need [Node](https://nodejs.org/) and [Yarn](https://yarnpkg.com/getting-started/install). Simply run `yarn` on root to install dependencies and then `yarn start` to start the development environment. The current prefix is http://localhost:5173 (but this port might changed later). FYI: http://localhost:5173 doesn't show anything right now and it shouldn't show anything either. Go to http://localhost:5173/accessmanagement/ui/api-delegations to see one of the main views of API delegations. Look in the folder src/routes/Router to see different paths to the different components.

## Project organisation 🧩

The main entry point is `/src/main.jsx`. You'll find React components under `/src/components/`.

The components can be placed 2 ways, either:

```
If the component's only reusable within a specific feature
features\
  fetureName\
    components\
    - ComponentName.test.tsx (unit tests)
    - index.ts (public interface for the component)
    - style.css (if needed)

Or:

If the components are reusable and being used by other classes
components/
  ComponentName/
    - ComponentName.tsx
    - ComponentName.test.tsx (unit tests)
    - style.css (if needed)

```

## Coding conventions 👮‍♀️

### Naming convention on branches
Start with these names for your branch depending on what your branch includes.

  - bugfix/
  - chore/
  - dependencies/
  - documentation/
  - enhancement/
  - feat/single-rights/issue-number
  - feat/api-delegations/issue-number
  - feat/general/issue-number       (When it's not related to any features of the features above or relates to both)

### ClassNames

Use [PascalCase](https://techterms.com/definition/pascalcase) for component file names.

### Code style

We use [eslint](https://eslint.org/), [prettier](https://prettier.io/), typescript, and automatically set up git hooks to enforce
these on commits. To avoid confusion, it is recommended to set this up your IDE.

### Visual Studio Code

Install the [eslint extension from the marketplace](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). Configure your IDE to run `eslint --fix` on save (prettier will also reformat your code when doing this).

### WebStorm and IntelliJ IDEA

Configure your IDE to run `eslint --fix` on save (prettier will also reformat your code when doing this). It is also recommended to
[set up Prettier as the default formatter](https://www.jetbrains.com/help/webstorm/prettier.html#ws_prettier_default_formatter).

### CSS

We use standard camelCase for classnames to enable linking of the stylesheets directly, improving simplicity in the process. Instead of using [BEM naming convention](http://getbem.com/naming/), we separate each Element and Modifier into separate names and use regular css (eks: `.accordion.open`) to access the combination.


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


## Run code with access-management backend

To add test data to the app, do the following:


- Clone following repo and follow readme in that repo: https://github.com/Altinn/app-localtest You have completed this step when you have localtest running locally through the command `dotnet run`

  - If following the readme on localTest doesn't work, you can try doing this

  - Start the loadbalancer container that routes between the local platform services and the app

     ```bash
     docker-compose up -d --build
     ```
   
   
  - Navigate to the `src` folder in the app-localtest repo

     ```bash
     cd src/
     ```

  - Run below command in that folder

     ```bash
     docker-compose up -d --build
     ```

  - Set path to app folder in local platform services. The simplest way to do this is:

     - Edit the appsettings.json file:
        - Open `appSettings.json` in an editor.
        - Change the setting `"AppRepsitoryBasePath"` to the path to the folder where you've cloned your frontend and backend repos. (Be aware that on mac you don't have c:/ in your paths.)
        - Create folder AltinnPlatformLocal wherever you like, copy and paste path to that folder in LocalTestingStorageBasePath.
        - Set LocalTestingStaticTestDataPath to your full path to the file in src/testdata     
          

  - Start the local platform services (make sure you are in the src folder)
  
     ```bash
     dotnet run
     ```

- Add the following to your hosts file. Path to file on mac: /private/etc/hosts. Path to file on Windows: c:\Windows\System32\Drivers\etc\hosts.
```#Subdomain for accessmanagement
#
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1    localhost #ipv4
0000:0000:0000:0000:0000:0000:0000:0001 localhost #ipv6
255.255.255.255    broadcasthost
# Added by Docker Desktop
# To allow the same kube context to work on the host and the container:
127.0.0.1 kubernetes.docker.internal #ipv4
0000:0000:0000:0000:0000:0000:0000:0001 kubernetes.docker.internal #ipv6
# End of section
   ```

## Set up database: 
  Download [PostgreSQL](https://www.postgresql.org/download/). USE INSTALLER, NOT HOMEBREW ON MAC. (Currently using 14 in deploy environments, but 15 works locally if you need those extra features 15 gives you)
- Install database server (choose your own admin password and save it some place you can find it again)
- Start PG admin
- Create the following users by right clicking Login/Group Roles (with privileges for authorizationdb):
  1. Name: platform_authorization_admin (superuser, canlogin). Set password as Password.
  2. Name: platform_authorization (canlogin). Set password as Password.
- Create database and call it authorizationdb and set owner to platform_authorization_admin.
- Create schema delegations in authorizationdb
- Set platform_authorization_admin as owner

### Run backend and frontend
- Open Altinn-Access-Management repo in an IDE and go to following folder. IT IS AN OWN REPO FOUND HERE: https://github.com/Altinn/altinn-access-management

  ```bash
   cd src/Altinn.AccessManagement.UI
   ```
- ON MAC: change WorkspacePath in file: src/Altinn.AccessManagement/appsettings.Development.json to "Altinn.AccessManagement.Persistence/Migration".

- Start Access Management Backend

   ```bash
   dotnet run
   ```
- Start the BFF (AccessManagement.UI)
  ```bash
   dotnet run
   ```

- Start Access Management Frontend (if not started)

  - Go to access-management-frontend repo
  - Run 'yarn'
  - run 'yarn start'

- Go to http://local.altinn.cloud/

- You should now see localtest login page with access management as the only application

- Choose an account and click on button to proceed to react-app

# Build, Deploy and Release

## Pull Request Labels
[pr-labeler](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/workflows/pr-labeler.yml) action is triggered for each pull request. 
Based on the branch name, this action adds a label to the pull request. The configuration for the labels can be found [here](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/pr-labeler.yml).

## Build

### Frontend
[build-frontend](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/workflows/build-frontend.yaml) action is triggered for each pull request with frontend change. This action runs the linting and unit tests for the frontend components.

### Backend
[build-and-analyze-backend](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/workflows/build-and-analyze-backend.yml) action is triggered for pull requests with backend change. This action builds, runs the unit tests for backend and analyzes the backend code.

## Deploy
Code is continously integrated and deployed to all testing environments (AT environments). [build-publish-deploy-via-ghcr](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/workflows/build-publish-deploy-via-ghcr.yml) is triggered when a pull request is merged into  main branch.
On each run, the code is built, packaged and published to Github Container registry as [altinn-access-management-frontend](https://github.com/Altinn/altinn-access-management-frontend/pkgs/container/altinn-access-management-frontend). Each image is tagged with the github commit sha. The package is then deployed to an azure container app in testing environment.
The environment variables, secrets for the action are setup in the repository settings.

## Release
The application has a release every wednesday. [scheduled-release](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/workflows/scheduled-release.yml) action is triggered every wednesday 00.00. This action drafts a release, tags the latest package with the release version, f.ex this package has a release version [v2023.1](https://github.com/Altinn/altinn-access-management-frontend/pkgs/container/altinn-access-management-frontend/88857835?tag=14685620a8aaf7b867b5a346155ca09ef9c34f3d).
The action drafts the release on different categories. The changes are categorized based on the pull request label. F.ex, A PR with a label bugfix is categorized under bug. The detailed release draft configuration can be found [here](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/release-drafter.yml)
The deploy in charge for the week, deploys the application to a specific environment(TT02/Prod) using the action [deploy-to-environment](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/workflows/deploy-to-environment.yml). The drafted release is then reviewed manually and published by the deploy in charge.
