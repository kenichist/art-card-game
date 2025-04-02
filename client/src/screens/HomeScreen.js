// --- START OF FILE HomeScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const HomeScreen = () => {
  const { t } = useTranslation(); // Get the translation function
  const [items, setItems] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const itemsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
        setItems(itemsRes.data.slice(0, 3));
        const collectorsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
        setCollectors(collectorsRes.data.slice(0, 3));
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use t() for loading and error messages
  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;

  return (
    <Container>
      <div className="text-center my-5">
        {/* Use t() for headings and buttons */}
        <h1>{t('appName')}</h1>
        <p className="lead">{t('tagline')}</p>
        <Button as={Link} to="/auction" variant="primary" size="lg" className="mt-3">
          {t('startAuction')}
        </Button>
      </div>

      <Row className="my-4">
        <Col md={6}>
          <h2>{t('featuredItems')}</h2>
          <Row>
            {items.map(item => (
              <Col key={item._id} md={12} className="mb-3">
                <Card>
                  <Row>
                    <Col md={4}>
                      <Card.Img
                        src={item.image}
                        alt={item.name} // Alt text could also be translated if needed
                        style={{ height: '100px', objectFit: 'contain' }}
                      />
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        {/* Use t() for link text */}
                        <Link to={`/items/${item.id}`}>{t('viewDetails')}</Link>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-3">
             {/* Use t() for button text */}
            <Button as={Link} to="/items" variant="outline-primary">
              {t('viewAllItems')}
            </Button>
          </div>
        </Col>

        <Col md={6}>
          <h2>{t('featuredCollectors')}</h2>
          <Row>
            {collectors.map(collector => (
              <Col key={collector._id} md={12} className="mb-3">
                <Card>
                  <Row>
                    <Col md={4}>
                      <Card.Img
                        src={collector.image}
                        alt={collector.name} // Alt text could also be translated if needed
                        style={{ height: '100px', objectFit: 'contain' }}
                      />
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title>{collector.name}</Card.Title>
                        {/* Use t() for link text */}
                        <Link to={`/collectors/${collector.id}`}>{t('viewDetails')}</Link>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-3">
            {/* Use t() for button text */}
            <Button as={Link} to="/collectors" variant="outline-primary">
              {t('viewAllCollectors')}
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="my-5">
        <Col md={12}>
        <Card bg="light">
            <Card.Body className="text-center">
                <Card.Title as="h3">{t('howItWorks')}</Card.Title>
                {/* Remove the <Card.Text> wrapper */}
                <ol className="text-start" style={{ /* Add margin if needed */ marginTop: '1rem', marginBottom: '1rem' }}>
                    <li>{t('step1')}</li>
                    <li>{t('step2')}</li>
                    <li>{t('step3')}</li>
                    <li>{t('step4')}</li>
                    <li>{t('step5')}</li>
                </ol>
                <Button as={Link} to="/auction" variant="success">
                    {t('startMatchingNow')}
                </Button>
            </Card.Body>
        </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomeScreen;
// --- END OF FILE HomeScreen.js ---