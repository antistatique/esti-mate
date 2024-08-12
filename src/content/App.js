// File: src/content/App.js

import Summary from './components/Summary.js';
import PMTools from './components/PMTools.js';
import AirtableIntegration from './components/AirtableIntegration.js';

export default class App {
  constructor() {
    this.summary = new Summary();
    this.pmTools = new PMTools();
    this.airtable = new AirtableIntegration();
    this.settings = {};
  }

  async init(appView) {
    try {
      await this.loadSettings();
      this.summary.init();
      
      if (appView === 'edit' || appView === 'new') {
        this.pmTools.init(this.settings, this);
        await this.airtable.init(this.settings, this);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'getStorageData' }, (response) => {
        this.settings = response.data;
        resolve();
      });
    });
  }

  generateSummary() {
    this.summary.updateSummary();
  }
}
