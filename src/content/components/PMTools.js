// File: src/content/components/PMTools.js

export default class PMTools {
  constructor() {
    this.pmField = null;
    this.totalHours = 0;
    this.pmPercentage = 25; // Default value
    this.app = null;
  }

  init(settings, app) {
    this.app = app;
    this.pmField = document.querySelector('#invoice_item_rows tr:last-child .quantity input');
    this.pmPercentage = settings.pmPercentage || this.pmPercentage;
    this.createPMTools();
    this.addEventListeners();
    this.updatePMTotal();
  }

  // ... (rest of the code remains the same)

  updatePMField() {
    const pmHours = (this.totalHours * this.pmPercentage) / 100;
    this.pmField.value = pmHours.toFixed(2);
    this.pmField.dispatchEvent(new Event('change', { bubbles: true }));
    this.app.generateSummary(); // Add this line to update the summary
  }
}
