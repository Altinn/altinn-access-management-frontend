/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/// <reference types="cypress" />

const path = require('path');

const { defineConfig } = require('cypress');
const fs = require('fs-extra');
const downloadsPath = path.join('downloads');

module.exports = defineConfig({
  projectId: '2f6egk',
  video: false,
  retries: {
    runMode: 2,
  },
  e2e: {
    specPattern: 'src/e2e/**/*.js',
    supportFile: 'src/support/index.js',
    fixturesFolder: 'src/fixtures',
    chromeWebSecurity: false,
    downloadsFolder: 'downloads',
    failOnStatusCode: false,
    experimentalSessionAndOrigin: true,

    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'cypress/results/results-[hash].xml',
      toConsole: true,
      attachments: true,
    },

    setupNodeEvents(on, config) {
      on('task', {
        getPdfContent(pdfName) {
          const pdfPathname = path.join(downloadsPath, pdfName);
          let dataBuffer = fs.readFileSync(pdfPathname);
          return pdf(dataBuffer);
        },
      });
      function getConfigurationByFile(file) {
        const pathToConfigFile = path.resolve('src/config', `${file}.json`);
        return fs.readJson(pathToConfigFile);
      }
      var actual = config.env.environment.substr(0, 4);
      console.log(actual);
      var file = actual || 'at24';
      return getConfigurationByFile(file);
    },
  },
});
