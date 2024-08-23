import React, { Fragment } from "react";
import Hero from "../components/Hero";
import Content from "../components/Content";

const Home = ({ mode }) => (
  <Fragment>
    <Hero mode={mode} />
    <hr />
    <Content mode={mode} />
    <hr />
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <h2>Beta Test Overflow Prompts</h2>
      <p>Help us improve Overflow Prompts by testing our platform. Report prompts, receive community solutions, and influence AI updates to potentially fix the issue you've reported. Share your feedback once done below.</p>
      <a href="https://forms.gle/ZenT7RtnNM1mCDzL9" target="_blank" rel="noopener noreferrer">
        <button style={{ padding: "10px 20px", fontSize: "16px" }}>
          Provide Feedback
        </button>
      </a>
    </div>
  </Fragment>
);

export default Home;
