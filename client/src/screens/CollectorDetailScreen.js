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

  // Helper function to get collector type from ID range instead of file prefix
  const getCollectorType = (imageUrl) => {
    if (!imageUrl) return t('unknownCollector');
    
    // Extract filename and ID from the path
    const filename = imageUrl.split('/').pop();
    const id = parseInt(filename.split('.')[0]);
    
    // Determine collector type based on ID range
    if (id >= 1 && id <= 10) {
      return t('illustrationCollector');
    } else if (id >= 11 && id <= 20) {
      return t('productCollector');
    } else if (id >= 21 && id <= 30) {
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

  // Helper function to provide detailed descriptions based on collector type ID range
  const getCollectorTypeDescription = (imageUrl) => {
    // Extract filename and ID from the path
    const filename = imageUrl.split('/').pop();
    const id = parseInt(filename.split('.')[0]);
    
    // Determine collector type description based on ID range
    if (id >= 1 && id <= 10) {
      return t('illustrationCollectorDescription');
    } else if (id >= 11 && id <= 20) {
      return t('productCollectorDescription');
    } else if (id >= 21 && id <= 30) {
      return t('sculptureCollectorDescription');
    }
    
    return t('unknownCollectorDescription');
  };

  // Helper function to get collector number from filename
  const getCollectorNumber = (imageUrl) => {
    if (!imageUrl) return '';
    
    // Extract filename from image URL
    const filename = imageUrl.split('/').pop();
    
    // Extract the number from the filename (e.g., "15.jpg" -> "15")
    const match = filename.match(/(\d+)\.jpg$/i);
    if (match) {
      return match[1];
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