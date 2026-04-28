export default function collectRows() {
  const rows = Array.from(document.querySelectorAll('#invoice_item_rows tr:not(:last-child)'));
  return rows.map((tr, index) => {
    const existing = tr.getAttribute('data-esti-row-id');
    const id = existing || `row-${index + 1}`;
    if (!existing) tr.setAttribute('data-esti-row-id', id);
    const textarea = tr.querySelector('textarea');
    const text = textarea ? textarea.value : '';
    return { id, index, el: tr, textarea, text };
  });
}
