type ModelContext={registerTool:(tool:{name:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown},options:{signal:AbortSignal})=>unknown};
export function registerGameTools(read:()=>unknown,context?:ModelContext){
 const model=context??(document as Document&{modelContext?:ModelContext}).modelContext;
 if(!model)return()=>{};
 const lifecycle=new AbortController();
 try{void Promise.resolve(model.registerTool({name:'read_picnic_board',description:'Read the current picnic lesson and item counts without changing or solving the child’s work.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object.');return read();}},{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser API. */}
 return()=>lifecycle.abort();
}
