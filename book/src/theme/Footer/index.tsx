import React from 'react';
import Footer from '@theme-original/Footer';
import CustomFooter from '../../components/CustomFooter/CustomFooter';

export default function FooterWrapper(props) {
  return (
    <>
      <CustomFooter />
      <Footer {...props} />
    </>
  );
}