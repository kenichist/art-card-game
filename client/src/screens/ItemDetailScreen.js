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
    
    if (id >= 1 && id <= 24) {
      return t('illustrationItem');
    } else if (id >= 25 && id <= 48) {
      return t('sculptureItem');
    } else if (id >= 49 && id <= 72) {
      return t('productItem');
    } else {
      return t('unknownItem');
    }
  };
  
  // Helper function to create a properly translated item name
  const getTranslatedItemName = (item) => {
    if (!item) return '';
    
    const id = Number(item.id);
    const type = getItemType(id);
    
    // Return a formatted string with the translated type and the original item number
    return `${type} ${id}`;
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
            <Row>
              <Col md={12}>
                <Card.Img 
                  variant="top" 
                  src={item.image} 
                  alt={item.name} 
                  className="item-detail-img" 
                  style={{ width: '100%', height: 'auto', maxWidth: '606px', maxHeight: '405px', objectFit: 'contain' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h2">{getTranslatedItemName(item)}</Card.Title>
              <Card.Text as="h4">{t('itemId', { id: item.id })}</Card.Text>

              <ListGroup variant="flush" className="mt-4">
                <ListGroup.Item>
                  <h4>{t('itemType')}</h4>
                  <p>{getItemType(item.id)}</p>
                </ListGroup.Item>

                <ListGroup.Item>
                  <h4>{t('itemDescription')}</h4>
                  <p>{item.description || t('noDescriptionAvailable')}</p>
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

export default ItemDetailScreen;
// --- END OF FILE ItemDetailScreen.js ---