export function replaceCachedItems<T extends {id:string}>(existing:T[],incoming:T[]):T[]{const next=new Map(existing.map(item=>[item.id,item]));for(const item of incoming)next.set(item.id,item);return [...next.values()];}
export function cachedGroupView<T>(cached:T|null,online:boolean):{data:T|null;source:'cache'|'network'} {return {data:cached,source:online?'network':'cache'};}
