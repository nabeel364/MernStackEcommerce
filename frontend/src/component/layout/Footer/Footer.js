import React from "react";
import playStore from "../../../images/playstore.png";
import appStore from "../../../images/Appstore.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer id="footer">
      <div className="leftFooter">
        <h4>DOWNLOAD OUR APP</h4>
        <p>Download App for Andriod and IOS mobile phone</p>
        <img src={playStore} alt="playStore" />
        <img src={appStore} alt="appStore" />
      </div>

      <div className="midFooter">
        <h1>ECOMMERCE</h1>
        <p>High Quality is Our first Priority</p>

        <p>Copyrights 2022 &copy; NabeelAmjad</p>
      </div>

      <div className="rightFooter">
        <h4>Follow Us</h4>
        <a href="https://www.facebook.com/?_rdc=2&_rdr">Facebook</a>
        <a href="https://www.facebook.com/?_rdc=2&_rdr">Youtube</a>
        <a href="https://www.facebook.com/?_rdc=2&_rdr">Instagram</a>
      </div>
    </footer>
  );
};

export default Footer;
