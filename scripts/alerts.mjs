export class AlertNumberMissing {
    identifier = "alert-missing";
    constructor() { }
    message() { return "A number should be entered"; }
}
export class AlertNumberBadInput {
    identifier = "alert-bad-input";
    constructor() { }
    message() { return "A number should be entered"; }
}
export class AlertNumberUnderflow {
    min;
    identifier = "alert-underflow";
    constructor(min) {
        this.min = min;
    }
    message() { return `Number should be at least ${this.min}`; }
}
export class AlertNumberOverflow {
    max;
    identifier = "alert-overflow";
    constructor(max) {
        this.max = max;
    }
    message() { return `Number should be at most ${this.max}`; }
}
export class AlertNumberStepMismatch {
    step;
    identifier = "alert-step-mismatch";
    constructor(step) {
        this.step = step;
    }
    message() {
        if (this.step === 1) {
            return `Number should be an integer`;
        }
        else {
            return `Number should be a multiple of ${this.step}`;
        }
    }
}
export class AlertNumbersMissing {
    identifier = "alert-missing";
    constructor() { }
    message() { return "Number(s) should be entered"; }
}
export class AlertNumbersBadInput {
    identifier = "alert-bad-input";
    constructor() { }
    message() { return "Number(s) should be entered"; }
}
export class AlertNumbersLengthUnderflow {
    lmin;
    identifier = "alert-length-underflow";
    constructor(lmin) {
        this.lmin = lmin;
    }
    message() { return `At least ${this.lmin} numbers should be given`; }
}
export class AlertNumbersLengthOverflow {
    lmax;
    identifier = "alert-length-overflow";
    constructor(lmax) {
        this.lmax = lmax;
    }
    message() { return `At most ${this.lmax} numbers should be given`; }
}
export class AlertNumbersUnderflow {
    min;
    identifier = "alert-underflow";
    constructor(min) {
        this.min = min;
    }
    message() { return `Number(s) should be at least ${this.min}`; }
}
export class AlertNumbersOverflow {
    max;
    identifier = "alert-overflow";
    constructor(max) {
        this.max = max;
    }
    message() { return `Number(s) should be at most ${this.max}`; }
}
export class AlertNumbersStepMismatch {
    step;
    identifier = "alert-step-mismatch";
    constructor(step) {
        this.step = step;
    }
    message() {
        if (this.step === 1) {
            return `Number(s) should be an integer`;
        }
        else {
            return `Number(s) should be multiple(s) of ${this.step}`;
        }
    }
}
export class AlertCustom {
    text;
    identifier = "alert-custom";
    constructor(text) {
        this.text = text;
    }
    message() { return this.text; }
}
