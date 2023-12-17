import { NativeParam } from "./nativeParam";
import { Method } from "./nativeMethod";

export interface NativeFunction {
	name: string;
	description?: string;
	params?: NativeParam[];
	results?: string;
	method?: Method[]
}
