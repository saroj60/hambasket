import React from "react";

const Footer = () => {
  return (
    <footer style={{ 
      background: "#333", 
      color: "#fff", 
      textAlign: "center", 
      padding: "15px", 
      marginTop: "20px" 
    }}>
      <p>&copy; {new Date().getFullYear()} My E-Commerce Store</p>
      <p>All rights reserved.</p>
    </footer>
  );
};

export default Footer;
