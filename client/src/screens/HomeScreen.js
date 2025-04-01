// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const HomeScreen = () => {
  const { t, i18n } = useTranslation(); // Get t and i18n
  const [items, setItems] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... (useEffect remains the same)

  if (loading) return <h2>{t('loading')}</h2>; // Use t()
  if (error) return <h3>{t('error', { message: error })}</h3>; // Use t() with interpolation

  return (
    <Container>
      <div className="text-center my-5">
        <h1>{t('appName')}</h1> {/* Use t() */}
        <p className="lead">{t('tagline')}</p> {/* Use t() */}
        <Button as={Link} to="/auction" variant="primary" size="lg" className="mt-3">
          {t('startAuction')} {/* Use t() */}
        </Button>
      </div>

      <Row className="my-4">
        <Col md={6}>
          <h2>{t('featuredItems')}</h2> {/* Use t() */}
          <Row>
            {items.map(item => (
              <Col key={item._id} md={12} className="mb-3">
                <Card>
                  <Row>
                    <Col md={4}>
                      <Card.Img
                        src={item.image}
                        alt={item.name} // Keep alt text for now, or add translations if needed
                        style={{ height: '100px', objectFit: 'contain' }}
                      />
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Link to={`/items/${item.id}`}>{t('viewDetails')}</Link> {/* Use t() */}
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-3">
            <Button as={Link} to="/items" variant="outline-primary">
              {t('viewAllItems')} {/* Use t() */}
            </Button>
          </div>
        </Col>

        <Col md={6}>
          <h2>{t('featuredCollectors')}</h2> {/* Use t() */}
          <Row>
             {collectors.map(collector => (
              <Col key={collector._id} md={12} className="mb-3">
                <Card>
                  <Row>
                    <Col md={4}>
                      <Card.Img
                        src={collector.image}
                        alt={collector.name} // Keep alt text for now, or add translations if needed
                        style={{ height: '100px', objectFit: 'contain' }}
                      />
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title>{collector.name}</Card.Title>
                         <Link to={`/collectors/${collector.id}`}>{t('viewDetails')}</Link> {/* Use t() */}
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-3">
             <Button as={Link} to="/collectors" variant="outline-primary">
               {t('viewAllCollectors')} {/* Use t() */}
             </Button>
          </div>
        </Col>
      </Row>

      <Row className="my-5">
        <Col md={12}>
          <Card bg="light">
            <Card.Body className="text-center">
              <Card.Title as="h3">{t('howItWorks')}</Card.Title> {/* Use t() */}
              <Card.Text>
                <ol className="text-start">
                   <li>{t('step1')}</li> {/* Use t() */}
                   <li>{t('step2')}</li> {/* Use t() */}
                   <li>{t('step3')}</li> {/* Use t() */}
                   <li>{t('step4')}</li> {/* Use t() */}
                   {/* Note: Step 5 is missing from the original HTML, added here based on logic */}
                   <li>{t('step5')}</li> {/* Use t() */}
                </ol>
              </Card.Text>
              <Button as={Link} to="/auction" variant="success">
                 {t('startMatchingNow')} {/* Use t() */}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomeScreen;