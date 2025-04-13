// --- START OF FILE HomeScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import FadeInOnScroll from '../components/FadeInOnScroll';
import { getItems, getCollectors } from '../services/fileSystemService';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use our language-aware service functions instead of axios directly
        const itemsData = await getItems(language);
        setItems(itemsData.slice(0, 3));
        
        const collectorsData = await getCollectors(language);
        setCollectors(collectorsData.slice(0, 3));
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [language]); // Re-fetch when language changes

  // Use t() for loading and error messages
  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;

  return (
    <Container>
      <FadeInOnScroll>
        <div className="hero-content">
          <h1>{t('appName')}</h1>
          <p className="lead">{t('tagline')}</p>
          <Button as={Link} to="/auction" variant="primary" size="lg" className="mt-4">
            {t('startAuction')}
          </Button>
        </div>
      </FadeInOnScroll>

      <Row className="my-5">
        <Col md={6}>
          <FadeInOnScroll>
            <h2 className="page-heading">{t('featuredItems')}</h2>
            <Row>
              {items.map(item => (
                <Col key={item._id || item.id} md={12} className="mb-3">
                  <FadeInOnScroll>
                    <Card className="h-100 item-card">
                      <Row>
                        <Col md={4} className="d-flex align-items-center">
                          <Card.Img
                            src={item.image}
                            alt={item.name}
                            style={{ height: '120px', objectFit: 'contain', padding: '0.5rem' }}
                          />
                        </Col>
                        <Col md={8}>
                          <Card.Body>
                            <Card.Title>{item.name}</Card.Title>
                            <Link to={`/items/${item.id}`} className="btn btn-secondary btn-sm">
                              {t('viewDetails')}
                            </Link>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  </FadeInOnScroll>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-4">
              <Button as={Link} to="/items" variant="secondary">
                {t('viewAllItems')}
              </Button>
            </div>
          </FadeInOnScroll>
        </Col>

        <Col md={6}>
          <FadeInOnScroll>
            <h2 className="page-heading">{t('featuredCollectors')}</h2>
            <Row>
              {collectors.map(collector => (
                <Col key={collector._id || collector.id} md={12} className="mb-3">
                  <FadeInOnScroll>
                    <Card className="h-100 collector-card">
                      <Row>
                        <Col md={4} className="d-flex align-items-center">
                          <Card.Img
                            src={collector.image}
                            alt={collector.name}
                            style={{ height: '120px', objectFit: 'contain', padding: '0.5rem' }}
                          />
                        </Col>
                        <Col md={8}>
                          <Card.Body>
                            <Card.Title>{collector.name}</Card.Title>
                            <Link to={`/collectors/${collector.id}`} className="btn btn-secondary btn-sm">
                              {t('viewDetails')}
                            </Link>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  </FadeInOnScroll>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-4">
              <Button as={Link} to="/collectors" variant="secondary">
                {t('viewAllCollectors')}
              </Button>
            </div>
          </FadeInOnScroll>
        </Col>
      </Row>

      <FadeInOnScroll>
        <Row className="my-5">
          <Col md={12}>
            <Card bg="dark" className="how-it-works">
              <Card.Body className="text-center">
                <Card.Title as="h3" className="page-heading mb-4">{t('howItWorks')}</Card.Title>
                <ol className="text-start instruction-list">
                  <li>{t('step1')}</li>
                  <li>{t('step2')}</li>
                  <li>{t('step3')}</li>
                  <li>{t('step4')}</li>
                  <li>{t('step5')}</li>
                </ol>
                <Button as={Link} to="/auction" variant="primary" size="lg" className="mt-4">
                  {t('startMatchingNow')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </FadeInOnScroll>
    </Container>
  );
};

export default HomeScreen;
// --- END OF FILE HomeScreen.js ---