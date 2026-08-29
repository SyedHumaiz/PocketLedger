export type LockState='unlocked'|'locked'|'prompting';
export const shouldLockOnActive=(enabled:boolean,wasBackgrounded:boolean,state:LockState)=>enabled&&wasBackgrounded&&state==='unlocked';
export const canStartPrompt=(state:LockState)=>state==='locked';
export const resolvePrompt=(request:number,current:number,success:boolean):LockState|null=>request===current?(success?'unlocked':'locked'):null;
