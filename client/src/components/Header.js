import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          {/* Use t() for translation */}
          <Navbar.Brand as={Link} to="/">{t('appName')}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Use t() for translations */}
              <Nav.Link as={Link} to="/">{t('navHome')}</Nav.Link>
              <Nav.Link as={Link} to="/items">{t('navItems')}</Nav.Link>
              <Nav.Link as={Link} to="/collectors">{t('navCollectors')}</Nav.Link>
              <Nav.Link as={Link} to="/auction">{t('navAuction')}</Nav.Link>
            </Nav>
            {/* Adjusted Nav for right alignment */}
            <Nav className="ms-auto align-items-center">
              {/* Use t() for translation */}
              <Button as={Link} to="/upload" variant="outline-light" className="me-2">
                 {t('navUpload')}
              </Button>
              {/* Add the language switcher component */}
              <LanguageSwitcher />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;