import { RefObject } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import nativeHelperJS from './assets/NativeHelper';

export class Helper<T> {
    private webviewRef: RefObject<WebView>;
    private instance: T;

    constructor(ref: RefObject<WebView>, instance: T) {
        this.webviewRef = ref;
        this.instance = instance;
    }

    async init() {
        try {
            // Form the wrapper functions for Inject class
            const functionNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this.instance))
            .filter(fn => fn !== 'constructor'); // Get the function names from the Inject class prototype

            let functionWrappers = functionNames.map(fnName => `
                webviewHelper.${fnName} = async function(...args) {
                    result = await webviewHelper.trigger('${fnName}', ...args);
                    if (typeof result === 'string' && result === 'undefined') {
                        return;
                    }
                    return result;
                };
            `).join('\n');

            // Read the NativeHelper.js file as a string
            const helperJs = `${nativeHelperJS}\n${functionWrappers}`;

            // Inject the loaded JavaScript into the WebView
            this.webviewRef.current?.injectJavaScript(helperJs);
        } catch (error) {
            console.error('Failed to load JS file', error);
        }
    }

    private triggerBack(callHash: string, data: any, error: string = ''): void {
        let jsCode = `webviewHelper.triggerBack('${callHash}', '${JSON.stringify(data)}', '${error}');`;
        this.webviewRef.current?.injectJavaScript(jsCode);
    }

    async handleMessage(event: WebViewMessageEvent): Promise<void> {
        let eventData = JSON.parse(event.nativeEvent.data);
        let response;
        try {
            if (eventData.functionName in this.instance && typeof (this.instance[eventData.functionName as keyof T]) === 'function') {
                let fn = this.instance[eventData.functionName as keyof T] as Function;
                let result = fn(...eventData.params);

                if (result instanceof Promise) {
                    response = await result;
                } else {
                    response = result;
                }
            }
        } catch (err) {
            this.triggerBack(eventData.hash, null, JSON.stringify(err));
            return;
        }
        this.triggerBack(eventData.hash, response);
    }
}

