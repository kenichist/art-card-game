import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'; // Assuming you have this

const Header = () => {
  const { t } = useTranslation();

  return (
    <header>
      {/* Navbar height is approx 56px, used in GalleryScreen style calc */}
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">{t('appName')}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">{t('navHome')}</Nav.Link>
              <Nav.Link as={Link} to="/items">{t('navItems')}</Nav.Link>
              <Nav.Link as={Link} to="/collectors">{t('navCollectors')}</Nav.Link>
              <Nav.Link as={Link} to="/auction">{t('navAuction')}</Nav.Link>
              {/* Gallery link removed */}
            </Nav>
            <Nav className="ms-auto align-items-center">
              <Button as={Link} to="/upload" variant="outline-light" className="me-2">
                {t('navUpload')}
              </Button>
              <LanguageSwitcher />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;