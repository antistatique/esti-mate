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
      // Use chrome or browser API for cross-browser compatibility
      const browserAPI = typeof chrome !== 'undefined' && chrome.storage ? chrome : browser;
      
      browserAPI.storage.local.get(['airtableWorkspace', 'airtableKey', 'pmPercentage'], (items) => {
        this.settings = {
          airtableWorkspace: items.airtableWorkspace || '',
          airtableKey: items.airtableKey || '',
          pmPercentage: items.pmPercentage || 25
        };
        resolve();
      });
    });
  }

  generateSummary() {
    this.summary.updateSummary();
  }
}
