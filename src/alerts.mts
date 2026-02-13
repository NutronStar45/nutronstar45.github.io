/** An alert. */
export interface Alert {
    /**
     * The name of:
     * - The attribute containing custom messages
     * - The class of the alert
     */
    identifier: string;

    /**
     * Generates an alert message.
     * @returns The alert message.
     */
    message(): string;
}

export class AlertNumberMissing implements Alert {
    identifier = "alert-missing";
    constructor() {}
    message() { return "A number should be entered"; }
}

export class AlertNumberBadInput implements Alert {
    identifier = "alert-bad-input";
    constructor() {}
    message() { return "A number should be entered"; }
}

export class AlertNumberUnderflow implements Alert {
    identifier = "alert-underflow";
    constructor(public min: number) {}
    message() { return `Number should be at least ${this.min}`; }
}

export class AlertNumberOverflow implements Alert {
    identifier = "alert-overflow";
    constructor(public max: number) {}
    message() { return `Number should be at most ${this.max}`; }
}

export class AlertNumberStepMismatch implements Alert {
    identifier = "alert-step-mismatch";
    constructor(public step: number) {}
    message() {
        if (this.step === 1) {
            return `Number should be an integer`;
        } else {
            return `Number should be a multiple of ${this.step}`;
        }
    }
}

export class AlertNumbersMissing implements Alert {
    identifier = "alert-missing";
    constructor() {}
    message() { return "Number(s) should be entered"; }
}

export class AlertNumbersBadInput implements Alert {
    identifier = "alert-bad-input";
    constructor() {}
    message() { return "Number(s) should be entered"; }
}

export class AlertNumbersLengthUnderflow implements Alert {
    identifier = "alert-length-underflow";
    constructor(public lmin: number) {}
    message() { return `At least ${this.lmin} numbers should be given`; }
}

export class AlertNumbersLengthOverflow implements Alert {
    identifier = "alert-length-overflow";
    constructor(public lmax: number) {}
    message() { return `At most ${this.lmax} numbers should be given`; }
}

export class AlertNumbersUnderflow implements Alert {
    identifier = "alert-underflow";
    constructor(public min: number) {}
    message() { return `Number(s) should be at least ${this.min}`; }
}

export class AlertNumbersOverflow implements Alert {
    identifier = "alert-overflow";
    constructor(public max: number) {}
    message() { return `Number(s) should be at most ${this.max}`; }
}

export class AlertNumbersStepMismatch implements Alert {
    identifier = "alert-step-mismatch";
    constructor(public step: number) {}
    message() {
        if (this.step === 1) {
            return `Number(s) should be an integer`;
        } else {
            return `Number(s) should be multiple(s) of ${this.step}`;
        }
    }
}

export class AlertCustom implements Alert {
    identifier = "alert-custom";
    constructor(public text: string) {}
    message() { return this.text; }
}
