import * as vscode from "vscode";
import { NativeFunction } from "../types/nativeFunction";

// Define a class named CompletionItemProvider that implements vscode.CompletionItemProvider
export class CompletionItemProvider implements vscode.CompletionItemProvider {
  // Array to store information about native functions and their completion items
  private natives: { name: string; completionItem: vscode.CompletionItem }[] = [];

  // Store the previous search result to optimize filtering
  private previousResult: { name: string; completionItem: vscode.CompletionItem }[] = [];
  
  // Store the previous text to check if the current search is a continuation of the previous one
  private previousText: string = "";

  // Constructor takes an array of NativeFunction and initializes the class with native functions
  constructor(natives: NativeFunction[]) {
    // Iterate over the provided NativeFunction array and add each native to the completion list
    for (const native of natives) {
      this.addNative(native);
    }
  }

  // Implementation of the provideCompletionItems method required by the CompletionItemProvider interface
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    // Get the word range at the current position
    const wordRange = document.getWordRangeAtPosition(new vscode.Position(position.line, position.character - 1));
    
    // If no word range is found, return undefined
    if (!wordRange) return;

    // Extract the text from the word range and convert it to lowercase
    const text = document.getText(wordRange).toLowerCase();

    // Use the previous result if the current text is a continuation of the previous one; otherwise, use all natives
    const natives = text.startsWith(this.previousText) ? this.previousResult : this.natives;

    // Filter natives based on the current text
    const result = natives.filter((n) => n.name.indexOf(text) != -1);

    // Update previous text and result for future optimization
    this.previousText = text;
    this.previousResult = result;

    // Return the completion items for the matched natives
    return result.map((n) => n.completionItem);
  }

  // Private method to add a native function to the completion list
  private addNative(native: NativeFunction) {
    // Create a new completion item for the native function
    const completionItem = new vscode.CompletionItem(native.name, vscode.CompletionItemKind.Function);

    // Create a MarkdownString for documentation
    completionItem.documentation = new vscode.MarkdownString();

    // Generate the function signature and append it to the documentation
    const params = native.params?.map((p) => `${p.name}: ${p.type}`).join(", ");
    completionItem.documentation.appendCodeblock(
      `${native.name}(${params})${native.results && `: ${native.results}`}`
    );

    // Append the description if available
    if (native.description) {
      completionItem.documentation.appendMarkdown(`  \n\n${native.description}`);
    }

    // Add the native function to the list with its lowercase name and completion item
    this.natives.push({ name: native.name.toLowerCase(), completionItem });
  }
}
