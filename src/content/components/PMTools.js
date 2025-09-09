export default class PMTools {
  constructor() {
    this.pmField = null;
    this.totalHours = 0;
    this.app = null;
  }

  init(settings, app) {
    this.app = app;
    this.pmField = document.querySelector('#invoice_item_rows tr:last-of-type .quantity input');
    this.pmPercentage = settings.pmPercentage;

    this.removeIfAlreadyExisting();
    this.createPMTools();
    this.addEventListeners();
    this.updatePMTotal();
  }

  removeIfAlreadyExisting() {
    const existingPMTools = document.getElementById('pm-tools');
    if (existingPMTools) {
      existingPMTools.remove();
      // remove the event listeners
      document.getElementById('pm-update').removeEventListener('click', this.updatePMTotal);
      document.getElementById('pm-percentage').removeEventListener('input', this.updatePMTotal);
    }
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
    // Scope event listeners to the row where PM tools were added
    const pmToolsDiv = document.querySelector('#invoice_item_rows tr:last-of-type #pm-tools');
    
    // Event listener for updating PM field
    pmToolsDiv.querySelector('#pm-update').addEventListener('click', (e) => this.updatePMField(e));

    // Event listener for percentage input change
    pmToolsDiv.querySelector('#pm-percentage').addEventListener('input', (e) => {
      this.pmPercentage = parseFloat(e.target.value);
      this.updatePMTotal();
    });

    // Attach input event listener only once at the parent level using event delegation
    const invoiceRows = document.querySelector('#invoice_item_rows');
    invoiceRows.removeEventListener('input', this.onQuantityInputChange); // Ensure no duplicate listeners
    invoiceRows.addEventListener('input', this.onQuantityInputChange.bind(this));
  }

  onQuantityInputChange(e) {
    if (e.target.closest('tr') && e.target.matches('.quantity input')) {
      this.updatePMTotal();
    }
  }

  updatePMTotal(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
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
