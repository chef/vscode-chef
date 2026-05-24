/**
 * Maps a Rubocop severity string to a VS Code DiagnosticSeverity number.
 * DiagnosticSeverity: Error=0, Warning=1, Information=2, Hint=3
 */
export function severityToNumber(severity: string): number {
	switch (severity) {
		case "fatal":
		case "error":
			return 0; // Error
		case "warning":
			return 1; // Warning
		case "convention":
		case "refactor":
			return 2; // Information
		default:
			return 1; // Warning
	}
}
