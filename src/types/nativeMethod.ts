import { NativeParam } from "./nativeParam";

export interface Method {
	name: string;
	description?: string;
	params?: NativeParam[];
	results?: string;
};
