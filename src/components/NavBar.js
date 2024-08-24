import React, { useState } from "react";
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

import { useAuth0 } from "@auth0/auth0-react";

const NavBar = ({ mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const toggle = () => setIsOpen(!isOpen);

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  // Determine text color based on mode
  const textColor = mode === "dark" ? "#fff" : "#000";
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
              {isAuthenticated && (
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
              )}
              {/* Call to Action for Beta Testing */}
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
                  Your feedback is crucial in helping us improve Overflow Prompts. By participating, you'll have the opportunity to directly influence future features and ensure the platform meets your needs. Plus, as a beta tester, you'll get early access to new tools and enhancements!
                </p>
              </NavItem>
            </Nav>
            <Nav className="d-none d-md-block" navbar>
              {!isAuthenticated && (
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    className="btn-margin"
                    onClick={() => loginWithRedirect()}
                  >
                    Log in or Register
                  </Button>
                </NavItem>
              )}
              {isAuthenticated && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret id="profileDropDown">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle"
                      width="50"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>{user.name}</DropdownItem>
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
                      onClick={() => logoutWithRedirect()}
                    >
                      <FontAwesomeIcon icon="power-off" className="mr-3" /> Log
                      out
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
            {!isAuthenticated && (
              <Nav className="d-md-none" navbar>
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    block
                    onClick={() => loginWithRedirect({})}
                  >
                    Log in or Register
                  </Button>
                </NavItem>
              </Nav>
            )}
            {isAuthenticated && (
              <Nav
                className="d-md-none justify-content-between"
                navbar
                style={{ minHeight: 170 }}
              >
                <NavItem>
                  <span className="user-info">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile d-inline-block rounded-circle mr-3"
                      width="50"
                    />
                    <h6 className="d-inline-block">{user.name}</h6>
                  </span>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon="user" className="mr-3" />
                  <RouterNavLink
                    to="/profile"
                    activeClassName="router-link-exact-active"
                    style={{ color: textColor }}
                  >
                    Profile
                  </RouterNavLink>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon="power-off" className="mr-3" />
                  <RouterNavLink
                    to="#"
                    id="qsLogoutBtn"
                    onClick={() => logoutWithRedirect()}
                    style={{ color: textColor }}
                  >
                    Log out
                  </RouterNavLink>
                </NavItem>
              </Nav>
            )}
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
