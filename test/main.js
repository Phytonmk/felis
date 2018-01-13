'use strict';
const fail = (e) => {console.error(`${currentTest} test failed with error: ${e}`); process.exit()};
const Storage = require('../debug/index.js').default;
let storage, storage2, foo = f => {var1 = f + 3}, bar = b => var2 = b + 4, var1 = 0, var2 = 0;
const testes = [()=>{
  storage = new Storage();
  currentTest++;
  try {testes[currentTest]()} catch (e) {fail(e)};
},
()=>{
  storage.add('valueStorage', 'value');
  if (storage.valueStorage.get() === 'value') {
    currentTest++;
    try {testes[currentTest]()} catch (e) {fail(e)};
  } else {
    fail('storage can\'t save data properly');
  }
},
()=>{
  storage.valueStorage.sub(foo);
  storage.valueStorage.subscribe(bar);
  storage.valueStorage.set(5);
  if (var1 !== 5 + 3 || var2 !== 5 + 4)
    fail('Storage cant handle subscribers')
  currentTest++;
  try {testes[currentTest]()} catch (e) {fail(e)};
},
()=>{
  let fail = true;
  storage.sub(() => {fail = false});
  storage.valueStorage.set(5);
  if (fail)
    fail('Storage cant handle lifting calling event')
  currentTest++;
  try {testes[currentTest]()} catch (e) {fail(e)};
},
()=>{
  storage.valueStorage.unsub(foo);
  storage.valueStorage.unsubscribe(bar);
  storage.valueStorage.set(1);
  if (var1 !== 5 + 3 || var2 !== 5 + 4)
    fail('Storage cant handle unsubscribs');
  currentTest++;
  try {testes[currentTest]()} catch (e) {fail(e)};
},
()=>{
  storage.valueStorage.sub(foo);
  storage2 = storage.clone(true);
  if (storage.valueStorage.__STORAGE__.subscribers[0] !== storage2.valueStorage.__STORAGE__.subscribers[0])
    fail('Storage cant be cloned with subscribers properly')
  currentTest++;
  try {testes[currentTest]()} catch (e) {fail(e)};
},
()=>{
  storage.valueStorage.set(10);
  const storage3 = storage.clone();
  // ctrl-z
  storage.update(storage2);
  if (var1 !== 1 + 3)
    fail('Storage cant be updated (ctrl-z fail)');
  // ctrl-z
  storage.update(storage3);
  if (var1 !== 10 + 3)
    fail('Storage cant be updated (ctrl-shift-z fail)');
  // storage.update({
  //   valueStorage: 10,
  //   anotherContainer: 8
  // });
  // console.log(storage);
  // console.log(var1);
  console.log('All tests were completed successfully');
}];
let currentTest = 0;
try {testes[currentTest]()} catch (e) {fail(e)}