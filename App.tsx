/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import WebView from 'react-native-webview';
import { Helper } from 'react-native-webview-script-inject/src/Helper';
import { Inject } from 'react-native-webview-script-inject/src/sampleclass';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';


function App(): React.JSX.Element {
  const webViewRef = useRef<WebView>(null);
  const webviewHelper = new Helper<Inject>(webViewRef, new Inject());
  const isDarkMode = useColorScheme() === 'dark';

  const styles = StyleSheet.create({
    main: {
      flex: 1,
    },
    backgroundStyle: {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={styles.backgroundStyle.backgroundColor}
      />
      <WebView
        ref={webViewRef}
        source={{
          uri: 'https://parthav.in',
        }}
        style={styles.main}
        onMessage={async (event) => await webviewHelper.handleMessage(event)}
        onLoadEnd={async () => await webviewHelper.init()}/>
    </SafeAreaView>
  );
}

export default App;
