export default class PMTools {
  constructor() {
    this.pmField = null;
    this.totalHours = 0;
    this.pmPercentage = 25; // Default value
    this.app = null;
  }

  init(settings, app) {
    this.app = app;
    this.pmField = document.querySelector('#invoice_item_rows tr:last-of-type .quantity input');
    this.pmPercentage = settings.pmPercentage || this.pmPercentage;
    this.createPMTools();
    this.addEventListeners();
    this.updatePMTotal();
  }

  createPMTools() {
    const pmToolsHtml = `
      <div id="pm-tools">
        <p>PM hours: <span id="pm-total"></span></p>
        <button id="pm-update">Update PM hours</button>
        <label for="pm-percentage">PM Percentage:</label>
        <input type="number" id="pm-percentage" value="${this.pmPercentage}">
      </div>
    `;
    this.pmField.insertAdjacentHTML('afterend', pmToolsHtml);
  }

  addEventListeners() {
    document.getElementById('pm-update').addEventListener('click', () => this.updatePMField());
    document.getElementById('pm-percentage').addEventListener('input', (e) => {
      this.pmPercentage = parseFloat(e.target.value);
      this.updatePMTotal();
    });
    document.querySelectorAll('#invoice_item_rows tr:not(:last-child) .quantity input').forEach(input => {
      input.addEventListener('input', () => this.updatePMTotal());
    });
  }

  updatePMTotal() {
    this.calculateTotalHours();
    const pmHours = (this.totalHours * this.pmPercentage) / 100;
    document.getElementById('pm-total').textContent = pmHours.toFixed(2);
  }

  calculateTotalHours() {
    this.totalHours = Array.from(document.querySelectorAll('#invoice_item_rows tr:not(:last-child) .quantity input'))
      .reduce((total, input) => total + parseFloat(input.value || 0), 0);
  }

  updatePMField() {
    const pmHours = (this.totalHours * this.pmPercentage) / 100;
    this.pmField.value = pmHours.toFixed(2);
    this.pmField.dispatchEvent(new Event('change', { bubbles: true }));
    this.app.generateSummary(); // Update the summary
  }
}
