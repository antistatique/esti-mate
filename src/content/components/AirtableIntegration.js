import { fetchAirtableData } from '../../lib/airtable.js';

export default class AirtableIntegration {
  constructor() {
    this.templates = [];
    this.typeMapping = [];
    this.app = null;
  }

  async init(settings, app) {
    this.app = app;
    if (!settings.airtableWorkspace || !settings.airtableKey) {
      console.warn('Airtable settings not found');
      return;
    }

    try {
      this.typeMapping = await this.fetchTypeMapping(settings);
      this.templates = await fetchAirtableData('templates', settings);


      this.setupEventDelegation();
      this.createTemplateSelectors();
    } catch (error) {
      console.error('Failed to fetch Airtable data:', error);
    }
  }

  async fetchTypeMapping(settings) {
      try {
          // Fetch types from Airtable
          const types = await fetchAirtableData('types', settings);
          
          // Create a mapping from human-readable names to type IDs
          return types.reduce((map, typeRecord) => {
              map[typeRecord.fields.name] = typeRecord.id;
              return map;
          }, {});

      } catch (error) {
          console.error('Failed to fetch or map types:', error);
          throw error; // Re-throw the error for further handling
      }
  }

  setupEventDelegation() {
    // Remove existing delegation listener to prevent duplicates
    const invoiceRows = document.querySelector('#invoice_item_rows');
    if (invoiceRows && !invoiceRows.hasAttribute('data-airtable-listener')) {
      invoiceRows.addEventListener('change', (e) => {
        // Check if the changed element is a type select (not a template select)
        if (e.target.matches('select:not(.airtable-template)')) {
          const row = e.target.closest('tr');
          const templateSelect = row.querySelector('.airtable-template');
          
          if (templateSelect) {
            templateSelect.value = ''; // Reset template selection
            this.updateTemplateOptions(templateSelect, e.target.value);
          }
        }
      });
      // Mark that we've added the listener to prevent duplicates
      invoiceRows.setAttribute('data-airtable-listener', 'true');
    }
  }

  createTemplateSelectors() {
    document.querySelectorAll('#invoice_item_rows tr').forEach(row => {
      // Ensure we don't add duplicate template selectors
      if (!row.querySelector('.airtable-template')) {
        const typeSelect = row.querySelector('select');
        const currentType = typeSelect.value;
        
        const templateSelect = document.createElement('select');
        templateSelect.className = 'airtable-template pds-input pds-input-sm';
        templateSelect.style.marginBottom = '1em';
        templateSelect.innerHTML = '<option value="">Select a template</option>';
        
        // Populate templates for current type
        this.updateTemplateOptions(templateSelect, currentType);
        
        // Only add template selection listener (type changes handled by event delegation)
        templateSelect.addEventListener('change', (e) => this.applyTemplate(e.target));
        const descriptionField = row.querySelector('textarea');
        descriptionField.parentNode.insertBefore(templateSelect, descriptionField);
      }
    });
  }

  updateTemplateOptions(templateSelect, selectedType) {
    // Clear existing options except the first one
    templateSelect.innerHTML = '<option value="">Select a template</option>';
    
    // Add templates that match the selected type
    this.templates.forEach(template => {
      if (template.fields.types && template.fields.types.includes(this.typeMapping[selectedType])) {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.fields.name;
        templateSelect.appendChild(option);
      }
    });
  }

  applyTemplate(select) {
    const templateId = select.value;
    if (!templateId) return;

    const template = this.templates.find(t => t.id === templateId);
    if (template && template.fields.content) {
      const descriptionField = select.nextElementSibling;
      descriptionField.value = template.fields.content;

      this.adjustTextareaHeight(descriptionField);

      descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
      this.app.generateSummary(); // Add this line to update the summary
    }
  }

  adjustTextareaHeight(textarea) {
    // Reset the height to auto to calculate the correct scroll height
    textarea.style.height = 'auto';
    // Set the height to the scroll height plus some padding (optional)
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
  }
}
