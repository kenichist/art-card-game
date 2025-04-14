import React from 'react';
import { Navbar, Nav, Container, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header>
      {/* Fantasy Banner Image */}
      <div className="fantasy-banner">
        <div className="banner-overlay">
          <h1 className="banner-title">{t('appName')}</h1>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="fantasy-navbar">
        <Container fluid className="px-4">
          <div className="d-flex justify-content-between w-100 align-items-center">
            <div className="navbar-section">
              <Navbar.Brand as={Link} to="/" className="navbar-brand-fantasy">{t('appName')}</Navbar.Brand>
            </div>
            
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto">
                <Nav.Link as={Link} to="/">{t('navHome')}</Nav.Link>
                <Nav.Link as={Link} to="/items">{t('navItems')}</Nav.Link>
                <Nav.Link as={Link} to="/collectors">{t('navCollectors')}</Nav.Link>
                <Nav.Link as={Link} to="/auction">{t('navAuction')}</Nav.Link>
                <Nav.Link as={Link} to="/customization">{t('navCustomization') || 'Customize Cards'}</Nav.Link>
              </Nav>
            </Navbar.Collapse>
            
            <div className="navbar-section">
              <Nav className="align-items-center">
                <Button as={Link} to="/upload" variant="outline-light" className="me-2 fantasy-btn">
                  {t('navUpload')}
                </Button>
                <LanguageSwitcher />
              </Nav>
            </div>
          </div>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;