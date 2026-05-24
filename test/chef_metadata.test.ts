/**
 * Headless Mocha tests for snippets/chef_metadata.json.
 *
 * These tests run in plain Node — no VS Code instance required.
 * They verify structural integrity of the snippet file: every entry must have
 * a non-empty prefix, body, and description, and key sentinel snippets must
 * contain the expected values (prefix match, tab-stop placeholders).
 *
 * Run with: npm test  (or: mocha 'out/test/**\/*.test.js')
 */
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";

/** Resolved path to the snippets/ directory at the repo root. */
const SNIPPETS_DIR = path.resolve(__dirname, "../../snippets");

/** Shape of a single VS Code snippet entry. */
type Snippet = {
  prefix: string | string[];
  body: string | string[];
  description?: string;
  scope?: string;
};

/** The full contents of a snippets JSON file — keys are snippet names. */
type SnippetFile = Record<string, Snippet>;

/**
 * Reads and parses a snippet file from the snippets/ directory.
 * Throws if the file is missing or contains invalid JSON.
 */
function loadSnippet(filename: string): SnippetFile {
  const fullPath = path.join(SNIPPETS_DIR, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw) as SnippetFile;
}

describe("snippets/chef_metadata.json", () => {
  let snippets: SnippetFile;

  before(() => {
    snippets = loadSnippet("chef_metadata.json");
  });

  it("parses as valid JSON and is non-empty", () => {
    assert.ok(typeof snippets === "object", "should be an object");
    assert.ok(Object.keys(snippets).length > 0, "should have at least one snippet");
  });

  it("every snippet has a non-empty prefix", () => {
    for (const [name, snippet] of Object.entries(snippets)) {
      const prefix = snippet.prefix;
      assert.ok(
        (typeof prefix === "string" && prefix.trim().length > 0) ||
          (Array.isArray(prefix) && prefix.length > 0),
        `snippet "${name}" must have a non-empty prefix`
      );
    }
  });

  it("every snippet has a non-empty body", () => {
    for (const [name, snippet] of Object.entries(snippets)) {
      const body = snippet.body;
      assert.ok(
        (typeof body === "string" && body.trim().length > 0) ||
          (Array.isArray(body) && body.length > 0),
        `snippet "${name}" must have a non-empty body`
      );
    }
  });

  it("every snippet has a description", () => {
    for (const [name, snippet] of Object.entries(snippets)) {
      assert.ok(
        typeof snippet.description === "string" && snippet.description.trim().length > 0,
        `snippet "${name}" must have a non-empty description`
      );
    }
  });

  it("the 'depends' snippet prefix matches its key name", () => {
    const snippet = snippets["depends"];
    assert.ok(snippet, "snippet 'depends' should exist");
    assert.strictEqual(snippet.prefix, "depends");
  });

  it("the 'chef_version' snippet body contains a tab-stop placeholder", () => {
    const snippet = snippets["chef_version"];
    assert.ok(snippet, "snippet 'chef_version' should exist");
    const body = Array.isArray(snippet.body) ? snippet.body.join("\n") : snippet.body;
    assert.match(body, /\$\{?\d/, "body should contain a VS Code tab-stop (${N} or $N)");
  });
});

