import React from "react";
import logo from "../assets/rememberprompts.svg";
import darkmodelogo from "../assets/rememberprompts_dark_mode.svg";
import Video from "./DriveVideoEmbed";

// Assuming `mode` is passed as a prop to the Hero component
const Hero = ({ mode }) => (
  <div className="text-center hero my-5">
    {mode === 'dark' ? (
      <img className="mb-3 app-logo" src={darkmodelogo} alt="React logo" width="120" />
    ) : (
      <img className="mb-3 app-logo" src={logo} alt="React logo" width="120" />
    )}
    <h1 className="mb-4">Remember Prompts</h1>
    <p className="lead">
      Community Driven AI Accountability, watch an overview about Remember Prompts below, and register or login to get started!
    </p>
    <Video videoId="1AaVt0ucVoPe3UateyK2l23NjVcg2Lg8B"/>
  </div>
);

export default Hero;
