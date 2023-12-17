// Import the necessary modules from the vscode library and custom types
import * as vscode from "vscode";
import { NativeFunction } from "../types/nativeFunction";

// Define a class named HoverProvider that implements the HoverProvider interface provided by vscode
export class HoverProvider implements vscode.HoverProvider {
	// Private property to store information about native functions
	private natives: { [key: string]: vscode.MarkdownString[] } = {};

	// Constructor that initializes the HoverProvider with an array of NativeFunction objects
	constructor(natives: NativeFunction[]) {
		// Iterate through the array of NativeFunction objects and add them to the natives property
		for (const native of natives) {
			this.addNative(native);
		}
	}

	// Implementation of the provideHover method required by the HoverProvider interface
	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.Hover> {
		// Get the word range at the current position in the document
		const hoveredWordRange = document.getWordRangeAtPosition(position, /[\w:._]+/);
		// If no word range is found, return undefined
		if (!hoveredWordRange) return;

		// Extract the text of the word at the current position
		const hoveredWord = document.getText(hoveredWordRange);

		// Retrieve the information about the native function associated with the hovered word
		const native = this.natives[hoveredWord];

		// If information about the native function exists, create a Hover object
		return !!native && new vscode.Hover(native, hoveredWordRange);
	}

	// Private method to add information about a NativeFunction to the natives property
	private addNative(native: NativeFunction) {
		// Create an array to store MarkdownString objects describing the native function
		const markdown = [];

		// Create a string representation of the native function's parameters
		const params = native.params?.map((p) => `${p.name}: ${p.type}`).join(", ");

		// Create a MarkdownString for the header of the native function
		const header = new vscode.MarkdownString().appendCodeblock(
			`${native.name}(${params})${native.results && `: ${native.results}`}`
		);
		markdown.push(header);

		// If the native function has a description, add it to the array
		if (native.description) {
			const description = new vscode.MarkdownString().appendMarkdown(native.description);
			markdown.push(description);
		}

		// Store the array of MarkdownString objects in the natives property under the native function's name
		this.natives[native.name] = markdown;
	}
}
