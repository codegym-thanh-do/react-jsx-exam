import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// MainLayout: Common layout for all pages
function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default MainLayout;
