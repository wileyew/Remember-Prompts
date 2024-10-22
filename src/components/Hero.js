import React from "react";
import Typewriter from "typewriter-effect";
import overflowBlackLogo from "../assets/Black logo - no background.svg";
import overflowlogo from "../assets/Color logo - no background.svg";
import Video from "./DriveVideoEmbed";

// Assuming `mode` is passed as a prop to the Hero component
const Hero = ({ mode }) => (
  <div className="text-center hero my-5">
    {mode === 'dark' ? (
      <img className="mb-3 app-logo" src={overflowBlackLogo} alt="Overflow Prompts logo" width="120" />
    ) : (
      <img className="mb-3 app-logo" src={overflowlogo} alt="Overflow Prompts logo" width="120" />
    )}
    
    <h1 className="mb-4"> An AI Governance Platform to <br></br>
      <Typewriter
        options={{
          strings: ["Provide education on ", "Identify", "Report"],
          autoStart: true,
          loop: true,
          deleteSpeed: 50,
        }} 
      /> AI Issues for Everyone
    </h1>
    
    <p className="lead">
      Community Driven AI Accountability
      Check out our video below to learn more about Overflow Prompts and how you can help improve AI for everyone!
    </p>
    
    <div className="video-container">
    <iframe src="https://drive.google.com/file/d/1f79xMu5kYvZG4X-jjS918pWg1r1Cy_Kd/preview" width="640" height="480" allow="autoplay"></iframe>    </div>
    
    <p className="lead">
      <strong>Why participate?</strong> <br></br>By reporting, up voting, and commenting on prompts, you play a key role in improving AI for everyone. 
      Reporting prompts helps uncover issues and drive improvements directly to AI companies AND most importantly gives visibility to AI companies to fix the issues (if deemed an issue from their perspective) you report! Upvoting highlights the most critical issues, ensuring they get the attention they deserve. 
      Commenting allows you to share insights, suggest solutions, and collaborate with a community of like-minded individuals. Plus, as an active contributor, you'll gain early access to new features and tools, and earn recognition within the community!
    </p>
  </div>
);

export default Hero;
