import React from "react";
import darkmodelogo from "../assets/rememberprompts_dark_mode.svg";
import logo from "../assets/rememberprompts.svg";

const Footer = ({ mode }) => (
  <footer className="bg-gray-100 dark:bg-gray-800 p-3 text-center">
    <div className="mb-3 app-logo" />
    <strong className="text-gray-900 dark:text-black-100">
      Have questions? Contact us at overflowprompts@gmail.com. Overflow Prompts is a member of Remember Prompts LLC.
    </strong>
    <darkmodelogo className="mb-3 app-logo" src={darkmodelogo} alt="React logo" width="120" />
    {mode === 'dark' ? (
      <img className="mb-3 app-logo" src={darkmodelogo} alt="React logo" width="120" />
    ) : (
      <img className="mb-3 app-logo" src={logo} alt="React logo" width="120" />
    )}
  </footer>
);

export default Footer;
