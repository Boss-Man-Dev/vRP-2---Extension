// Import necessary modules from vscode
import * as vscode from "vscode";
import { NativeFunction } from "../types/nativeFunction";

// Define a class SignatureHelpProvider implementing vscode.SignatureHelpProvider interface
export class SignatureHelpProvider implements vscode.SignatureHelpProvider {
    // Dictionary to store information about native functions
    private natives: { [key: string]: vscode.SignatureInformation } = {};

    // Constructor to initialize the SignatureHelpProvider with native functions
    constructor(natives: NativeFunction[]) {
        // Iterate through the provided native functions and add them to the dictionary
        for (const native of natives) {
            this.addNative(native);			
        }
    }

    // Method to provide signature help based on the current cursor position
    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        // Extract the text before the cursor position
        const textBeforeCursor = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position));
        let currentParameter = 0;
        let nestedOpened = 0;
        let nestedClosed = 0;
        let parametersStart = textBeforeCursor.length;

        // Determine the current parameter index and position of the opening parenthesis
        while (parametersStart > -1) {
            if (textBeforeCursor.charAt(parametersStart) == "," && nestedOpened == nestedClosed) {
                currentParameter++;
            } else if (textBeforeCursor.charAt(parametersStart) == ")") {
                nestedClosed++;
            } else if (textBeforeCursor.charAt(parametersStart) == "(") {
                nestedOpened++;
            }

            if (textBeforeCursor.charAt(parametersStart) == "(" && nestedOpened > nestedClosed) break;

            parametersStart--;
        }

        // Get the method name based on the cursor position
        const methodNameRange = document.getWordRangeAtPosition(
            new vscode.Position(position.line, parametersStart),
            /[\w\._:]+/
        );
        if (!methodNameRange) return;

        const methodName = document.getText(methodNameRange);

        // Retrieve the signature information for the method
        const signature = this.natives[methodName];
        if (!signature) return;

        // Adjust the current parameter index based on variadic parameters
        if (signature.parameters.length > 0 && currentParameter >= signature.parameters.length) {
            const lastParam = signature.parameters[signature.parameters.length - 1].label as string;
            if (lastParam && lastParam.startsWith("...:")) currentParameter = signature.parameters.length - 1;
        }

        // Create a new SignatureHelp object and populate it with the retrieved signature information
        let signatureHelp = new vscode.SignatureHelp();
        signatureHelp.activeParameter = currentParameter;
        signatureHelp.activeSignature = 0;
        signatureHelp.signatures.push(signature);

        return signatureHelp;
    }

    // Private method to add a native function to the dictionary
    private addNative(native: NativeFunction) {
        // Generate a string representation of the parameters
        const params = native.params?.map((p) => `${p.name}: ${p.type}`).join(", ");
				//const method = native.method?.map((m) => `${m.name}: ${m.description}: ${m.params?.map((p) => `${p.name}: ${p.type}`)}`).join(", ");
        
        // Create a SignatureInformation object for the native function
        const signature = new vscode.SignatureInformation(
            `${native.name}(${params})${native.results && `: ${native.results}`}`
        );

        // Add documentation if available
        if (native.description) {
            signature.documentation = new vscode.MarkdownString().appendMarkdown(native.description);
        }

        // Add parameter information if available
        if (native.params) {
            for (const param of native.params) {
                const paramInfos = new vscode.ParameterInformation(
                    `${param.name}: ${param.type}`,
                    new vscode.MarkdownString(param.description)
                );
                signature.parameters.push(paramInfos);
            }
        }

        // Add the signature information to the dictionary with the native function name as the key
        this.natives[native.name] = signature;
    }
}
