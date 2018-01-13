'use strict';
// export default class Storage {
export default class Storage {
  constructor (init, defaultValue) {
    this.STORAGE_SUBSCRIBERS = [];
    if (init != undefined && init != null) {
      if (typeof init === 'object' && !Array.isArray(init) && !init.NOT_STORAGE) {
        for (let i in init)
          this[i] = new Storage(init[i]);
      } else {
        this.STORAGE_VALUE = init;
      }
    } else {
      if (defaultValue != undefined)
        this.STORAGE_VALUE = defaultValue;
      else
        this.STORAGE_VALUE = null;
    }
    return true;
  }
  storage_update (newInitData) {
    // console.log(newInitData);
    if (newInitData.STORAGE_VALUE || typeof newInitData !== 'object' || Array.isArray(newInitData)) {
      this.STORAGE_VALUE = newInitData.STORAGE_VALUE;
    } else {
      delete this.STORAGE_VALUE;
      for (let i in this) {
        if (i != 'STORAGE_VALUE' && i != 'STORAGE_SUBSCRIBERS') {
          if (newInitData[i] === undefined) {
            delete this[i];
          }
        }
      }
      for (let i in newInitData) {
        if (i != 'STORAGE_VALUE' && i != 'STORAGE_SUBSCRIBERS') {
          if (this[i] !== undefined && typeof this[i].storage_update === 'function' && this[i].__proto__ === this.__proto__) {
            this[i].storage_update(newInitData[i]);
          } else {
            this[i] = new Storage(newInitData[i]);
          }
        }
      }
    }
    if (newInitData && newInitData.STORAGE_SUBSCRIBERS) {
      this.STORAGE_SUBSCRIBERS = newInitData.STORAGE_SUBSCRIBERS;
    }
  }
  update (newInitData) {
    this.storage_update(newInitData);
    this.callAllSubscribers();
  }
  callAllSubscribers () {
    // console.log(this);
    for (let i = 0; i < this.STORAGE_SUBSCRIBERS.length; i++) {
      this.STORAGE_SUBSCRIBERS[i].callback(this.STORAGE_VALUE);
    }
    for (let i in this) {
      if (i != 'STORAGE_VALUE' && i != 'STORAGE_SUBSCRIBERS') {
        this[i].callAllSubscribers();
      }
    }
  }
  set(value=null) {
    this.STORAGE_VALUE = value;
    for (let i = 0; i < this.STORAGE_SUBSCRIBERS.length;) {
      if (typeof this.STORAGE_SUBSCRIBERS[i].callback == 'function') {
        if (this.STORAGE_SUBSCRIBERS[i].delayed) {
          setTimeout(() => {
            this.STORAGE_SUBSCRIBERS[i].callback(this.STORAGE_VALUE);
          }, 0);
        } else {
          this.STORAGE_SUBSCRIBERS[i].callback(this.STORAGE_VALUE);
        }
        i++;
      } else {
        this.STORAGE_SUBSCRIBERS.splice(i, 1);
      }
    }
    return true;
  }
  get () {
    return this.STORAGE_VALUE;
  }
  subscribe (callback, delayed=false, dontTestForDoubles=false) {
    let dontPush = false;
    if (!dontTestForDoubles) {
      for (let i = 0; i < this.STORAGE_SUBSCRIBERS.length; i++) {
        if (this.STORAGE_SUBSCRIBERS[i] === callback) {
          dontPush = true;
          break;
        }
      }
    }
    if (!dontPush)
      this.STORAGE_SUBSCRIBERS.push({delayed, callback});
    return this.STORAGE_VALUE;
  }
  sub(callback, delayed, dontTestForDoubles) {return this.subscribe(callback, delayed, dontTestForDoubles)}
  unsubscribe (callbackToUnsub) {
    for (let i = 0; i < this.STORAGE_SUBSCRIBERS.length; i++) {
      if (this.STORAGE_SUBSCRIBERS[i].callback === callbackToUnsub) {
        this.STORAGE_SUBSCRIBERS.splice(i, 1);
        break;
      }
    }
    return this.STORAGE_VALUE;
  }
  unsub(callbackToUnsub) {return this.unsubscribe(callbackToUnsub)}
  add (childrenName, defaultValue) {
    if (childrenName == 'STORAGE_VALUE' || childrenName == 'STORAGE_SUBSCRIBERS') {
      throw `Resticted name '${childrenName}'`
    } else {
      this[childrenName] = new Storage(null, defaultValue);
      return true;
    }
  }
  clone (withSubscribers=true, parent=false) {
    const result = new Storage();
    if (withSubscribers)
      result.STORAGE_SUBSCRIBERS = [...this.STORAGE_SUBSCRIBERS];
    for (let i in this) {
      if (i != 'STORAGE_VALUE' && i != 'STORAGE_SUBSCRIBERS') {
        result[i] = this[i].clone(withSubscribers, result);
      } else {
        if (i != 'STORAGE_SUBSCRIBERS' || withSubscribers)
        result[i] = this[i];
      }
    }
    return result;
  }
}