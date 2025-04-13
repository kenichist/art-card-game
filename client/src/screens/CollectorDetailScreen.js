// --- START OF FILE CollectorDetailScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCollectorById } from '../services/fileSystemService';

const CollectorDetailScreen = () => {
  const { t } = useTranslation();
  const [collector, setCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCollector = async () => {
      try {
        setLoading(true);
        const data = await getCollectorById(id);
        setCollector(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchCollector();
  }, [id]);

  // Helper function to get collector type from image filename
  const getCollectorType = (imageUrl) => {
    // Extract filename from image URL
    const filename = imageUrl.split('/').pop();
    
    // Check if the filename starts with 'i', 'p', or 's'
    if (filename.startsWith('i')) {
      return 'Illustration Collector';
    } else if (filename.startsWith('p')) {
      return 'Product Collector';
    } else if (filename.startsWith('s')) {
      return 'Sculpture Collector';
    }
    
    return 'Collector';
  };

  // Helper function to provide detailed descriptions based on collector type
  const getCollectorTypeDescription = (imageUrl) => {
    const filename = imageUrl.split('/').pop();
    
    if (filename.startsWith('i')) {
      return 'An enthusiast of illustrated works, particularly valuing artistic masterpieces. This collector specializes in acquiring and preserving illustrations of significant cultural or historical importance.';
    }
    else if (filename.startsWith('p')) {
      return 'A product collector with an eye for manufactured items of practical use. This collector appreciates innovative design and functionality in everyday objects.';
    }
    else if (filename.startsWith('s')) {
      return 'A connoisseur of sculptural art forms, focusing on three-dimensional works. This collector values the physical presence and spatial relationships created by sculptural pieces.';
    }
    
    return 'A collector with varied interests across multiple domains.';
  };

  // Helper function to get collector number from filename
  const getCollectorNumber = (imageUrl) => {
    const filename = imageUrl.split('/').pop();
    
    // Example: Extract '1' from 'i1.jpg'
    if (filename.match(/^[ips]\d+\.jpg$/i)) {
      return filename.match(/^[ips](\d+)\.jpg$/i)[1];
    }
    
    return '';
  };

  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;
  if (!collector) return <h3>{t('notFound', { type: t('Collector') })}</h3>;

  return (
    <Container>
      <Link to="/collectors" className="btn btn-light my-3">
        {t('goBack')}
      </Link>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Img
              src={collector.image}
              alt={collector.name}
              className="p-3"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h2">{collector.name}</Card.Title>
              <Card.Text as="h4">{t('collectorId', { id: collector.id })}</Card.Text>

              <ListGroup variant="flush" className="mt-4">
                <ListGroup.Item>
                  <h4>{t('collectorType')}</h4>
                  <p>{getCollectorType(collector.image)}</p>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h4>{t('collectorNumber')}</h4>
                  <p>#{getCollectorNumber(collector.image)}</p>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h4>{t('collectorDescription')}</h4>
                  <p>{getCollectorTypeDescription(collector.image)}</p>
                </ListGroup.Item>
              </ListGroup>

              <Button
                as={Link}
                to="/auction"
                variant="primary"
                className="mt-4"
              >
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