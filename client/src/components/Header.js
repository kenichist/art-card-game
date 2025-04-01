// --- START OF FILE Header.js ---

import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import LanguageSwitcher from './LanguageSwitcher'; // Import the switcher (assuming it's in ./components)

const Header = () => {
  const { t } = useTranslation(); // Get the translation function

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          {/* Use t() for app name */}
          <Navbar.Brand as={Link} to="/">{t('appName')}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Use t() for nav links */}
              <Nav.Link as={Link} to="/">{t('navHome')}</Nav.Link>
              <Nav.Link as={Link} to="/items">{t('navItems')}</Nav.Link>
              <Nav.Link as={Link} to="/collectors">{t('navCollectors')}</Nav.Link>
              <Nav.Link as={Link} to="/auction">{t('navAuction')}</Nav.Link>
            </Nav>
            {/* Align items to the right and center vertically */}
            <Nav className="ms-auto align-items-center">
              {/* Use t() for button text */}
              <Button as={Link} to="/upload" variant="outline-light" className="me-2">
                {t('navUpload')}
              </Button>
              {/* Add the language switcher */}
              <LanguageSwitcher />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
// --- END OF FILE Header.js ---