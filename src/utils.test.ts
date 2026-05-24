import * as assert from "assert";
import { severityToNumber } from "./utils";

describe("severityToNumber", () => {
	it("maps 'error' to 0 (Error)", () => {
		assert.strictEqual(severityToNumber("error"), 0);
	});

	it("maps 'fatal' to 0 (Error)", () => {
		assert.strictEqual(severityToNumber("fatal"), 0);
	});

	it("maps 'warning' to 1 (Warning)", () => {
		assert.strictEqual(severityToNumber("warning"), 1);
	});

	it("maps 'convention' to 2 (Information)", () => {
		assert.strictEqual(severityToNumber("convention"), 2);
	});

	it("maps 'refactor' to 2 (Information)", () => {
		assert.strictEqual(severityToNumber("refactor"), 2);
	});

	it("maps unknown severity to 1 (Warning) by default", () => {
		assert.strictEqual(severityToNumber("unknown-severity"), 1);
	});
});
