// @contentauth/c2pa-web 0.17.2 (MIT), dist/builder-DNQAnPmj.js. Its dependencies are rewired from "highgain" to
// ./highgain.js (highgain 0.1.0, ISC) and from "@contentauth/c2pa-utilities" to ./c2pa-utilities/index.js.
var T = (r) => {
  throw TypeError(r);
};
var k = (r, e, t) => e.has(r) || T("Cannot " + t);
var n = (r, e, t) => (k(r, e, "read from private field"), t ? t.call(r) : e.get(r)), A = (r, e, t) => e.has(r) ? T("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), v = (r, e, t, o) => (k(r, e, "write to private field"), o ? o.call(r, t) : e.set(r, t), t);
import { channel as G, transfer as C } from "./highgain.js";
import { Context as x, validateAssetSize as M, resolveConfiguredMaxSizeInBytes as W } from "./c2pa-utilities/index.js";
const Y = 16, O = "context-missing", { createTx: Z, rx: ce } = G(), { createTx: ue, rx: K } = G("worker"), V = '(function(){"use strict";class p{static __wrap(e){const t=Object.create(p.prototype);return t.__wbg_ptr=e,J.register(t,t.__wbg_ptr,t),t}__destroy_into_raw(){const e=this.__wbg_ptr;return this.__wbg_ptr=0,J.unregister(this),e}free(){const e=this.__destroy_into_raw();_.__wbg_wasmbuilder_free(e,0)}addAction(e){const t=_.wasmbuilder_addAction(this.__wbg_ptr,e);if(t[1])throw d(t[0])}addAssertion(e,t){const n=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a,i=_.wasmbuilder_addAssertion(this.__wbg_ptr,n,o,t);if(i[1])throw d(i[0])}addIngredientFromBlob(e,t,n){const o=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),i=a,c=u(t,_.__wbindgen_malloc,_.__wbindgen_realloc),s=a;return _.wasmbuilder_addIngredientFromBlob(this.__wbg_ptr,o,i,c,s,n)}addIngredient(e){const t=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),n=a,o=_.wasmbuilder_addIngredient(this.__wbg_ptr,t,n);if(o[1])throw d(o[0])}addRedaction(e,t){const n=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a,i=_.wasmbuilder_addRedaction(this.__wbg_ptr,n,o,t);if(i[1])throw d(i[0])}addResourceFromBlob(e,t){const n=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a,i=_.wasmbuilder_addResourceFromBlob(this.__wbg_ptr,n,o,t);if(i[1])throw d(i[0])}filterActionsAndIngredientsAt(e,t){const n=W(e,_.__wbindgen_malloc),o=a,i=W(t,_.__wbindgen_malloc),c=a,s=_.wasmbuilder_filterActionsAndIngredientsAt(this.__wbg_ptr,n,o,i,c);if(s[1])throw d(s[0])}filterActionsAt(e){const t=W(e,_.__wbindgen_malloc),n=a,o=_.wasmbuilder_filterActionsAt(this.__wbg_ptr,t,n);if(o[1])throw d(o[0])}filterIngredientsAt(e){const t=W(e,_.__wbindgen_malloc),n=a,o=_.wasmbuilder_filterIngredientsAt(this.__wbg_ptr,t,n);if(o[1])throw d(o[0])}static fromArchiveWithContext(e,t){T(t,v);const n=_.wasmbuilder_fromArchiveWithContext(e,t.__wbg_ptr);if(n[2])throw d(n[1]);return p.__wrap(n[0])}static fromArchive(e,t){var n=w(t)?0:u(t,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a;const i=_.wasmbuilder_fromArchive(e,n,o);if(i[2])throw d(i[1]);return p.__wrap(i[0])}static fromJsonWithContext(e,t){const n=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a;T(t,v);const i=_.wasmbuilder_fromJsonWithContext(n,o,t.__wbg_ptr);if(i[2])throw d(i[1]);return p.__wrap(i[0])}static fromJson(e,t){const n=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a;var i=w(t)?0:u(t,_.__wbindgen_malloc,_.__wbindgen_realloc),c=a;const s=_.wasmbuilder_fromJson(n,o,i,c);if(s[2])throw d(s[1]);return p.__wrap(s[0])}getDefinition(){const e=_.wasmbuilder_getDefinition(this.__wbg_ptr);if(e[2])throw d(e[1]);return d(e[0])}static newWithContext(e){T(e,v);const t=_.wasmbuilder_newWithContext(e.__wbg_ptr);if(t[2])throw d(t[1]);return p.__wrap(t[0])}static new(e){var t=w(e)?0:u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),n=a;const o=_.wasmbuilder_new(t,n);if(o[2])throw d(o[1]);return p.__wrap(o[0])}setIntent(e){const t=_.wasmbuilder_setIntent(this.__wbg_ptr,e);if(t[1])throw d(t[0])}setNoEmbed(e){_.wasmbuilder_setNoEmbed(this.__wbg_ptr,e)}setRemoteUrl(e){const t=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),n=a;_.wasmbuilder_setRemoteUrl(this.__wbg_ptr,t,n)}setThumbnailFromBlob(e,t){const n=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a,i=_.wasmbuilder_setThumbnailFromBlob(this.__wbg_ptr,n,o,t);if(i[1])throw d(i[0])}signAndGetManifestBytes(e,t,n,o){const i=u(n,_.__wbindgen_malloc,_.__wbindgen_realloc),c=a;return _.wasmbuilder_signAndGetManifestBytes(this.__wbg_ptr,e,t,i,c,o)}sign(e,t,n,o){const i=u(n,_.__wbindgen_malloc,_.__wbindgen_realloc),c=a;return _.wasmbuilder_sign(this.__wbg_ptr,e,t,i,c,o)}toArchive(){const e=_.wasmbuilder_toArchive(this.__wbg_ptr);if(e[2])throw d(e[1]);return d(e[0])}updateActionsAt(e){const t=_.wasmbuilder_updateActionsAt(this.__wbg_ptr,e);if(t[1])throw d(t[0])}updateAssertionsAt(e,t){const n=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a,i=_.wasmbuilder_updateAssertionsAt(this.__wbg_ptr,n,o,t);if(i[1])throw d(i[0])}updateManifestProperty(e,t){const n=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),o=a,i=_.wasmbuilder_updateManifestProperty(this.__wbg_ptr,n,o,t);if(i[1])throw d(i[0])}}Symbol.dispose&&(p.prototype[Symbol.dispose]=p.prototype.free);class v{__destroy_into_raw(){const e=this.__wbg_ptr;return this.__wbg_ptr=0,D.unregister(this),e}free(){const e=this.__destroy_into_raw();_.__wbg_wasmcontext_free(e,0)}constructor(e){var t=w(e)?0:u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),n=a;const o=_.wasmcontext_new(t,n);if(o[2])throw d(o[1]);return this.__wbg_ptr=o[0],D.register(this,this.__wbg_ptr,this),this}}Symbol.dispose&&(v.prototype[Symbol.dispose]=v.prototype.free);class S{static __wrap(e){const t=Object.create(S.prototype);return t.__wbg_ptr=e,L.register(t,t.__wbg_ptr,t),t}__destroy_into_raw(){const e=this.__wbg_ptr;return this.__wbg_ptr=0,L.unregister(this),e}free(){const e=this.__destroy_into_raw();_.__wbg_wasmreader_free(e,0)}activeLabel(){const e=_.wasmreader_activeLabel(this.__wbg_ptr);let t;return e[0]!==0&&(t=y(e[0],e[1]),_.__wbindgen_free(e[0],e[1]*1,1)),t}activeManifest(){const e=_.wasmreader_activeManifest(this.__wbg_ptr);if(e[2])throw d(e[1]);return d(e[0])}crJson(){let e,t;try{const n=_.wasmreader_crJson(this.__wbg_ptr);return e=n[0],t=n[1],y(n[0],n[1])}finally{_.__wbindgen_free(e,t,1)}}static fromBlobFragmentWithContext(e,t,n,o){const i=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),c=a;return T(o,v),_.wasmreader_fromBlobFragmentWithContext(i,c,t,n,o.__wbg_ptr)}static fromBlobFragment(e,t,n,o){const i=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),c=a;var s=w(o)?0:u(o,_.__wbindgen_malloc,_.__wbindgen_realloc),f=a;return _.wasmreader_fromBlobFragment(i,c,t,n,s,f)}static fromBlobWithContext(e,t,n){const o=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),i=a;return T(n,v),_.wasmreader_fromBlobWithContext(o,i,t,n.__wbg_ptr)}static fromBlob(e,t,n){const o=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),i=a;var c=w(n)?0:u(n,_.__wbindgen_malloc,_.__wbindgen_realloc),s=a;return _.wasmreader_fromBlob(o,i,t,c,s)}static fromBytes(e,t,n){const o=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),i=a,c=oe(t,_.__wbindgen_malloc),s=a;var f=w(n)?0:u(n,_.__wbindgen_malloc,_.__wbindgen_realloc),g=a;return _.wasmreader_fromBytes(o,i,c,s,f,g)}json(){let e,t;try{const n=_.wasmreader_json(this.__wbg_ptr);return e=n[0],t=n[1],y(n[0],n[1])}finally{_.__wbindgen_free(e,t,1)}}manifestStore(){const e=_.wasmreader_manifestStore(this.__wbg_ptr);if(e[2])throw d(e[1]);return d(e[0])}resourceToBytes(e){const t=u(e,_.__wbindgen_malloc,_.__wbindgen_realloc),n=a,o=_.wasmreader_resourceToBytes(this.__wbg_ptr,t,n);if(o[2])throw d(o[1]);return d(o[0])}}Symbol.dispose&&(S.prototype[Symbol.dispose]=S.prototype.free);function Y(r){const e=_.encodeSignerPayload(r);if(e[3])throw d(e[2]);var t=A(e[0],e[1]).slice();return _.__wbindgen_free(e[0],e[1]*1,1),t}function K(){return{__proto__:null,"./c2pa_bg.js":{__proto__:null,__wbg_Error_30c8987f7c2ed4e2:function(e,t){return Error(y(e,t))},__wbg_Number_14af1003b8dd5ead:function(e){return Number(e)},__wbg_String_8564e559799eccda:function(e,t){const n=String(t),o=u(n,_.__wbindgen_malloc,_.__wbindgen_realloc),i=a;m().setInt32(e+4,i,!0),m().setInt32(e+0,o,!0)},__wbg___wbindgen_bigint_get_as_i64_a2383202b9353e4c:function(e,t){const n=t,o=typeof n=="bigint"?n:void 0;m().setBigInt64(e+8,w(o)?BigInt(0):o,!0),m().setInt32(e+0,!w(o),!0)},__wbg___wbindgen_boolean_get_5b446f51afd21013:function(e){const t=e,n=typeof t=="boolean"?t:void 0;return w(n)?16777215:n?1:0},__wbg___wbindgen_debug_string_4687d8d8c2017d52:function(e,t){const n=N(t),o=u(n,_.__wbindgen_malloc,_.__wbindgen_realloc),i=a;m().setInt32(e+4,i,!0),m().setInt32(e+0,o,!0)},__wbg___wbindgen_in_92f62ee1427d9e49:function(e,t){return e in t},__wbg___wbindgen_is_bigint_b123553bed3bb382:function(e){return typeof e=="bigint"},__wbg___wbindgen_is_function_1f9d30630b8b1d3d:function(e){return typeof e=="function"},__wbg___wbindgen_is_null_e343b7d08827ba72:function(e){return e===null},__wbg___wbindgen_is_object_3c45d4f2dde4e749:function(e){const t=e;return typeof t=="object"&&t!==null},__wbg___wbindgen_is_string_90b56bc79aad6f6c:function(e){return typeof e=="string"},__wbg___wbindgen_is_undefined_8865fb403f8fe9d8:function(e){return e===void 0},__wbg___wbindgen_jsval_eq_02babf21faa37971:function(e,t){return e===t},__wbg___wbindgen_jsval_loose_eq_677f21e468d6b461:function(e,t){return e==t},__wbg___wbindgen_number_get_2e0e7dee9f701a71:function(e,t){const n=t,o=typeof n=="number"?n:void 0;m().setFloat64(e+8,w(o)?0:o,!0),m().setInt32(e+0,!w(o),!0)},__wbg___wbindgen_string_get_0380ccaa2f57f0d9:function(e,t){const n=t,o=typeof n=="string"?n:void 0;var i=w(o)?0:u(o,_.__wbindgen_malloc,_.__wbindgen_realloc),c=a;m().setInt32(e+4,c,!0),m().setInt32(e+0,i,!0)},__wbg___wbindgen_throw_41e9ee4f547fc59a:function(e,t){throw new Error(y(e,t))},__wbg__wbg_cb_unref_dcc1a90847f04c41:function(e){e._wbg_cb_unref()},__wbg_abort_334e7f918b7c5047:function(e,t){e.abort(t)},__wbg_abort_f78b99d80248bacb:function(e){e.abort()},__wbg_append_1938ed58fb5613b8:function(){return l(function(e,t,n,o,i){e.append(y(t,n),y(o,i))},arguments)},__wbg_arrayBuffer_f07be74819944ea2:function(){return l(function(e){return e.arrayBuffer()},arguments)},__wbg_byteLength_9f985b8373f1f3fe:function(e){return e.byteLength},__wbg_call_187d372bd5fdd4aa:function(){return l(function(e,t,n){return e.call(t,n)},arguments)},__wbg_call_6137034ef55c9d0f:function(){return l(function(e,t){return e.call(t)},arguments)},__wbg_clearTimeout_6b8d9a38b9263d65:function(e){return clearTimeout(e)},__wbg_crypto_38df2bab126b63dc:function(e){return e.crypto},__wbg_done_b41a1d26cdb37fb6:function(e){return e.done},__wbg_entries_fb6397112b1de25f:function(e){return Object.entries(e)},__wbg_error_757e9472f8410341:function(e,t){let n,o;try{n=e,o=t,console.error(y(e,t))}finally{_.__wbindgen_free(n,o,1)}},__wbg_fetch_9dad4fe911207b37:function(e){return fetch(e)},__wbg_fetch_efc64baf325b084d:function(e,t){return e.fetch(t)},__wbg_from_296ca31f8d0f1c52:function(e){return Array.from(e)},__wbg_getRandomValues_436a51d0629d84e1:function(){return l(function(e,t){globalThis.crypto.getRandomValues(A(e,t))},arguments)},__wbg_getRandomValues_a608c4436c19407a:function(){return l(function(e,t){globalThis.crypto.getRandomValues(A(e,t))},arguments)},__wbg_getRandomValues_a678b7300e8ed57f:function(){return l(function(e,t){globalThis.crypto.getRandomValues(A(e,t))},arguments)},__wbg_getRandomValues_c44a50d8cfdaebeb:function(){return l(function(e,t){e.getRandomValues(t)},arguments)},__wbg_getTime_f5a55efff2585d5d:function(e){return e.getTime()},__wbg_get_31af05bd4842a84f:function(){return l(function(e,t){return Reflect.get(e,t)},arguments)},__wbg_get_658f6698067d9515:function(){return l(function(e,t){return Reflect.get(e,t)},arguments)},__wbg_get_6c896e0571ddae51:function(e,t){return e[t>>>0]},__wbg_get_unchecked_288889d017702237:function(e,t){return e[t>>>0]},__wbg_get_with_ref_key_6412cf3094599694:function(e,t){return e[t]},__wbg_has_5d6706e5209576c1:function(){return l(function(e,t){return Reflect.has(e,t)},arguments)},__wbg_headers_eba93595f8944c2f:function(e){return e.headers},__wbg_instanceof_ArrayBuffer_a99f175873e5d9b8:function(e){let t;try{t=e instanceof ArrayBuffer}catch{t=!1}return t},__wbg_instanceof_Map_b2611749102d7ba3:function(e){let t;try{t=e instanceof Map}catch{t=!1}return t},__wbg_instanceof_Promise_e1dc6893aa1ece28:function(e){let t;try{t=e instanceof Promise}catch{t=!1}return t},__wbg_instanceof_Response_b8758567269c30b2:function(e){let t;try{t=e instanceof Response}catch{t=!1}return t},__wbg_instanceof_Uint8Array_828cef2aaacafc31:function(e){let t;try{t=e instanceof Uint8Array}catch{t=!1}return t},__wbg_isArray_e15a2ff68ffdbef2:function(e){return Array.isArray(e)},__wbg_isSafeInteger_717808ad6a54bd9e:function(e){return Number.isSafeInteger(e)},__wbg_iterator_e3c31c892080e444:function(){return Symbol.iterator},__wbg_length_7f3c00c40364105e:function(e){return e.length},__wbg_length_d4bdea10311bd9cf:function(e){return e.length},__wbg_msCrypto_bd5a034af96bcba6:function(e){return e.msCrypto},__wbg_new_0_72d020f0c63443d4:function(){return new Date},__wbg_new_1dbf7428bba60a42:function(e){return new Uint8Array(e)},__wbg_new_227d7c05414eb861:function(){return new Error},__wbg_new_28744009d011f847:function(){return new Map},__wbg_new_2e41357094e99294:function(){return l(function(){return new AbortController},arguments)},__wbg_new_617a8cdb8bb1130e:function(){return new Object},__wbg_new_83ca405eae412a62:function(){return l(function(){return new Headers},arguments)},__wbg_new_9ffe4dece67ce9fc:function(){return l(function(){return new FileReaderSync},arguments)},__wbg_new_ee2291f50781bf1d:function(){return new Array},__wbg_new_from_slice_9a868026ffa4208a:function(e,t){return new Uint8Array(A(e,t))},__wbg_new_typed_b01cb72a8af741a3:function(e,t){try{var n={a:e,b:t},o=(c,s)=>{const f=n.a;n.a=0;try{return ee(f,n.b,c,s)}finally{n.a=f}};return new Promise(o)}finally{n.a=0}},__wbg_new_with_length_3da0ad195f6f63ba:function(e){return new Uint8Array(e>>>0)},__wbg_new_with_str_and_init_4618dee4e950224f:function(){return l(function(e,t,n){return new Request(y(e,t),n)},arguments)},__wbg_next_33784799010f1bbe:function(e){return e.next},__wbg_next_f4aac29c42af995c:function(){return l(function(e){return e.next()},arguments)},__wbg_node_84ea875411254db1:function(e){return e.node},__wbg_now_aa4ccb83129e9e55:function(){return Date.now()},__wbg_now_e7c6795a7f81e10f:function(e){return e.now()},__wbg_performance_3fcf6e32a7e1ed0a:function(e){return e.performance},__wbg_process_44c7a14e11e9f69e:function(e){return e.process},__wbg_prototypesetcall_bc27214492979395:function(e,t,n){Uint8Array.prototype.set.call(A(e,t),n)},__wbg_queueMicrotask_9833f9a49df95a49:function(e){return e.queueMicrotask},__wbg_queueMicrotask_a72f977e97f23c5f:function(e){queueMicrotask(e)},__wbg_randomFillSync_6c25eac9869eb53c:function(){return l(function(e,t){e.randomFillSync(t)},arguments)},__wbg_readAsArrayBuffer_14bc98cc9cdf7c0b:function(){return l(function(e,t){return e.readAsArrayBuffer(t)},arguments)},__wbg_require_b4edbdcf3e2a1ef0:function(){return l(function(){return module.require},arguments)},__wbg_resolve_0076e10020304ede:function(e){return Promise.resolve(e)},__wbg_setTimeout_f757f00851f76c42:function(e,t){return setTimeout(e,t)},__wbg_set_575d3ddb70fe831d:function(e,t,n){e.set(A(t,n))},__wbg_set_6ae97e73113c4f0b:function(e,t,n){return e.set(t,n)},__wbg_set_6be42768c690e380:function(e,t,n){e[t]=n},__wbg_set_bea140a88be9b277:function(e,t,n){e[t>>>0]=n},__wbg_set_body_1fb0f1008bfc7df6:function(e,t){e.body=t},__wbg_set_cache_7507c4cc5938ccc7:function(e,t){e.cache=te[t]},__wbg_set_credentials_e0dcce31ca532b7d:function(e,t){e.credentials=ne[t]},__wbg_set_headers_40ad33dcf016613f:function(e,t){e.headers=t},__wbg_set_method_dcb32343247ec427:function(e,t,n){e.method=y(t,n)},__wbg_set_mode_74e772635acb96ec:function(e,t){e.mode=re[t]},__wbg_set_signal_2dbd377604627f26:function(e,t){e.signal=t},__wbg_signal_e5a49a2d9c65b7f6:function(e){return e.signal},__wbg_size_8f1c0b1a1fbb3810:function(e){return e.size},__wbg_slice_afd8274aed4149c0:function(){return l(function(e,t,n){return e.slice(t,n)},arguments)},__wbg_stack_3b0d974bbf31e44f:function(e,t){const n=t.stack,o=u(n,_.__wbindgen_malloc,_.__wbindgen_realloc),i=a;m().setInt32(e+4,i,!0),m().setInt32(e+0,o,!0)},__wbg_static_accessor_GLOBAL_266715b9d96ba635:function(){const e=typeof global>"u"?null:global;return w(e)?0:B(e)},__wbg_static_accessor_GLOBAL_THIS_10fb7dc1ae063179:function(){const e=typeof globalThis>"u"?null:globalThis;return w(e)?0:B(e)},__wbg_static_accessor_SELF_0b583911f537483a:function(){const e=typeof self>"u"?null:self;return w(e)?0:B(e)},__wbg_static_accessor_WINDOW_d7f903d1508cbdc4:function(){const e=typeof window>"u"?null:window;return w(e)?0:B(e)},__wbg_status_ce0a98d3c57125f3:function(e){return e.status},__wbg_stringify_52ff602c1cc4fbb6:function(){return l(function(e){return JSON.stringify(e)},arguments)},__wbg_subarray_002b94d5e13d1411:function(e,t,n){return e.subarray(t>>>0,n>>>0)},__wbg_then_c949d5a25a4e78f8:function(e,t,n){return e.then(t,n)},__wbg_then_e71170d78fcf8954:function(e,t){return e.then(t)},__wbg_url_8e28edeab4cd6bed:function(e,t){const n=t.url,o=u(n,_.__wbindgen_malloc,_.__wbindgen_realloc),i=a;m().setInt32(e+4,i,!0),m().setInt32(e+0,o,!0)},__wbg_valueOf_6abcff09c8156bb6:function(e){return e.valueOf()},__wbg_value_f3c585ee8f5ba40c:function(e){return e.value},__wbg_versions_276b2795b1c6a219:function(e){return e.versions},__wbg_wasmreader_new:function(e){return S.__wrap(e)},__wbindgen_generic_0000000000000001:function(e,t){return P(e,t,Z)},__wbindgen_generic_0000000000000002:function(e,t){return P(e,t,Q)},__wbindgen_generic_0000000000000003:function(e){return e},__wbindgen_generic_0000000000000004:function(e){return e},__wbindgen_generic_0000000000000005:function(e,t){return A(e,t)},__wbindgen_generic_0000000000000006:function(e,t){return y(e,t)},__wbindgen_generic_0000000000000007:function(e){return BigInt.asUintN(64,e)},__wbindgen_generic_0000000000000008:function(e,t){var n=A(e,t).slice();return _.__wbindgen_free(e,t*1,1),n},__wbindgen_init_externref_table:function(){const e=_.__wbindgen_externrefs,t=e.grow(4);e.set(0,void 0),e.set(t+0,void 0),e.set(t+1,null),e.set(t+2,!0),e.set(t+3,!1)}}}}function Q(r,e){_.wasm_bindgen_cb414c02e4f83cd6___convert__closures_____invoke_______true_(r,e)}function Z(r,e,t){const n=_.wasm_bindgen_cb414c02e4f83cd6___convert__closures_____invoke___wasm_bindgen_cb414c02e4f83cd6___JsValue__core_d941ad8722425d2e___result__Result_____wasm_bindgen_cb414c02e4f83cd6___JsError___true_(r,e,t);if(n[1])throw d(n[0])}function ee(r,e,t,n){_.wasm_bindgen_cb414c02e4f83cd6___convert__closures_____invoke___js_sys_1746cd361478c686___Function_fn_wasm_bindgen_cb414c02e4f83cd6___JsValue_____wasm_bindgen_cb414c02e4f83cd6___sys__Undefined___js_sys_1746cd361478c686___Function_fn_wasm_bindgen_cb414c02e4f83cd6___JsValue_____wasm_bindgen_cb414c02e4f83cd6___sys__Undefined_______true_(r,e,t,n)}const te=["default","no-store","reload","no-cache","force-cache","only-if-cached"],ne=["omit","same-origin","include"],re=["same-origin","no-cors","cors","navigate"],J=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(r=>_.__wbg_wasmbuilder_free(r,1)),D=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(r=>_.__wbg_wasmcontext_free(r,1)),L=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(r=>_.__wbg_wasmreader_free(r,1));typeof FinalizationRegistry>"u"||new FinalizationRegistry(r=>_.__wbg_wasmsigner_free(r,1));function B(r){const e=_.__externref_table_alloc();return _.__wbindgen_externrefs.set(e,r),e}function T(r,e){if(!(r instanceof e))throw new Error(`expected instance of ${e.name}`)}const V=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(r=>_.__wbindgen_destroy_closure(r.a,r.b));function N(r){const e=typeof r;if(e=="number"||e=="boolean"||r==null)return`${r}`;if(e=="string")return`"${r}"`;if(e=="symbol"){const o=r.description;return o==null?"Symbol":`Symbol(${o})`}if(e=="function"){const o=r.name;return typeof o=="string"&&o.length>0?`Function(${o})`:"Function"}if(Array.isArray(r)){const o=r.length;let i="[";o>0&&(i+=N(r[0]));for(let c=1;c<o;c++)i+=", "+N(r[c]);return i+="]",i}const t=/\\[object ([^\\]]+)\\]/.exec(toString.call(r));let n;if(t&&t.length>1)n=t[1];else return toString.call(r);if(n=="Object")try{return"Object("+JSON.stringify(r)+")"}catch{return"Object"}return r instanceof Error?`${r.name}: ${r.message}\n${r.stack}`:n}function A(r,e){return r=r>>>0,R().subarray(r/1,r/1+e)}let I=null;function m(){return(I===null||I.buffer.detached===!0||I.buffer.detached===void 0&&I.buffer!==_.memory.buffer)&&(I=new DataView(_.memory.buffer)),I}function y(r,e){return ce(r>>>0,e)}let x=null;function _e(){return(x===null||x.byteLength===0)&&(x=new Uint32Array(_.memory.buffer)),x}let j=null;function R(){return(j===null||j.byteLength===0)&&(j=new Uint8Array(_.memory.buffer)),j}function l(r,e){try{return r.apply(this,e)}catch(t){const n=B(t);_.__wbindgen_exn_store(n)}}function w(r){return r==null}function P(r,e,t){const n={a:r,b:e,cnt:1},o=(...i)=>{n.cnt++;const c=n.a;n.a=0;try{return t(c,n.b,...i)}finally{n.a=c,o._wbg_cb_unref()}};return o._wbg_cb_unref=()=>{--n.cnt===0&&(_.__wbindgen_destroy_closure(n.a,n.b),n.a=0,V.unregister(n))},V.register(o,n,n),o}function W(r,e){const t=e(r.length*4,4)>>>0;return _e().set(r,t/4),a=r.length,t}function oe(r,e){const t=e(r.length*1,1)>>>0;return R().set(r,t/1),a=r.length,t}function u(r,e,t){if(t===void 0){const s=E.encode(r),f=e(s.length,1)>>>0;return R().subarray(f,f+s.length).set(s),a=s.length,f}let n=r.length,o=e(n,1)>>>0;const i=R();let c=0;for(;c<n;c++){const s=r.charCodeAt(c);if(s>127)break;i[o+c]=s}if(c!==n){c!==0&&(r=r.slice(c)),o=t(o,n,n=c+r.length*3,1)>>>0;const s=R().subarray(o+c,o+n),f=E.encodeInto(r,s);c+=f.written,o=t(o,n,c,1)>>>0}return a=c,o}function d(r){const e=_.__wbindgen_externrefs.get(r);return _.__externref_table_dealloc(r),e}let z=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});z.decode();const ie=2146435072;let k=0;function ce(r,e){return k+=e,k>=ie&&(z=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}),z.decode(),k=e),z.decode(R().subarray(r,r+e))}const E=new TextEncoder;"encodeInto"in E||(E.encodeInto=function(r,e){const t=E.encode(r);return e.set(t),{read:r.length,written:t.length}});let a=0,_;function se(r,e){return _=r.exports,I=null,x=null,j=null,_.__wbindgen_start(),_}function ae(r){if(_!==void 0)return _;r!==void 0&&(Object.getPrototypeOf(r)===Object.prototype?{module:r}=r:console.warn("using deprecated parameters for `initSync()`; pass a single object instead"));const e=K();r instanceof WebAssembly.Module||(r=new WebAssembly.Module(r));const t=new WebAssembly.Instance(r,e);return se(t)}function q(){let r=0;const e=new Map;return{add(t){const n=r++;return e.set(n,t),n},get(t){const n=e.get(t);if(!n)throw new Error("Attempted to use an object that has been freed");return n},remove(t){return e.delete(t)}}}const G=Symbol("transfer");function F(r,e){return{type:G,value:r,transfer:e?Array.isArray(e)?e:[e]:[r]}}function $(r){return!!(r&&typeof r=="object"&&Reflect.get(r,"type")===G)}function H(r="default"){return{createTx(e){const t=new Map,n=e??self;return n.addEventListener("message",o=>{const{data:i}=o;if(i.channelName!==r)return;const{id:c,result:s,error:f}=i,g=t.get(c);g&&(f?g.reject(f):g.resolve(s),t.delete(c))}),new Proxy({},{get(o,i){return(...c)=>{const s=ue(),f=[],g=[];return c.forEach(M=>{$(M)?(f.push(M.value),g.push(...M.transfer)):f.push(M)}),n.postMessage({method:i,args:f,id:s,channelName:r},{transfer:g}),new Promise((M,pe)=>{t.set(s,{resolve:M,reject:pe})})}}})},rx(e,t){const n=t??self;n.addEventListener("message",async o=>{const{data:i}=o;if(i.channelName!==r)return;const{method:c,args:s,id:f}=i;try{const g=await e[c](...s);$(g)?n.postMessage({result:g.value,id:f,channelName:r},{transfer:g.transfer}):n.postMessage({result:g,id:f,channelName:r})}catch(g){n.postMessage({error:g,id:f,channelName:r})}})}}}function ue(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}const de=16,fe="context-missing",{rx:be}=H(),{createTx:le}=H("worker");function ge(r){if(!(r!=null&&r.manifests))return r;const e=r.manifests,t=Object.assign(Object.create(null),e),n=Object.getPrototypeOf(e);return n!==null&&n!==Object.prototype&&(t.__proto__=n),r.manifests=t,r}const h=q(),b=q(),C=new Map,U=le();function we(r){const e=C.get(r.id);if(e!==void 0)return e;if(r.json!==void 0){const t=new v(r.json);if(C.size===de){const n=C.entries().next().value;if(n!==void 0){const[o,i]=n;i.free(),C.delete(o)}}return C.set(r.id,t),t}}async function O(r,e){const t=we(r);if(t===void 0)return fe;try{return await e(t)}finally{r.json!==void 0&&await U.context_registered(r.id)}}function X(r){return r.map(e=>({sigType:e.sigType,reserveSize:e.reserveSize,referencedAssertions:e.referencedAssertions,roles:e.roles,sign:async t=>{const n=t.referencedAssertions.map(i=>i.hash.buffer);return await U.cawgSign(e.requestId,F(t,n))}}))}be(me({async initWorker(r){ae({module:r})},encodeSignerPayload(r){const e=Y(r);return F(e,e.buffer)},async reader_fromBlob(r,e,t){return O(t,async n=>h.add(await S.fromBlobWithContext(r,e,n)))},async reader_fromBlobFragment(r,e,t,n){return O(n,async o=>h.add(await S.fromBlobFragmentWithContext(r,e,t,o)))},reader_activeLabel(r){return h.get(r).activeLabel()??null},reader_manifestStore(r){const e=h.get(r);return ge(e.manifestStore())},reader_activeManifest(r){return h.get(r).activeManifest()},reader_json(r){return h.get(r).json()},reader_crJson(r){return h.get(r).crJson()},reader_resourceToBytes(r,e){const n=h.get(r).resourceToBytes(e);return F(n,n.buffer)},reader_free(r){h.get(r).free(),h.remove(r)},async builder_new(r){return O(r,e=>b.add(p.newWithContext(e)))},async builder_fromJson(r,e){return O(e,t=>b.add(p.fromJsonWithContext(r,t)))},async builder_fromArchive(r,e){return O(e,t=>b.add(p.fromArchiveWithContext(r,t)))},builder_setIntent(r,e){b.get(r).setIntent(e)},builder_addAction(r,e){b.get(r).addAction(e)},builder_addAssertion(r,e,t){b.get(r).addAssertion(e,t)},builder_updateAssertionsAt(r,e,t){b.get(r).updateAssertionsAt(e,t)},builder_addRedaction(r,e,t){b.get(r).addRedaction(e,t)},builder_filterActionsAt(r,e){b.get(r).filterActionsAt(Uint32Array.from(e))},builder_updateActionsAt(r,e){b.get(r).updateActionsAt(e)},builder_filterIngredientsAt(r,e){b.get(r).filterIngredientsAt(Uint32Array.from(e))},builder_filterActionsAndIngredientsAt(r,e,t){b.get(r).filterActionsAndIngredientsAt(Uint32Array.from(e),Uint32Array.from(t))},builder_setRemoteUrl(r,e){b.get(r).setRemoteUrl(e)},builder_setNoEmbed(r,e){b.get(r).setNoEmbed(e)},builder_updateManifestProperty(r,e,t){b.get(r).updateManifestProperty(e,t)},builder_setThumbnailFromBlob(r,e,t){b.get(r).setThumbnailFromBlob(e,t)},builder_addIngredient(r,e){b.get(r).addIngredient(e)},async builder_addIngredientFromBlob(r,e,t,n){await b.get(r).addIngredientFromBlob(e,t,n)},builder_addResourceFromBlob(r,e,t){b.get(r).addResourceFromBlob(e,t)},builder_getDefinition(r){return b.get(r).getDefinition()},builder_toArchive(r){const t=b.get(r).toArchive();return F(t,t.buffer)},async builder_sign(r,e,t,n,o,i){const s=await b.get(r).sign({reserveSize:t.reserveSize,alg:t.alg,sign:async f=>await U.sign(e,F(f,f.buffer),t.reserveSize)},X(n),o,i);return F(s,s.buffer)},async builder_signAndGetManifestBytes(r,e,t,n,o,i){const c=b.get(r),{manifest:s,asset:f}=await c.signAndGetManifestBytes({reserveSize:t.reserveSize,alg:t.alg,sign:async g=>await U.sign(e,F(g,g.buffer),t.reserveSize)},X(n),o,i);return F({manifest:s,asset:f},[s.buffer,f.buffer])},builder_free(r){b.get(r).free(),b.remove(r)}}));function me(r){const e={};for(const[t,n]of Object.entries(r))e[t]=async(...o)=>{try{return await n(...o)}catch(i){throw typeof i=="string"?new Error(i):i}};return e}})();\n', E = typeof self < "u" && self.Blob && new Blob([V], { type: "text/javascript;charset=utf-8" });
function Q(r) {
  let e;
  try {
    if (e = E && (self.URL || self.webkitURL).createObjectURL(E), !e) throw "";
    const t = new Worker(e, {
      name: r == null ? void 0 : r.name
    });
    return t.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), t;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(V),
      {
        name: r == null ? void 0 : r.name
      }
    );
  } finally {
    e && (self.URL || self.webkitURL).revokeObjectURL(e);
  }
}
function ee(r) {
  if (r.protocol !== "https:")
    throw new Error(
      `Worker source URL must use https, but got ${r.protocol}`
    );
  return r.toString();
}
async function te(r) {
  const { wasm: e, workerSrc: t } = r;
  let o = 0, i = 0;
  const _ = t ? new Worker(ee(t), { type: "module" }) : new Q(), c = Z(_), s = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  K(
    {
      context_registered: (b) => {
        for (const f of s.values())
          if (f.id === b) {
            f.registered = !0;
            break;
          }
      },
      sign: async (b, f, h) => {
        const g = d.get(b);
        if (d.delete(b), !g)
          throw new Error("No signer registered for request");
        const p = await g(f, h);
        return C(p, p.buffer);
      },
      // Reverse-RPC handler for a CAWG credential holder's `sign`, mirroring
      // `sign` above: the callback was registered on the main thread by
      // `Builder.sign`/`signAndGetManifestBytes` (see
      // `registerCredentialHolderReceiver`) and is looked up and run here,
      // never inside the worker.
      cawgSign: async (b, f) => {
        const h = l.get(b);
        if (l.delete(b), !h)
          throw new Error("No credential holder registered for request");
        const g = await h(f);
        return C(g, g.buffer);
      }
    },
    _
  );
  function y(b) {
    const f = o++;
    return d.set(f, b), f;
  }
  function B(b) {
    const f = o++;
    return l.set(f, b), f;
  }
  function H(b) {
    const f = s.get(b);
    if (f !== void 0)
      return f.registered ? { id: f.id } : { id: f.id, json: b };
    if (s.size === Y) {
      const g = s.keys().next().value;
      g !== void 0 && s.delete(g);
    }
    if (!Number.isSafeInteger(i))
      throw new Error("Worker context ID space exhausted");
    const h = i++;
    return s.set(b, { id: h, registered: !1 }), { id: h, json: b };
  }
  async function X(b, f) {
    const h = this.context(b), g = await f(h);
    if (g !== O)
      return g;
    const p = await f({ id: h.id, json: b });
    if (p === O)
      throw new Error("Worker did not register the supplied context settings");
    return p;
  }
  return await c.initWorker(e), {
    tx: c,
    context: H,
    withContext: X,
    registerSignReceiver: y,
    registerCredentialHolderReceiver: B,
    terminate: () => {
      s.clear(), _.terminate();
    }
  };
}
typeof FinalizationRegistry > "u" || new FinalizationRegistry((r) => R.__wbg_wasmbuilder_free(r, 1));
typeof FinalizationRegistry > "u" || new FinalizationRegistry((r) => R.__wbg_wasmcontext_free(r, 1));
typeof FinalizationRegistry > "u" || new FinalizationRegistry((r) => R.__wbg_wasmreader_free(r, 1));
typeof FinalizationRegistry > "u" || new FinalizationRegistry((r) => R.__wbg_wasmsigner_free(r, 1));
typeof FinalizationRegistry > "u" || new FinalizationRegistry((r) => R.__wbindgen_destroy_closure(r.a, r.b));
let ne = new TextDecoder("utf-8", { ignoreBOM: !0, fatal: !0 });
ne.decode();
const j = new TextEncoder();
"encodeInto" in j || (j.encodeInto = function(r, e) {
  const t = j.encode(r);
  return e.set(t), {
    read: r.length,
    written: t.length
  };
});
let R;
const re = "sha512-rYCAbTh83gL8zLqFNrMVGdp0gqWWZ3yYNyxORyqfRIg9M7vMk+xjFGLlVNFaZvzg1Ce1x87yejuoWHAh+fGsUw==";
async function de(r) {
  const { wasmSrc: e, workerSrc: t } = r, o = typeof e == "string" ? await ie(e) : e, i = await te({ wasm: o, workerSrc: t });
  return {
    worker: i,
    dispose: i.terminate
  };
}
async function ie(r) {
  const e = await fetch(r, { integrity: re });
  return await WebAssembly.compileStreaming(e);
}
const N = 10 ** 9, z = new FinalizationRegistry(
  async ({ worker: r, id: e }) => {
    await r.tx.reader_free(e);
  }
);
var w, m;
const F = class F {
  constructor(e, t) {
    A(this, w);
    A(this, m);
    v(this, w, e), v(this, m, t);
  }
  /**
   * Create a {@link Reader} from an asset's format and a blob of its bytes.
   *
   * @param c2pa The `C2pa` instance (from {@link createC2pa}) to create this reader on.
   * @param format Asset format (MIME type or extension), typically `blob.type`. If omitted
   * or empty, the native library will attempt to detect the format from the asset's bytes instead.
   * Always provide the format if known, and only omit this when the caller has no way to determine
   * the asset's format otherwise.
   * @param blob Blob of asset bytes.
   * @param context Optional `Context` configuring this reader's behavior.
   * @returns A {@link Reader} object or null if no C2PA metadata was found.
   * @throws If the asset is too large, or if the `Context` sets an invalid `maxSizeInBytes`.
   */
  static async fromBlob(e, t, o, i = new x()) {
    M(
      o.size,
      W(i.sdkConfig, N)
    );
    try {
      const _ = await i.toJson(), { worker: c } = e, s = await c.withContext(
        _,
        (l) => c.tx.reader_fromBlob(t ?? "", o, l)
      ), d = new F(c, s);
      return z.register(d, { worker: c, id: s }, d), d;
    } catch (_) {
      return J(_);
    }
  }
  /**
   * Create a {@link Reader} from an initial fragment and a subsequent fragment.
   *
   * @param c2pa The `C2pa` instance (from {@link createC2pa}) to create this reader on.
   * @param format Asset format (MIME type or extension). Unlike {@link fromBlob}, fragmented
   * assets cannot be auto-detected from their bytes, so a format must be supplied.
   * @param init Blob of initial fragment bytes.
   * @param fragment Blob of fragment bytes.
   * @param context Optional `Context` configuring this reader's behavior.
   * @returns A {@link Reader} object or null if no C2PA metadata was found.
   * @throws If the asset is too large, or if the `Context` sets an invalid `maxSizeInBytes`.
   */
  static async fromBlobFragment(e, t, o, i, _ = new x()) {
    const c = W(
      _.sdkConfig,
      N
    );
    M(o.size, c), M(i.size, c);
    try {
      const s = await _.toJson(), { worker: d } = e, l = await d.withContext(
        s,
        (B) => d.tx.reader_fromBlobFragment(t, o, i, B)
      ), y = new F(d, l);
      return z.register(y, { worker: d, id: l }, y), y;
    } catch (s) {
      return J(s);
    }
  }
  /**
   * @returns The label of the active manifest.
   */
  async activeLabel() {
    return await n(this, w).tx.reader_activeLabel(n(this, m));
  }
  /**
   * @returns The asset's full {@link ManifestStore} containing all its manifests, validation statuses, and the URI of the active manifest.
   */
  async manifestStore() {
    return await n(this, w).tx.reader_manifestStore(n(this, m));
  }
  /**
   * @returns The asset's active {@link Manifest}.
   */
  async activeManifest() {
    return await n(this, w).tx.reader_activeManifest(n(this, m));
  }
  /**
   * @returns The asset's full {@link ManifestStore}.
   *
   * @deprecated Use {@link manifestStore} instead.
   */
  async json() {
    const e = await n(this, w).tx.reader_json(n(this, m));
    return JSON.parse(e);
  }
  /**
   * @returns The asset's manifest store as crJSON.
   */
  async crJson() {
    const e = await n(this, w).tx.reader_crJson(n(this, m));
    return JSON.parse(e);
  }
  /**
   * Resolves a URI reference to a binary object (e.g. a thumbnail) in the resource store.
   *
   * @param uri URI of the binary object to resolve.
   * @returns A Uint8Array of the resource's bytes.
   *
   * @example Retrieving a thumbnail from the resource store:
   * ```
   * const reader = await Reader.fromBlob(c2pa, blob.type, blob);
   * const activeManifest = await reader.activeManifest();
   * const thumbnailBuffer = await reader.resourceToBytes(activeManifest.thumbnail!.identifier);
   * ```
   */
  async resourceToBytes(e) {
    return await n(this, w).tx.reader_resourceToBytes(n(this, m), e);
  }
  /**
   * Dispose of this Reader, freeing the memory it occupied and preventing further use.
   * Call this whenever the Reader is no longer needed.
   */
  async free() {
    z.unregister(this), await n(this, w).tx.reader_free(n(this, m));
  }
};
w = new WeakMap(), m = new WeakMap();
let U = F;
function J(r) {
  if (r instanceof Error && r.message === "C2pa(JumbfNotFound)")
    return null;
  throw r;
}
async function L(r) {
  const { alg: e } = r;
  return {
    reserveSize: await r.reserveSize(),
    alg: e
  };
}
async function fe(r, e) {
  return r.worker.tx.encodeSignerPayload(e);
}
function _e(r, e) {
  const { credentialHolder: t, referencedAssertions: o, roles: i } = r;
  return {
    requestId: e,
    sigType: t.sigType,
    reserveSize: t.reserveSize,
    referencedAssertions: o ?? [],
    roles: i ?? []
  };
}
function D(r) {
  return $(r).flat();
}
function $(r) {
  return (r.assertions ?? []).filter((e) => e.label.startsWith("c2pa.actions")).map((e) => {
    const t = e.data;
    return (t == null ? void 0 : t.actions) ?? [];
  });
}
function q(r, e) {
  const t = (e == null ? void 0 : e.identityAssertions) ?? [];
  if (t.length > 1)
    throw new Error(
      "Only one identity assertion is currently supported per signing operation."
    );
  return t.map((o) => {
    const i = r.registerCredentialHolderReceiver(
      o.credentialHolder.sign
    );
    return _e(o, i);
  });
}
const S = new FinalizationRegistry(
  ({ worker: r, id: e }) => {
    r.tx.builder_free(e);
  }
);
var a, u;
const I = class I {
  constructor(e, t) {
    A(this, a);
    A(this, u);
    v(this, a, e), v(this, u, t);
  }
  /**
   * Create a {@link Builder} with a minimal manifest definition as its initial state.
   *
   * @param c2pa The `C2pa` instance (from {@link createC2pa}) to create this builder on.
   * @param context Optional `Context` configuring this builder's behavior.
   * @returns A {@link Builder} object.
   */
  static async new(e, t = new x()) {
    const o = await t.toJson(), { worker: i } = e, _ = await i.withContext(
      o,
      (s) => i.tx.builder_new(s)
    ), c = new I(i, _);
    return S.register(c, { worker: i, id: _ }, c), c;
  }
  /**
   * Create a {@link Builder} from a {@link ManifestDefinition}.
   *
   * @param c2pa The `C2pa` instance (from {@link createC2pa}) to create this builder on.
   * @param definition The {@link ManifestDefinition} to be used as the builder's initial state.
   * @param context Optional `Context` configuring this builder's behavior.
   * @returns A {@link Builder} object.
   */
  static async fromDefinition(e, t, o = new x()) {
    const i = JSON.stringify(t), _ = await o.toJson(), { worker: c } = e, s = await c.withContext(
      _,
      (l) => c.tx.builder_fromJson(i, l)
    ), d = new I(c, s);
    return S.register(d, { worker: c, id: s }, d), d;
  }
  /**
   * Create a {@link Builder} from a builder archive (created from {@link Builder.toArchive}).
   *
   * @param c2pa The `C2pa` instance (from {@link createC2pa}) to create this builder on.
   * @param archive Builder archive as a blob.
   * @param context Optional `Context` configuring this builder's behavior.
   * @returns A {@link Builder} object.
   */
  static async fromArchive(e, t, o = new x()) {
    const i = await o.toJson(), { worker: _ } = e, c = await _.withContext(
      i,
      (d) => _.tx.builder_fromArchive(t, d)
    ), s = new I(_, c);
    return S.register(s, { worker: _, id: c }, s), s;
  }
  /**
   * Sets the builder "intent."
   *
   * @todo Additional documentation coming soon.
   *
   * @param intent
   */
  async setIntent(e) {
    await n(this, a).tx.builder_setIntent(n(this, u), e);
  }
  /**
   * Add an action to the manifest's actions assertion.
   *
   * @param action Object representing the action to be added.
   */
  async addAction(e) {
    await n(this, a).tx.builder_addAction(n(this, u), e);
  }
  /**
   * Add an assertion to the manifest under the given label.
   *
   * @param label The assertion label (reverse-domain format).
   * @param data The assertion data (any JSON-serializable value).
   */
  async addAssertion(e, t) {
    await n(this, a).tx.builder_addAssertion(n(this, u), e, t);
  }
  /**
   * Replaces the data of every assertion with an exact matching label.
   * `transform` runs once per matching assertion in manifest order. Other assertion
   * fields and positions are preserved. A missing label is a no-op.
   * Returning null or undefined leaves that assertion unchanged.
   * The replacement data must be JSON-serializable and may fail validation at signing time.
   *
   * @param label The exact assertion label to update.
   * @param transform Receives the current data and returns its replacement.
   */
  async updateAssertion(e, t) {
    const i = ((await this.getDefinition()).assertions ?? []).filter((_) => _.label === e).map((_) => t(_.data) ?? _.data);
    await n(this, a).tx.builder_updateAssertionsAt(n(this, u), e, i);
  }
  /**
   * Redact an assertion from an ingredient manifest.
   *
   * Adds the URI to the builder's redaction list and appends a `c2pa.redacted` action
   * with the given reason, as required by the C2PA spec.
   *
   * @param uri JUMBF URI of the assertion to redact.
   * @param reason The {@link C2paReason} for the redaction.
   */
  async addRedaction(e, t) {
    await n(this, a).tx.builder_addRedaction(n(this, u), e, t);
  }
  /**
   * Sets the remote URL for a remote manifest. The manifest is expected to be available at this location.
   *
   * @param url URL pointing to the location the remote manifest will be stored.
   */
  async setRemoteUrl(e) {
    await n(this, a).tx.builder_setRemoteUrl(n(this, u), e);
  }
  /**
   * Sets the state of the no_embed flag.
   * To skip embedding a manifest (e.g. for the remote-only case), set this to `true`.
   *
   * @param noEmbed Value to set the no_embed flag.
   */
  async setNoEmbed(e) {
    await n(this, a).tx.builder_setNoEmbed(n(this, u), e);
  }
  /**
   * Updates a (known) property in the manifest definition.
   * Rejects an unsupported property or value type,
   * or while a sign on this builder is pending.
   */
  async updateManifestProperty(e, t) {
    await n(this, a).tx.builder_updateManifestProperty(n(this, u), e, t);
  }
  /**
   * Set a thumbnail from a blob to be included in the manifest. The blob should represent the asset being signed.
   *
   * @param format Format of the thumbnail
   * @param blob Blob of the thumbnail bytes
   */
  async setThumbnailFromBlob(e, t) {
    await n(this, a).tx.builder_setThumbnailFromBlob(n(this, u), e, t);
  }
  /**
   * Experimental.
   * Retains only the actions for which `keep` returns true.
   *
   * The inception action, `c2pa.created` or `c2pa.opened`, is always kept regardless of `keep`,
   * and is moved to index 0 if needed, so the manifest stays valid per the C2PA spec. Sets
   * `allActionsIncluded = false` when anything is removed. This does not touch ingredients.
   * Call {@link Builder.filterIngredients}, using `filterIngredients(() => false)` to drop all
   * orphans, afterwards if you also want to drop ingredients now orphaned by the removed
   * actions.
   *
   * Unlike the Node binding, Neon, which can invoke the JS predicate synchronously from Rust,
   * the WASM builder lives in a Web Worker. A predicate closure can't be called across the
   * worker boundary, so we evaluate it here on the main thread and send the resulting indices
   * to the worker, where WASM applies the equivalent index-based filter. The action/ingredient
   * ordering here must match what WASM iterates. See `filterActionsAt` and `filterIngredientsAt`.
   *
   * @param keep The action is retained when the predicate returns true.
   */
  async filterActions(e) {
    const t = await n(this, a).tx.builder_getDefinition(
      n(this, u)
    ), i = D(t).reduce((_, c, s) => (e(c) && _.push(s), _), []);
    await n(this, a).tx.builder_filterActionsAt(n(this, u), i);
  }
  /**
   * Experimental.
   * Retains ingredients, then rewrites positional ingredient references so linked actions
   * stay valid.
   *
   * An ingredient is kept if it is referenced by a current action, is a `parentOf` ingredient,
   * or `rescue` returns true for it. `rescue` therefore only ever rescues an otherwise-orphaned
   * ingredient. It can never drop a referenced or lineage ingredient. Call
   * {@link Builder.filterActions} first if you are also removing actions: the keep-set is
   * computed from whatever actions currently remain.
   *
   * @param rescue Can rescue an otherwise-orphaned ingredient by returning true.
   */
  async filterIngredients(e) {
    const i = ((await n(this, a).tx.builder_getDefinition(
      n(this, u)
    )).ingredients ?? []).reduce((_, c, s) => (e(c) && _.push(s), _), []);
    await n(this, a).tx.builder_filterIngredientsAt(n(this, u), i);
  }
  /**
   * Experimental.
   * Retains actions and ingredients together in one step.
   *
   * `rescueIngredient` is evaluated for every ingredient first; any action referencing an
   * ingredient it would rescue is force-kept regardless of `keepAction`.
   *
   * @param keepAction The action is retained when the predicate returns true.
   * @param rescueIngredient Can rescue an otherwise-orphaned ingredient (and the action
   * referencing it) by returning true.
   */
  async filterActionsAndIngredients(e, t) {
    const o = await n(this, a).tx.builder_getDefinition(
      n(this, u)
    ), _ = D(o).reduce((d, l, y) => (e(l) && d.push(y), d), []), s = (o.ingredients ?? []).reduce(
      (d, l, y) => (t(l) && d.push(y), d),
      []
    );
    await n(this, a).tx.builder_filterActionsAndIngredientsAt(
      n(this, u),
      _,
      s
    );
  }
  /**
   * Replaces the actions in the `c2pa.actions`/`c2pa.actions.v2` assertions.
   *
   * A manifest can carry more than one actions assertion (the created-list and
   * gathered-list entries are distinct assertions). `transform` is therefore
   * invoked once per actions assertion, in positional order, with that
   * assertion's own actions.
   *
   * A no-op if there is no actions assertion. Use `addAction` for those.
   *
   * The returned list is written back as is.
   * `transform` can therefore produce an actions array that fails
   * validation at signing time, for example by removing the inception action
   * (`c2pa.created`/`c2pa.opened`) or moving it out of first position.
   *
   * @param transform Receives one assertion's actions and returns its full replacement list.
   */
  async updateActions(e) {
    const t = await n(this, a).tx.builder_getDefinition(
      n(this, u)
    ), i = $(t).map((_) => e(_));
    await n(this, a).tx.builder_updateActionsAt(n(this, u), i);
  }
  /**
   * Add an ingredient to the builder from a definition only.
   *
   * @param ingredientDefinition {@link Ingredient} definition.
   */
  async addIngredient(e) {
    const t = JSON.stringify(e);
    await n(this, a).tx.builder_addIngredient(n(this, u), t);
  }
  /**
   * Add an ingredient to the builder from a definition, format, and blob.
   * Values specified in the ingredient definition will be merged with the ingredient, and these values take precendence.
   *
   * @param ingredientDefinition {@link Ingredient} definition.
   * @param format Format of the ingredient.
   * @param blob Blob of the ingredient's bytes.
   */
  async addIngredientFromBlob(e, t, o) {
    const i = JSON.stringify(e);
    await n(this, a).tx.builder_addIngredientFromBlob(n(this, u), i, t, o);
  }
  /**
   * Add a resource to the builder's resource store with an ID and blob of the resource's bytes.
   *
   * @param resourceId ID associated with the resource being added.
   * @param blob Blob of the resource's bytes.
   */
  async addResourceFromBlob(e, t) {
    await n(this, a).tx.builder_addResourceFromBlob(n(this, u), e, t);
  }
  /**
   * Gets the current manifest definition held by the builder.
   *
   * @returns The {@link ManifestDefinition} held by the builder.
   */
  async getDefinition() {
    return await n(this, a).tx.builder_getDefinition(n(this, u));
  }
  /**
   * Save the builder into .c2pa format.
   * This "archive" can be added to as an ingredient with {@link addIngredientFromBlob}
   *
   * @returns A builder archive in application/c2pa format.
   */
  async toArchive() {
    return await n(this, a).tx.builder_toArchive(n(this, u));
  }
  /**
   * Sign an asset.
   *
   * @param signer The signer to use for the manifest's claim signature.
   * @param format The format (MIME type) of the asset.
   * @param blob The asset bytes.
   * @param options Optional {@link SignOptions}. `identityAssertions` attaches
   * one or more CAWG identity assertions (`cawg.identity`) to the manifest.
   *
   * @todo Docs coming soon
   */
  async sign(e, t, o, i) {
    const _ = await L(e), c = n(this, a).registerSignReceiver(e.sign), s = q(
      n(this, a),
      i
    );
    return await n(this, a).tx.builder_sign(
      n(this, u),
      c,
      _,
      s,
      t,
      o
    );
  }
  /**
   * Sign an asset and get both the signed asset bytes and the manifest bytes.
   *
   * @param signer The signer to use for the manifest's claim signature.
   * @param format The format (MIME type) of the asset.
   * @param blob The asset bytes.
   * @param options Optional {@link SignOptions}. `identityAssertions` attaches
   * one or more CAWG identity assertions (`cawg.identity`) to the manifest.
   *
   * @todo Docs coming soon
   */
  async signAndGetManifestBytes(e, t, o, i) {
    const _ = await L(e), c = n(this, a).registerSignReceiver(e.sign), s = q(
      n(this, a),
      i
    );
    return await n(this, a).tx.builder_signAndGetManifestBytes(
      n(this, u),
      c,
      _,
      s,
      t,
      o
    );
  }
  /**
   * Dispose of this Builder, freeing the memory it occupied and preventing further use. Call this whenever the Builder is no longer needed.
   */
  async free() {
    S.unregister(this), await n(this, a).tx.builder_free(n(this, u));
  }
};
a = new WeakMap(), u = new WeakMap();
let P = I;
export {
  P as B,
  U as R,
  de as c,
  fe as e
};
