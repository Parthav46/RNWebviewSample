const nativeHelperJS = `
class NativeHelper {
    constructor() {
        this.events = {};
    }

    generateTimeBasedHash() {
        const timePart = Date.now().toString(36); // Convert current timestamp to base-36
        const randomPart = Math.random().toString(36)[2, 8]; // Generate random string
        return \`\${timePart}\${randomPart}\`;
    }

    createEventPromise() {
        let resolve,reject;
        let promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return {
            promise: promise,
            resolve: resolve,
            reject: reject
        };
    }

    async trigger(func, ...params) {
        if (typeof(window.ReactNativeWebView) === 'undefined') {
            throw new Error('ReactNativeWebView is undefined.');
        }
        
        let callHash = this.generateTimeBasedHash();
        let event = this.createEventPromise();
        this.events[callHash] = event;
        
        // Trigger native function in a separate thread
        setTimeout(() => {
            let data = {
                hash: callHash,
                functionName: func,
                params: params
            };

            // Post the message to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
        },0);
        
        let error = null;
        let responseData = null;
        try {
            responseData = await event.promise;
        } catch (err) {
            error = err;
        } finally {
            delete this.events[callHash];
        }
        if (error && error != null) {
            throw err;
        }

        return responseData;
    }

    triggerBack(callHash, data, error) {
        if (this.events.hasOwnProperty(callHash)) {
            if (error && error !== '') {
                this.events[callHash].reject(error);
            } else {
                let jsonData;

                try {
                    jsonData = typeof data === 'string' && data !== 'undefined' ? JSON.parse(data) : data;
                } catch (e) {
                    console.error('Failed to parse data:', e);
                    jsonData = data; // Fallback to raw data
                }

                this.events[callHash].resolve(jsonData);
            }
            delete this.events[callHash];
        }
    }
}

const webviewHelper = new NativeHelper();
`;

export default nativeHelperJS;