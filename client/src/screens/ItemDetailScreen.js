// --- START OF FILE ItemDetailScreen.js ---

import React, { useState, useEffect } from 'react';
// Import Image from react-bootstrap - Although not strictly needed for this fix, it's good practice if you might use it elsewhere
import { Container, Row, Col, Card, ListGroup, Button, Image } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ItemDetailScreen = () => {
  const { t } = useTranslation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/${id}`);
        setItem(data);
        setLoading(false);
      } catch (err) { // Renamed to err to avoid conflict with state variable
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

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
            {/* --- MODIFICATION HERE --- */}
            {/* Removed fluid prop, added 'img-fluid' to className */}
            <Card.Img
              src={item.image}
              alt={item.name}
              className="p-3 img-fluid" // Add 'img-fluid' class here
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
            {/* --- END OF MODIFICATION --- */}
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h2">{item.name}</Card.Title>
              <Card.Text as="h4">{t('itemId', { id: item.id })}</Card.Text>

              <ListGroup variant="flush" className="mt-4">
                <ListGroup.Item>
                  <h4>{t('descriptions')}</h4>
                  {item.descriptions.length > 0 ? (
                    <ListGroup variant="flush">
                      {/* --- MODIFICATION FOR REMOVED VALUE --- */}
                      {item.descriptions.map((desc, index) => (
                        <ListGroup.Item key={index}>
                          {/* Only display the attribute now */}
                          {desc.attribute}
                        </ListGroup.Item>
                      ))}
                      {/* --- END OF MODIFICATION --- */}
                    </ListGroup>
                  ) : (
                    <p>{t('noDescriptions')}</p>
                  )}
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

export default ItemDetailScreen;
// --- END OF FILE ItemDetailScreen.js ---