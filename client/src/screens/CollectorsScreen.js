// --- START OF FILE CollectorsScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const CollectorsScreen = () => {
  const { t } = useTranslation(); // Get translation function
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [collectorsPerPage] = useState(12);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
        setCollectors(data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    fetchCollectors();
  }, []);

  const indexOfLastCollector = currentPage * collectorsPerPage;
  const indexOfFirstCollector = indexOfLastCollector - collectorsPerPage;
  const currentCollectors = collectors.slice(indexOfFirstCollector, indexOfLastCollector);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Use t() for loading and error messages
  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;

  return (
    <Container>
      {/* Use t() for title */}
      <h1 className="my-4">{t('collectorCardsTitle')}</h1>

      <Row>
        {currentCollectors.map(collector => (
          <Col key={collector._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={collector.image}
                alt={collector.name} // Alt text
                style={{ height: '200px', objectFit: 'contain' }}
              />
              <Card.Body>
                <Card.Title>{collector.name}</Card.Title>
                <Card.Text>
                  {/* Use t() for description count */}
                   {t('descriptionCount', { count: collector.descriptions.length })}
                </Card.Text>
                <Button
                  as={Link}
                  to={`/collectors/${collector.id}`}
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
            {[...Array(Math.ceil(collectors.length / collectorsPerPage)).keys()].map(number => (
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

export default CollectorsScreen;
// --- END OF FILE CollectorsScreen.js ---