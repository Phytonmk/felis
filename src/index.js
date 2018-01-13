class Storage {
  constructor (init, defaultValue, parentStorage) {
    this.__STORAGE__ = {};
    this.__STORAGE__.subscribers = [];
    if (parentStorage) {
      this.__STORAGE__.parent = parentStorage;
    }
    if (init != undefined && init != null) {
      if (typeof init === 'object' && !Array.isArray(init) && !init.NOT_STORAGE) {
        for (let i in init)
          this[i] = new Storage(init[i], undefined, this);
      } else {
        if (Array.isArray(init))
          this.__STORAGE__.value = [...init];
        if (init.NOT_STORAGE)
          this.__STORAGE__.value = Object.assign({}, init);
      }
    } else {
      if (defaultValue != undefined)
        this.__STORAGE__.value = defaultValue;
      else
        this.__STORAGE__.value = null;
    }
    const thisStorage = this;
    this.__STORAGE__.methods = {
      storage_update: function (newInitData, parent=false) {
        if (parent)
          thisStorage.__STORAGE__.parent = parent;
        if (newInitData.__STORAGE__.value || typeof newInitData !== 'object' || Array.isArray(newInitData)) {
          if (Array.isArray(newInitData))
            thisStorage.__STORAGE__.value = [...newInitData];
          else
            thisStorage.__STORAGE__.value = newInitData.__STORAGE__.value;
        } else {
          for (let i in thisStorage) {
            if (i != '__STORAGE__') {
              if (newInitData[i] === undefined) {
                delete thisStorage[i];
              }
            }
          }
          for (let i in newInitData) {
            if (i != '__STORAGE__') {
              if (thisStorage[i] !== undefined && typeof thisStorage[i].__STORAGE__.methods.storage_update === 'function' && thisStorage[i].__proto__ === thisStorage.__proto__) {
                thisStorage[i].__STORAGE__.methods.storage_update(newInitData[i], parent);
              } else {
                thisStorage[i] = new Storage(newInitData[i], undefined, thisStorage);
              }
            }
          }
        }
        if (newInitData && newInitData.__STORAGE__.subscribers) {
          thisStorage.__STORAGE__.subscribers = newInitData.__STORAGE__.subscribers;
        }
      },
      subscribersCallingFromRoot: function () {
        for (let i = 0; i < thisStorage.__STORAGE__.subscribers.length; i++) {
          thisStorage.__STORAGE__.subscribers[i].callback(thisStorage.__STORAGE__.value);
        }
        for (let i in thisStorage) {
          if (i != '__STORAGE__') {
            thisStorage[i].__STORAGE__.methods.subscribersCallingFromRoot();
          }
        }
      },
      subscribersCallingToRoot: function () {
        // console.log('subscribersCallingToRoot');
        for (let i = 0; i < thisStorage.__STORAGE__.subscribers.length; i++) {
          thisStorage.__STORAGE__.subscribers[i].callback();
        }
        if (thisStorage.__STORAGE__.parent) {
          thisStorage.__STORAGE__.parent.__STORAGE__.methods.subscribersCallingToRoot();
        }
      }
    }
    /*this.__STORAGE__.debug = (address='127.0.0.1', port='3000', polling=false) => {
      const ip = (port === '' ? address : address + ':' + port);
      if (process != undefined && process.version != undefined) { // node
        const http = require('http');
        http.get(ip, (res) => {
          const { statusCode } = res;
          const contentType = res.headers['content-type'];
          let error;
          if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
          }
          if (error) {
            console.error(error.message);
            res.resume();
            return;
          }
          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            if (statusCode == 200)
              console.log('ok')
          });
        }).on('error', console.log);
      }
    }*/
    return true;
  }
  update (newInitData, silent=false) {
    this.__STORAGE__.methods.storage_update(newInitData);
    if (!silent)
      this.__STORAGE__.methods.subscribersCallingFromRoot();
  }
  set(value=null) {
    this.__STORAGE__.value = value;
    for (let i = 0; i < this.__STORAGE__.subscribers.length;) {
      if (typeof this.__STORAGE__.subscribers[i].callback == 'function') {
        if (this.__STORAGE__.subscribers[i].delayed) {
          setTimeout(() => {
            this.__STORAGE__.subscribers[i].callback(this.__STORAGE__.value);
          }, 0);
        } else {
          this.__STORAGE__.subscribers[i].callback(this.__STORAGE__.value);
        }
        i++;
      } else {
        this.__STORAGE__.subscribers.splice(i, 1);
      }
    }
    if (this.__STORAGE__.parent) {
      this.__STORAGE__.parent.__STORAGE__.methods.subscribersCallingToRoot();
    }
    return true;
  }
  get () {
    return this.__STORAGE__.value;
  }
  subscribe (callback, delayed=false, dontTestForDoubles=false) {
    let dontPush = false;
    if (!dontTestForDoubles) {
      for (let i = 0; i < this.__STORAGE__.subscribers.length; i++) {
        if (this.__STORAGE__.subscribers[i] === callback) {
          dontPush = true;
          break;
        }
      }
    }
    if (!dontPush)
      this.__STORAGE__.subscribers.push({delayed, callback});
    return this.__STORAGE__.value;
  }
  sub(callback, delayed, dontTestForDoubles) {return this.subscribe(callback, delayed, dontTestForDoubles)}
  unsubscribe (callbackToUnsub) {
    for (let i = 0; i < this.__STORAGE__.subscribers.length; i++) {
      if (this.__STORAGE__.subscribers[i].callback === callbackToUnsub) {
        this.__STORAGE__.subscribers.splice(i, 1);
        break;
      }
    }
    return this.__STORAGE__.value;
  }
  unsub(callbackToUnsub) {return this.unsubscribe(callbackToUnsub)}
  add (childrenName, defaultValue, ) {
    if (childrenName == '__STORAGE__') {
      throw `Resticted name '${childrenName}'`
    } else {
      this[childrenName] = new Storage(null, defaultValue, this);
      return true;
    }
  }
  enableTimeTravelling (limit=100) {
    this.__STORAGE__.timeTravelling = {};
    this.__STORAGE__.timeTravelling.frames = [this.clone()];
    this.__STORAGE__.timeTravelling.position = 0;
    this.subscribe(() => {
      while (this.__STORAGE__.timeTravelling.position > 0) {
        this.__STORAGE__.timeTravelling.frames.shift();
        this.__STORAGE__.timeTravelling.position--;
      }
      if (this.__STORAGE__.timeTravelling.frames.length < limit)
        this.__STORAGE__.timeTravelling.frames.unshift(this.clone());
    });
  }
  goBack(toEnd=false) {
    if (this.__STORAGE__.timeTravelling != undefined) {
      if (this.__STORAGE__.timeTravelling.position < this.__STORAGE__.timeTravelling.frames.length - 1) {
        if (toEnd) {
          this.__STORAGE__.timeTravelling.position = this.__STORAGE__.timeTravelling.frames.length - 1;
        } else {
          this.__STORAGE__.timeTravelling.position++;
        }
        this.update(this.__STORAGE__.timeTravelling.frames[this.__STORAGE__.timeTravelling.position], true);
      }
    }
  }
  goForward(toBegin=false) {
    if (this.__STORAGE__.timeTravelling != undefined) {
      if (this.__STORAGE__.timeTravelling.position > 0) {
        if (toBegin) {
          this.__STORAGE__.timeTravelling.position = 0;
        } else {
          this.__STORAGE__.timeTravelling.position--;
        }
        this.update(this.__STORAGE__.timeTravelling.frames[this.__STORAGE__.timeTravelling.position], true);
      }
    }
  }
  clone (withSubscribers=true, parent=false) {
    const result = new Storage(null, undefined, parent);
    if (withSubscribers)
      result.__STORAGE__.subscribers = [...this.__STORAGE__.subscribers];
    if (this.__STORAGE__.value)
      result.__STORAGE__.value = this.__STORAGE__.value;
    if (parent) {
      result.__STORAGE__parent = parent;
    }
    for (let i in this) {
      if (i != '__STORAGE__') {
        result[i] = this[i].clone(withSubscribers, result);
      }
    }
    return result;
  }
}