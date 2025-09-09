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
      // Remove event listeners BEFORE removing the elements
      const pmUpdate = document.getElementById('pm-update');
      const pmPercentage = document.getElementById('pm-percentage');
      
      if (pmUpdate) {
        pmUpdate.removeEventListener('click', this.updatePMTotal);
      }
      if (pmPercentage) {
        pmPercentage.removeEventListener('input', this.updatePMTotal);
      }
      
      // Now remove the container
      existingPMTools.remove();
    }
  }

  createPMTools() {
    const pmToolsHtml = `
      <div id="pm-tools">
        <p style="margin: 0;">PM hours: <span id="pm-total"></span></p>
        <a href="#" id="pm-update" style="color: #007cba; text-decoration: underline; cursor: pointer;">Update PM hours</a>
        <br>
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
    const roundedPmHours = Math.ceil(pmHours);
    document.getElementById('pm-total').textContent = roundedPmHours;
  }

  calculateTotalHours() {
    this.totalHours = Array.from(document.querySelectorAll('#invoice_item_rows tr:not(:last-child) .quantity input'))
      .reduce((total, input) => total + parseFloat(input.value || 0), 0);
  }

  updatePMField(e) {
    e.preventDefault(); // Prevent default link behavior
    
    // Recalculate total hours first
    this.calculateTotalHours();
    
    // Calculate and set PM hours (rounded up to nearest integer)
    const pmHours = (this.totalHours * this.pmPercentage) / 100;
    const roundedPmHours = Math.ceil(pmHours);
    this.pmField.value = roundedPmHours;
    this.pmField.dispatchEvent(new Event('change', { bubbles: true }));
    this.app.generateSummary(); // Update the summary
  }
}
