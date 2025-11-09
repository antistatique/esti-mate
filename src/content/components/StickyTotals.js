export default class StickyTotals {
  constructor() {
    this.table = null;
    this.footer = null;
    this.boundUpdate = null;
  }

  init() {
    this.table = document.querySelector('#document-edit-line-items');
    this.footer = this.table?.querySelector('tfoot') || null;

    if (!this.table || !this.footer) {
      this.destroy();
      return;
    }

    this.boundUpdate = this.boundUpdate || this.updateStickyState.bind(this);
    window.addEventListener('scroll', this.boundUpdate, { passive: true });
    window.addEventListener('resize', this.boundUpdate);
    this.updateStickyState();
  }

  updateStickyState() {
    if (!this.table || !this.footer) {
      return;
    }

    const tableRect = this.table.getBoundingClientRect();
    const footerRect = this.footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const stuck =
      tableRect.bottom > viewportHeight + 0.5 &&
      footerRect.bottom >= viewportHeight - 0.5;
    this.footer.classList.toggle('is-stuck', stuck);
  }

  destroy() {
    if (this.boundUpdate) {
      window.removeEventListener('scroll', this.boundUpdate);
      window.removeEventListener('resize', this.boundUpdate);
    }
    this.footer?.classList.remove('is-stuck');
    this.table = null;
    this.footer = null;
  }
}
