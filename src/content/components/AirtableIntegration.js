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
        
        this.templates.forEach(template => {
            if (template.fields.types && template.fields.types.includes(this.typeMapping[currentType])) {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = template.fields.name;
                templateSelect.appendChild(option);
            }
        });
        
        templateSelect.addEventListener('change', (e) => this.applyTemplate(e.target));
        const descriptionField = row.querySelector('textarea');
        descriptionField.parentNode.insertBefore(templateSelect, descriptionField);
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
