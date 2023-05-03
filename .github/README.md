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
The deploy in charge for he week, deploys the application to specific environment using the action [deploy-to-environment](https://github.com/Altinn/altinn-access-management-frontend/blob/main/.github/workflows/deploy-to-environment.yml). The drafted release is then reviewed manually and published by the deploy in charge.

