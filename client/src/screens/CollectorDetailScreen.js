// --- START OF FILE CollectorDetailScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const CollectorDetailScreen = () => {
  const { t } = useTranslation(); // Get translation function
  const [collector, setCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCollector = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors/${id}`);
        setCollector(data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    fetchCollector();
  }, [id]);

  // Use t() for loading, error, and not found messages
  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;
  // Use t() for not found message, passing type
  if (!collector) return <h3>{t('notFound', { type: t('Collector') })}</h3>;

  return (
    <Container>
      {/* Use t() for button text */}
      <Link to="/collectors" className="btn btn-light my-3">
        {t('goBack')}
      </Link>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Img
              src={collector.image}
              alt={collector.name} // Alt text
              fluid
              className="p-3"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h2">{collector.name}</Card.Title>
              {/* Use t() for ID text with interpolation */}
              <Card.Text as="h4">{t('collectorId', { id: collector.id })}</Card.Text>

              <ListGroup variant="flush" className="mt-4">
                <ListGroup.Item>
                  {/* Use t() for section title */}
                  <h4>{t('descriptions')}</h4>
                  {collector.descriptions.length > 0 ? (
                    <ListGroup variant="flush">
                      {collector.descriptions.map((desc, index) => (
                        <ListGroup.Item key={index}>
                          <strong>{desc.attribute}:</strong> {desc.value}{t('valueSuffix')}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                     // Use t() for empty state
                    <p>{t('noDescriptions')}</p>
                  )}
                </ListGroup.Item>
              </ListGroup>

              <Button
                as={Link}
                to="/auction"
                variant="primary"
                className="mt-4"
                 // block prop is deprecated in Bootstrap 5
              >
                {/* Use t() for button text */}
                {t('useInAuction')}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CollectorDetailScreen;
// --- END OF FILE CollectorDetailScreen.js ---