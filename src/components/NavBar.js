import React, { useState, useEffect } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { AmplifyAuthenticator, AmplifySignOut, AmplifySignIn } from '@aws-amplify/ui-react';

Amplify.configure(awsconfig);

const NavBar = ({ mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => {
        setUser(user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const toggle = () => setIsOpen(!isOpen);

  const login = async () => {
    try {
      await Auth.federatedSignIn();
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const logout = async () => {
    try {
      await Auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Determine text color based on mode
  const textColor = mode === "light" ? "#000" : "#000";
  const backgroundColor = mode === "dark" ? "#fff" : "#f8f9fa";

  return (
    <div className="nav-container">
      <Navbar
        style={{ backgroundColor: backgroundColor }}
        color={mode === "dark" ? "light" : "light"}
        light
        expand="md"
        container={false}
      >
        <Container>
          <NavbarBrand src="logo" />
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
               && (
                <>
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
                </>
              )
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
                  Your feedback is crucial in helping us improve Overflow Prompts. By participating, you'll give visibility to AI companies to fix the issues you report and earn a certification in AI evangelism!
                </p>
              </NavItem>
            </Nav>
            <Nav className="d-none d-md-block" navbar>
              {!isAuthenticated ? (
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    className="btn-margin"
                    onClick={login}
                  >
                    Log in or Register
                  </Button>
                </NavItem>
              ) : (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret id="profileDropDown">
                    <img
                      src={user.attributes.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle"
                      width="50"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>{user.username}</DropdownItem>
                    <DropdownItem
                      tag={RouterNavLink}
                      to="/profile"
                      className="dropdown-profile"
                      activeClassName="router-link-exact-active"
                    >
                      <FontAwesomeIcon icon="user" className="mr-3" /> Profile
                    </DropdownItem>
                    <DropdownItem
                      id="qsLogoutBtn"
                      onClick={logout}
                    >
                      <FontAwesomeIcon icon="power-off" className="mr-3" /> Log
                      out
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
