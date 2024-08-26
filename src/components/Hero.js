import React from "react";
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
    <h1 className="mb-4">Overflow Prompts</h1>
    <p className="lead">
      Community Driven AI Accountability. Watch an overview about Overflow Prompts below, and register or login to get started! Authentication for this application is powered by <a href="https://auth0.com/resources/webinars/demo-consumer-facing-applications?utm_source=google&utm_campaign=amer_namer_usa_all_ciam-all_dg-ao_auth0_search_google_text_kw_DSA_utm2&utm_medium=cpc&utm_id=aNK4z000000UCSHGA4&gad_source=1&gclid=CjwKCAjw5qC2BhB8EiwAvqa41jv5p2UHsbIBqX-PyXJLNzV6RM7yYzw_ztnn2EX8HXhtYy4jWFDNKxoCY8wQAvD_BwE">Auth0</a>.
    </p>
    <p className="lead">
      <strong>Why participate?</strong> <br></br>By reporting, upvoting, and commenting on prompts, you play a key role in improving AI for everyone. 
      Reporting prompts helps uncover issues and drive improvements directly to AI companies AND most importantly gives visibility to AI companies to fix the issues (if deemed an issue from their perspective) you report! Upvoting highlights the most critical issues, ensuring they get the attention they deserve. 
      Commenting allows you to share insights, suggest solutions, and collaborate with a community of like-minded individuals. Plus, as an active contributor, you'll gain early access to new features and tools, and earn recognition within the community!
    </p>
  </div>
);

export default Hero;
