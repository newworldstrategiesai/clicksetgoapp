// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Modal from 'react-modal';

Modal.setAppElement('#__next');

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
