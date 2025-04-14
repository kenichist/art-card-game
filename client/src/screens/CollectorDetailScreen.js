// --- START OF FILE CollectorDetailScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCollectorById } from '../services/fileSystemService';
import { useLanguage } from '../contexts/LanguageContext';

const CollectorDetailScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [collector, setCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCollector = async () => {
      try {
        setLoading(true);
        // Pass the current language to get language-specific images
        const data = await getCollectorById(id, language);
        setCollector(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchCollector();
  }, [id, language]); // Re-fetch when language or id changes

  // Helper function to get collector type from image filename
  const getCollectorType = (imageUrl) => {
    // Extract filename from image URL
    const filename = imageUrl.split('/').pop();
    
    // Get appropriate translation based on collector type prefix
    if (filename.startsWith('i')) {
      return t('illustrationCollector');
    } else if (filename.startsWith('p')) {
      return t('productCollector');
    } else if (filename.startsWith('s')) {
      return t('sculptureCollector');
    }
    
    return t('unknownCollector');
  };
  
  // Helper function to create a properly translated collector name
  const getTranslatedCollectorName = (collector) => {
    if (!collector || !collector.image) return '';
    
    const type = getCollectorType(collector.image);
    const number = getCollectorNumber(collector.image);
    
    // Return a formatted string with the translated type and original collector number
    return `${type} ${number}`;
  };

  // Helper function to provide detailed descriptions based on collector type
  const getCollectorTypeDescription = (imageUrl) => {
    const filename = imageUrl.split('/').pop();
    
    if (filename.startsWith('i')) {
      return t('illustrationCollectorDescription');
    } else if (filename.startsWith('p')) {
      return t('productCollectorDescription');
    } else if (filename.startsWith('s')) {
      return t('sculptureCollectorDescription');
    }
    
    return t('unknownCollectorDescription');
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
            <Row>
              <Col md={6}>
                <Card.Img 
                  variant="top" 
                  src={collector.image} 
                  alt={collector.name} 
                  className="collector-detail-img" 
                />
              </Col>
              <Col md={6}>
                <Card.Body>
                  <Card.Title className="collector-title">{collector.name}</Card.Title>
                  <Card.Text>
                    {collector.description || t('collectorDescription')}
                  </Card.Text>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h2">{getTranslatedCollectorName(collector)}</Card.Title>
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