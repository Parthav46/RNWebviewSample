import { RefObject } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { Inject } from './sampleclass';
import nativeHelperJS from './assets/NativeHelper';

export class Helper {
    private webviewRef;
    private instance;

    constructor(ref: RefObject<WebView>) {
        this.webviewRef = ref;
        this.instance = new Inject();
    }

    async init() {
        try {
            // Read the NativeHelper.js file as a string
            const helperJs = nativeHelperJS;
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
            if (eventData.functionName in this.instance && typeof (this.instance[eventData.functionName as keyof Inject]) === 'function') {
                let fn = this.instance[eventData.functionName as keyof Inject] as Function;
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

