// Importing necessary modules from the 'vscode' library and custom providers/services
import * as vscode from "vscode";
import { CompletionItemProvider } from "./features/completionItemProvider";
import { HoverProvider } from "./features/hoverProvider";
import { SignatureHelpProvider } from "./features/signatureHelpProvider";
import { NativeService } from "./data/nativeService";

// This function is called when the extension is activated
export async function activate(context: vscode.ExtensionContext) {
    // Logging a message to the console indicating that the extension is loading
    console.log("Extension vRP 2 loading");

    // Retrieving a list of native functions from the 'NativeService' class
    const natives = await NativeService.getAllNatives();

    // Registering a hover provider for the "lua" language
    let disposable = vscode.languages.registerHoverProvider("lua", new HoverProvider(natives));
    context.subscriptions.push(disposable);

    // Registering a signature help provider for the "lua" language, specifying trigger characters "(" and ","
    disposable = vscode.languages.registerSignatureHelpProvider("lua", new SignatureHelpProvider(natives), "(", ",");
    context.subscriptions.push(disposable);

    // Registering a completion item provider for the "lua" language
    disposable = vscode.languages.registerCompletionItemProvider("lua", new CompletionItemProvider(natives));
    context.subscriptions.push(disposable);

    // Logging a message to the console indicating that the extension has been activated
    console.log("Extension vRP 2 activated !");
}

// This function is called when the extension is deactivated
export function deactivate() {}
