// Importing necessary modules and types
import fetch from "node-fetch";
import { DocumentationResponse } from "../types/documentationResponse";
import { NativeFunction } from "../types/nativeFunction";
import { NativeParam } from "../types/nativeParam";
import { specificFunctions } from "./specificFunctions";

// URLs of documentation for native functions
const documentationUrls = [
	//"https://runtime.fivem.net/doc/natives.json",
	//"https://runtime.fivem.net/doc/natives_cfx.json",
	"https://gist.githubusercontent.com/Boss-Man-Dev/fa56586a5fbbc47dd5ac3256c1498e30/raw/033dfdf5e61eb176910e337224031f16df3405f0/vRP-2-natives.json"
];

// Class for handling native functions
export class NativeService {
	// Method to retrieve all native functions
	static async getAllNatives(): Promise<NativeFunction[]> {
		// Combine specific functions and functions from various vRP modules
		const allNatives: NativeFunction[] = [
			...specificFunctions
		];

		// Fetch native functions from external documentation URLs
		const nativeArrays = await Promise.all(documentationUrls.map((url) => this.fetchNatives(url)));
		for (const natives of nativeArrays) {
			allNatives.push(...natives);
		}

		return allNatives;
	}

	// Method to fetch native functions from a given URL
	private static async fetchNatives(url: string): Promise<NativeFunction[]> {
		// Fetch documentation response from the provided URL
		const response = await fetch(url);
		const responseData = (await response.json()) as DocumentationResponse;

		// Array to store parsed native functions
		const natives: NativeFunction[] = [];

		// Iterate through sections and natives in the documentation response
		for (const section of Object.values(responseData)) {
			for (const native of Object.values(section)) {
				// Parse and add each native function to the array
				if (native.name) {
					native.name = this.parseNativeName(native.name);
					native.description = native.description && this.parseNativeDescription(native.description);
					native.params = this.parseNativeParams(native.params);
					native.results = native.results && this.parseType(native.results);
					natives.push(native);
				}
			}
		}

		return natives;
	}

	// Method to parse the name of a native function
	private static parseNativeName(rawName: string) {
		return rawName
			.split("-")
			.filter((n) => n.length > 0)
			.map((n) => n.substr(0, 1) + n.substr(1))
			.join(".");
	}

	// Method to parse the description of a native function
	private static parseNativeDescription(rawDescription: string) {
		const from = rawDescription.startsWith("```") ? 3 : 0;
		const to = rawDescription.endsWith("```") ? rawDescription.length - 3 : rawDescription.length;
		return rawDescription.substr(from, to - from);
	}

	// Method to parse the parameters of a native function
	private static parseNativeParams(params: NativeParam[] | undefined): NativeParam[] {
    return (params || []).map((p) => ({ ...p, type: this.parseType(p.type) }));
}

	// Method to parse the return type of a native function
	private static parseType(rawType: string) {
		const type = rawType.replace("*", "");

		switch (type) {
			case "int":
			case "float":
			case "long":
				return "number";
			case "BOOL":
				return "boolean";
			case "char":
				return "string";
			case "Vector3":
				return "vector3";
			case "Any":
				return "any";
			case "void":
				return "";
			default:
				return type;
		}
	}
}
