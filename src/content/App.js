// File: src/content/App.js

import Summary from './components/Summary.js';
import PMTools from './components/PMTools.js';
import AirtableIntegration from './components/AirtableIntegration.js';
import SpellChecker from './components/SpellChecker.js';
import StickyTotals from './components/StickyTotals.js';

export default class App {
  constructor() {
    this.summary = new Summary();
    this.pmTools = new PMTools();
    this.airtable = new AirtableIntegration();
    this.spellChecker = new SpellChecker();
    this.stickyTotals = new StickyTotals();
    this.settings = {};
  }

  async init(appView) {
    try {
      await this.loadSettings();
      this.summary.init();
      // Always bind the spellchecker so the menu event works on any view
      this.spellChecker.init(this.settings, this);
      
      if (appView === 'edit' || appView === 'new') {
        this.stickyTotals.init();
        this.pmTools.init(this.settings, this);
        await this.airtable.init(this.settings, this);
      } else {
        this.stickyTotals.destroy();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  async loadSettings() {
    return new Promise((resolve) => {
      // Use chrome or browser API for cross-browser compatibility
      const browserAPI = typeof chrome !== 'undefined' && chrome.storage ? chrome : browser;
      
      browserAPI.storage.local.get(['airtableWorkspace', 'airtableKey', 'pmPercentage', 'serverUrl'], (items) => {
        this.settings = {
          airtableWorkspace: items.airtableWorkspace || '',
          airtableKey: items.airtableKey || '',
          pmPercentage: items.pmPercentage || 25,
          serverUrl: items.serverUrl || 'https://esti-mate.antistatique.io',
        };
        resolve();
      });
    });
  }

  generateSummary() {
    this.summary.updateSummary();
  }
}
