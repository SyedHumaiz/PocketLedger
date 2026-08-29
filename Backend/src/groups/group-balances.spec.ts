import { calculateGroupBalances } from './group-balances';

const members=[{id:'a',name:'A',email:'a@example.test'},{id:'b',name:'B',email:'b@example.test'},{id:'c',name:'C',email:'c@example.test'}];
describe('calculateGroupBalances',()=>{
  it('is deterministic for unequal shares and a single payer covering everyone',()=>{expect(calculateGroupBalances(members,[{paidByUserId:'a',shares:[{userId:'a',amountMinor:100},{userId:'b',amountMinor:200},{userId:'c',amountMinor:700}]}])).toEqual([{userId:'a',name:'A',email:'a@example.test',paidMinor:1000,owedMinor:100,netMinor:900},{userId:'b',name:'B',email:'b@example.test',paidMinor:0,owedMinor:200,netMinor:-200},{userId:'c',name:'C',email:'c@example.test',paidMinor:0,owedMinor:700,netMinor:-700}]);});
  it('aggregates multiple expenses and members using integer minor units',()=>{const balances=calculateGroupBalances(members,[{paidByUserId:'a',shares:[{userId:'a',amountMinor:500},{userId:'b',amountMinor:500}]},{paidByUserId:'b',shares:[{userId:'a',amountMinor:300},{userId:'b',amountMinor:300},{userId:'c',amountMinor:400}]}]);expect(balances.map(({userId,paidMinor,owedMinor,netMinor})=>({userId,paidMinor,owedMinor,netMinor}))).toEqual([{userId:'a',paidMinor:1000,owedMinor:800,netMinor:200},{userId:'b',paidMinor:1000,owedMinor:800,netMinor:200},{userId:'c',paidMinor:0,owedMinor:400,netMinor:-400}]);});
});
