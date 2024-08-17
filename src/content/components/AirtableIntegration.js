import { fetchAirtableData } from '../../lib/airtable.js';

export default class AirtableIntegration {
  constructor() {
    this.templates = [];
    this.types = [];
    this.app = null;
  }

  async init(settings, app) {
    this.app = app;
    if (!settings.airtableWorkspace || !settings.airtableKey) {
      console.log('Airtable settings not found');
      return;
    }

    try {
      this.templates = await fetchAirtableData('templates', settings);
      this.types = await fetchAirtableData('types', settings);
      this.createTemplateSelectors();
    } catch (error) {
      console.error('Failed to fetch Airtable data:', error);
    }
  }

  createTemplateSelectors() {
    document.querySelectorAll('#invoice_item_rows tr').forEach(row => {
      const typeSelect = row.querySelector('select');
      const currentType = typeSelect.value;

      const templateSelect = document.createElement('select');
      templateSelect.className = 'airtable-template';
      templateSelect.innerHTML = '<option value="">Select a template</option>';

      this.templates.forEach(template => {
        if (template.fields.types && template.fields.types.includes(currentType)) {
          const option = document.createElement('option');
          option.value = template.id;
          option.textContent = template.fields.name;
          templateSelect.appendChild(option);
        }
      });

      templateSelect.addEventListener('change', (e) => this.applyTemplate(e.target));

      const descriptionField = row.querySelector('textarea');
      descriptionField.parentNode.insertBefore(templateSelect, descriptionField);
    });
  }

  applyTemplate(select) {
    const templateId = select.value;
    if (!templateId) return;

    const template = this.templates.find(t => t.id === templateId);
    if (template && template.fields.content) {
      const descriptionField = select.nextElementSibling;
      descriptionField.value = template.fields.content;
      descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
      this.app.generateSummary(); // Add this line to update the summary
    }
  }
}
