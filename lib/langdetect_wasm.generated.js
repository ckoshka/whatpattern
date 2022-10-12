// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file
// source-hash: 3508a0df203515c437dc82326dc7a513ff430d32
let wasm;

const cachedTextDecoder = new TextDecoder("utf-8", {
	ignoreBOM: true,
	fatal: true,
});

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
	if (cachedUint8Memory0.byteLength === 0) {
		cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
	}
	return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
	return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder("utf-8");

const encodeString = function (arg, view) {
	return cachedTextEncoder.encodeInto(arg, view);
};

function passStringToWasm0(arg, malloc, realloc) {
	if (realloc === undefined) {
		const buf = cachedTextEncoder.encode(arg);
		const ptr = malloc(buf.length);
		getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
		WASM_VECTOR_LEN = buf.length;
		return ptr;
	}

	let len = arg.length;
	let ptr = malloc(len);

	const mem = getUint8Memory0();

	let offset = 0;

	for (; offset < len; offset++) {
		const code = arg.charCodeAt(offset);
		if (code > 0x7F) break;
		mem[ptr + offset] = code;
	}

	if (offset !== len) {
		if (offset !== 0) {
			arg = arg.slice(offset);
		}
		ptr = realloc(ptr, len, len = offset + arg.length * 3);
		const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
		const ret = encodeString(arg, view);

		offset += ret.written;
	}

	WASM_VECTOR_LEN = offset;
	return ptr;
}

function passArray8ToWasm0(arg, malloc) {
	const ptr = malloc(arg.length * 1);
	getUint8Memory0().set(arg, ptr / 1);
	WASM_VECTOR_LEN = arg.length;
	return ptr;
}

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
	if (cachedInt32Memory0.byteLength === 0) {
		cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
	}
	return cachedInt32Memory0;
}

const DetectorFinalization = new FinalizationRegistry((ptr) =>
	wasm.__wbg_detector_free(ptr)
);
/** */
export class Detector {
	static __wrap(ptr) {
		const obj = Object.create(Detector.prototype);
		obj.ptr = ptr;
		DetectorFinalization.register(obj, obj.ptr, obj);
		return obj;
	}

	__destroy_into_raw() {
		const ptr = this.ptr;
		this.ptr = 0;
		DetectorFinalization.unregister(this);
		return ptr;
	}

	free() {
		const ptr = this.__destroy_into_raw();
		wasm.__wbg_detector_free(ptr);
	}
	/** */
	constructor() {
		const ret = wasm.detector_new();
		return Detector.__wrap(ret);
	}
	/**
	 * @param {string} data
	 * @param {string} name
	 */
	add_str(data, name) {
		const ptr0 = passStringToWasm0(
			data,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		const ptr1 = passStringToWasm0(
			name,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		wasm.detector_add_bytes(this.ptr, ptr0, len0, ptr1, len1);
	}
	/**
	 * @param {Uint8Array} data
	 * @param {string} name
	 */
	add_bytes(data, name) {
		const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
		const len0 = WASM_VECTOR_LEN;
		const ptr1 = passStringToWasm0(
			name,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		wasm.detector_add_bytes(this.ptr, ptr0, len0, ptr1, len1);
	}
	/**
	 * @param {string} text
	 * @returns {string}
	 */
	detect(text) {
		try {
			const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
			const ptr0 = passStringToWasm0(
				text,
				wasm.__wbindgen_malloc,
				wasm.__wbindgen_realloc,
			);
			const len0 = WASM_VECTOR_LEN;
			wasm.detector_detect(retptr, this.ptr, ptr0, len0);
			var r0 = getInt32Memory0()[retptr / 4 + 0];
			var r1 = getInt32Memory0()[retptr / 4 + 1];
			return getStringFromWasm0(r0, r1);
		} finally {
			wasm.__wbindgen_add_to_stack_pointer(16);
			wasm.__wbindgen_free(r0, r1);
		}
	}
}

const imports = {
	__wbindgen_placeholder__: {
		__wbindgen_throw: function (arg0, arg1) {
			throw new Error(getStringFromWasm0(arg0, arg1));
		},
	},
};

/**
 * Decompression callback
 *
 * @callback DecompressCallback
 * @param {Uint8Array} compressed
 * @return {Uint8Array} decompressed
 */

/**
 * Options for instantiating a Wasm instance.
 * @typedef {Object} InstantiateOptions
 * @property {URL=} url - Optional url to the Wasm file to instantiate.
 * @property {DecompressCallback=} decompress - Callback to decompress the
 * raw Wasm file bytes before instantiating.
 */

/** Instantiates an instance of the Wasm module returning its functions.
 * @remarks It is safe to call this multiple times and once successfully
 * loaded it will always return a reference to the same object.
 * @param {InstantiateOptions=} opts
 */
export async function instantiate(opts) {
	return (await instantiateWithInstance(opts)).exports;
}

let instanceWithExports;
let lastLoadPromise;

/** Instantiates an instance of the Wasm module along with its exports.
 * @remarks It is safe to call this multiple times and once successfully
 * loaded it will always return a reference to the same object.
 * @param {InstantiateOptions=} opts
 * @returns {Promise<{
 *   instance: WebAssembly.Instance;
 *   exports: { Detector : typeof Detector  }
 * }>}
 */
export function instantiateWithInstance(opts) {
	if (instanceWithExports != null) {
		return Promise.resolve(instanceWithExports);
	}
	if (lastLoadPromise == null) {
		lastLoadPromise = (async () => {
			try {
				const instance = (await instantiateModule(opts ?? {})).instance;
				wasm = instance.exports;
				cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
				cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
				instanceWithExports = {
					instance,
					exports: getWasmInstanceExports(),
				};
				return instanceWithExports;
			} finally {
				lastLoadPromise = null;
			}
		})();
	}
	return lastLoadPromise;
}

function getWasmInstanceExports() {
	return { Detector };
}

/** Gets if the Wasm module has been instantiated. */
export function isInstantiated() {
	return instanceWithExports != null;
}

/**
 * @param {InstantiateOptions} opts
 */
async function instantiateModule(opts) {
	const wasmUrl = opts.url ??
		new URL("langdetect_wasm_bg.wasm", import.meta.url);
	const decompress = opts.decompress;
	switch (wasmUrl.protocol) {
		case "file:":
		case "https:":
		case "http:": {
			const isFile = wasmUrl.protocol === "file:";
			if (isFile) {
				if (typeof Deno !== "object") {
					throw new Error(
						"file urls are not supported in this environment",
					);
				}
				if ("permissions" in Deno) {
					await Deno.permissions.request({
						name: "read",
						path: wasmUrl,
					});
				}
			} else if (typeof Deno === "object" && "permissions" in Deno) {
				await Deno.permissions.request({
					name: "net",
					host: wasmUrl.host,
				});
			}
			const wasmResponse = await fetch(wasmUrl);
			if (decompress) {
				const wasmCode = new Uint8Array(
					await wasmResponse.arrayBuffer(),
				);
				return WebAssembly.instantiate(decompress(wasmCode), imports);
			}
			if (
				isFile ||
				wasmResponse.headers.get("content-type")?.toLowerCase()
					.startsWith("application/wasm")
			) {
				return WebAssembly.instantiateStreaming(wasmResponse, imports);
			} else {
				return WebAssembly.instantiate(
					await wasmResponse.arrayBuffer(),
					imports,
				);
			}
		}
		default:
			throw new Error(`Unsupported protocol: ${wasmUrl.protocol}`);
	}
}
