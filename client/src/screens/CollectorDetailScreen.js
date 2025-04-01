import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const CollectorDetailScreen = () => {
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

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h3>Error: {error}</h3>;
  if (!collector) return <h3>Collector not found</h3>;

  return (
    <Container>
      <Link to="/collectors" className="btn btn-light my-3">
        Go Back
      </Link>
      
      <Row>
        <Col md={6}>
          <Card>
            <Card.Img 
              src={collector.image} 
              alt={collector.name} 
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
              <Card.Text as="h4">Collector ID: {collector.id}</Card.Text>
              
              <ListGroup variant="flush" className="mt-4">
                <ListGroup.Item>
                  <h4>Descriptions:</h4>
                  {collector.descriptions.length > 0 ? (
                    <ListGroup variant="flush">
                      {collector.descriptions.map((desc, index) => (
                        <ListGroup.Item key={index}>
                          <strong>{desc.attribute}:</strong> {desc.value}w
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p>No descriptions available</p>
                  )}
                </ListGroup.Item>
              </ListGroup>
              
              <Button 
                as={Link} 
                to="/auction" 
                variant="primary" 
                className="mt-4"
                block
              >
                Use in Auction
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CollectorDetailScreen;
