const { Subject } = rxjs;

/**
 * Centralize plugin's pure logic and Observables
 *
 * @class App
 */
class App {
  constructor() {
    this.state = {
      total: 0,
      factor: 25,
    };

    this.totalTrigger = new Subject();

    // Import src/libs
    this.generateSummary = generateSummary;
    this.initPM = initPM;
    this.airtableInit = airtableInit;
  }

  updateTotal(number) {
    const total = this.state.total + number;
    this.state = { ...this.state, total };
    this.totalTrigger.next();
  }

  updateFactor(factor) {
    this.state = { ...this.state, factor };
    this.totalTrigger.next();
  }

  format(number) {
    return parseFloat(number.replace(/'/g, ''), 10);
  }

  getTotalPm() {
    return (this.state.total * this.state.factor) / 100;
  }
}
