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
  </Fragment>
);

export default Home;
