// --- START OF FILE Footer.js ---

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Footer = () => {
  const { t } = useTranslation(); // Get t function
  const currentYear = new Date().getFullYear(); // Get current year

  return (
    <footer>
      <Container>
        <Row>
          <Col className="text-center py-3">
            {/* Use t() with interpolation for the year */}
            {t('copyright', { year: currentYear })}
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
// --- END OF FILE Footer.js ---