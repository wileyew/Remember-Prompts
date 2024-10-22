import React, { useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import logo from "../assets/rememberprompts.svg";
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";

import { Amplify } from "aws-amplify";
import awsconfig from "../aws-exports";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";

Amplify.configure(awsconfig);

const NavBar = ({ mode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  // Determine text color based on mode
  const textColor = mode === "light" ? "#000" : "#fff";

  // Linear gradient background
  const backgroundImage = "linear-gradient(159deg, #b0e0e6, #4682b4)";

  return (
    <div className="nav-container">
      <Navbar
        style={{
          backgroundImage: backgroundImage,
          color: textColor,
        }}
        light
        expand="md"
        container={false}
      >
        <Container>
          <NavbarBrand>
            <img src={logo} alt="Logo" height="40" />
          </NavbarBrand>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/"
                  exact
                  activeClassName="router-link-exact-active"
                  style={{ color: textColor }}
                >
                  Home
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/remember-prompts"
                  exact
                  activeClassName="router-link-exact-active"
                  style={{ color: textColor }}
                >
                  Create a Report
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/reported-prompts"
                  exact
                  activeClassName="router-link-exact-active"
                  style={{ color: textColor }}
                >
                  Reported Prompts
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/tutorials"
                  exact
                  activeClassName="router-link-exact-active"
                  style={{ color: textColor }}
                >
                  Tutorials
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="https://forms.gle/ZenT7RtnNM1mCDzL9"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: textColor }}
                >
                  Beta Test & Feedback
                </NavLink>
                <p
                  style={{
                    fontSize: "12px",
                    margin: "5px 0 0",
                    color: textColor,
                  }}
                >
                  Your feedback is crucial in helping us improve Overflow Prompts.
                  By participating, you'll give visibility to AI companies to fix the
                  issues you report and earn a certification in AI evangelism!
                </p>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
