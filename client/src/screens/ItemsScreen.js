// --- START OF FILE ItemsScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const ItemsScreen = () => {
  const { t } = useTranslation(); // Get the translation function
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
        setItems(data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Use t() for loading and error messages
  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;

  return (
    <Container>
      {/* Use t() for title */}
      <h1 className="my-4">{t('itemCardsTitle')}</h1>

      <Row>
        {currentItems.map(item => (
          <Col key={item._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={item.image}
                alt={item.name} // Alt text
                style={{ height: '200px', objectFit: 'contain' }}
              />
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>
                  {/* Use t() for description count */}
                  {t('descriptionCount', { count: item.descriptions.length })}
                </Card.Text>
                <Button
                  as={Link}
                  to={`/items/${item.id}`}
                  variant="primary"
                >
                  {/* Use t() for button text */}
                  {t('viewDetails')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      <Row className="mt-4">
        <Col className="d-flex justify-content-center">
          <Pagination>
            {[...Array(Math.ceil(items.length / itemsPerPage)).keys()].map(number => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPage}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};

export default ItemsScreen;
// --- END OF FILE ItemsScreen.js ---