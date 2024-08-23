import React, { Fragment } from "react";
import Hero from "../components/Hero";
import Content from "../components/Content";

// Accept mode as a prop
const Home = ({ mode }) => (
  <Fragment>
    {/* Pass mode to Hero and Content as needed */}
    <Hero mode={mode} />
    <hr />
    <Content mode={mode} />
    <hr />
    {/* Call to action for beta testing Overflow Prompts */}
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <h2>Join Our Beta Test!</h2>
      <p>We invite you to be among the first to experience Overflow Prompts. Help us shape the future of prompt management. With each prompt reported, you will have solutions from the community for a better prompt to use and AI companies will update their data models to fix your issue!</p>
      <a href="https://forms.gle/ZenT7RtnNM1mCDzL9" target="_blank" rel="noopener noreferrer">
        <button style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
          Sign Up & Provide Feedback
        </button>
      </a>
    </div>
  </Fragment>
);

export default Home;
