import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap'; // Removed Image import as it wasn't used
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-gray-800 text-white shadow-md">
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="fantasy-navbar" sticky='top'>
        <Container>
          <Navbar.Brand as={Link} to="/" className="navbar-brand-fantasy">{t('appName')}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link as={Link} to="/">{t('navHome')}</Nav.Link>
              <Nav.Link as={Link} to="/items">{t('navItems')}</Nav.Link>
              <Nav.Link as={Link} to="/collectors">{t('navCollectors')}</Nav.Link>
              <Nav.Link as={Link} to="/auction">{t('navAuction')}</Nav.Link>
              <Nav.Link as={Link} to="/customization">{t('navCustomization') || 'Customize Cards'}</Nav.Link>
            </Nav>
            <Nav className="align-items-center">
              <LanguageSwitcher />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;