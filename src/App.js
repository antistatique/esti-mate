const { Subject } = rxjs;

class App {
  constructor() {
    this.state = {
      total: 0,
      factor: 20,
    };

    this.totalTrigger = new Subject();
  }

  updateTotal(number) {
    const total = this.state.total + number;
    this.state = {...this.state, total };
    this.totalTrigger.next();    
  }

  updateFactor(factor) {
    this.state = {...this.state, factor };
    this.totalTrigger.next();
  }

  format(number) {
    return parseFloat(number.replace(/\'/g, ''), 10);
  }

  getTotalPm() {
    return this.state.total * this.state.factor / 100;
  }
}