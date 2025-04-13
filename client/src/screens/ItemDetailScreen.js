// --- START OF FILE ItemDetailScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getItemById } from '../services/fileSystemService';
import { useLanguage } from '../contexts/LanguageContext';

const ItemDetailScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        // Pass the current language to get language-specific images
        const data = await getItemById(id, language);
        setItem(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, language]); // Re-fetch when language or id changes

  const handleUseInAuction = () => {
    // Create an auction with this item
    navigate('/auction', { state: { itemId: id } });
  };

  // Helper function to determine item type from item ID
  const getItemType = (itemId) => {
    // Convert to number if it's a string
    const id = Number(itemId);
    
    // Items 1-24 are illustrations
    if (id >= 1 && id <= 24) {
      return 'Illustration Item';
    }
    // Items 25-48 are sculptures
    else if (id >= 25 && id <= 48) {
      return 'Sculpture Item';
    }
    // Items 49-72 are products
    else if (id >= 49 && id <= 72) {
      return 'Product Item';
    }
    
    return 'Unknown Item Type';
  };

  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;
  if (!item) return <h3>{t('notFound', { type: t('Item') })}</h3>;

  return (
    <Container>
      <Link to="/items" className="btn btn-light my-3">
        {t('goBack')}
      </Link>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Img
              src={item.image}
              alt={item.name}
              className="p-3"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h2">{item.name}</Card.Title>
              <Card.Text as="h4">{t('itemId', { id: item.id })}</Card.Text>

              <ListGroup variant="flush" className="mt-4">
                <ListGroup.Item>
                  <h4>{t('itemType')}</h4>
                  <p>{getItemType(item.id)}</p>
                </ListGroup.Item>

                <ListGroup.Item>
                  <h4>{t('itemDescription')}</h4>
                  <p>{getItemTypeDescription(item.id)}</p>
                </ListGroup.Item>
              </ListGroup>

              <Button
                onClick={handleUseInAuction}
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

// Helper function to provide detailed descriptions based on item type
const getItemTypeDescription = (itemId) => {
  const id = Number(itemId);
  
  if (id >= 1 && id <= 24) {
    return 'An illustration item depicting artistic elements with detailed craftsmanship. These items are highly valued by illustration collectors.';
  }
  else if (id >= 25 && id <= 48) {
    return 'A sculptural piece showcasing three-dimensional artistry. These items are particularly sought after by sculpture enthusiasts.';
  }
  else if (id >= 49 && id <= 72) {
    return 'A manufactured product with practical applications. These items are especially valuable to product collectors.';
  }
  
  return 'A mysterious item with unknown origins.';
};

export default ItemDetailScreen;
// --- END OF FILE ItemDetailScreen.js ---