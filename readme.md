Felis.js
========

Simple statement container with time traveling

Installing
------

```
npm install felisjs --save
```
or
```
yarn add felisjs
```

Using
-----

### Initialization

```js
const Storage = require('felisjs');

// init empty storage and then add some containers 

const storage = new Storage();
storage.add('stringContainer', 'string data');
storage.add('data');
storage.data.add('someNumber', 5);
storage.data.add('someArray', []);

// or init with special object

const storage = new Storage({
    stringContainer: 'string data',
    data: {
        someNumber: 5,
        someArray: []
    }
});

// these examples are equal
```

### Getting and setting data

```js

storage.stringData.get() // 'string data';
storage.stringData.set('Hello world!') // 'Hello world!'
storage.stringData.get() // 'Hello world!';
```

### Subscribing to data changing

You can subscribe any functions to some container and any time value of that container changes functions are called

```js

const foo = (x) => {
    console.log(`foo was called with ${x}`);
}
const bar = (x) => {
    console.log(`bar was called with ${x}`);
}

// Methods .subscribe and .sub are equal
storage.data.someNumber.subscribe(bar);
storage.data.someNumber.sub(foo);
storage.data.someNumber.sub(function(x) {
    console.log(`Common anonimous function was called with ${x}`);
});
storage.data.someNumber.sub((x) => {
    console.log(`Arrow anonimous function was called with ${x}`);
});

storage.data.someNumber.set(10);

/* it will log
foo was called with 10
bar was called with 10
Common anonymous function was called with 10
Arrow anonymous function was called with 10
*/

// You also can unsubscibe functions
storage.data.someNumber.unsubscribe(bar);
storage.data.someNumber.unsub(foo);

storage.data.someNumber.set(20);
/* it will log
Common anonimous function was called with 20
Arrow anonimous function was called with 20
*/

```

### Time traveling

To handle time traveling (ctrl-z, ctrl-shift-z) you need to save copies of storage somewhere and then update current storage with previously saved

```js

const Storage = require('felisjs');
const storage = new Storage();

const storage.add('editableText', 'Write something...');

storage.editableText.sub((newText) => {
    console.info(`Text has been changed to ${newText}`);
    // do something
});


const storages = [storage];
let currentStoragePosition = 0;

let lastHandledStorage = storage.clone();
storage.editableText.sub((newText) => {
    if (lastHandledStorage.editableText.get() !== newText) {
        while (currentStoragePosition > 0) {
            currentStoragePosition--;
            storages.shift();
        }
        storages.push(lastHandledStorage);
        lastHandledStorage = storage.clone();
    }
});

// ctrl-z
const goBack = () => {
    if (currentStoragePosition < storages.length - 1) {
        currentStoragePosition++;
        storage.update(storages[currentStoragePosition]);
    }
}
// ctrl-shift-z
const goForward = () => {
    if (currentStoragePosition > 1) {
        currentStoragePosition--;
        storage.update(storages[currentStoragePosition]);
    }
}
```

Run test
--------

```
npm test
```

Install dev dependencies
--------

```
npm install --only=dev
```

Build debug and dist
----

```
npm build
```

### watcher
```
npm watch
```

Author
-----

You can contact me via Telegram [@phytonmk](http://t.me/phytonmk)
