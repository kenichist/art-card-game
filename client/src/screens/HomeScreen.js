import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomeScreen = () => {
  const [items, setItems] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch items
        const itemsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
        setItems(itemsRes.data.slice(0, 3)); // Just get first 3 for display
        
        // Fetch collectors
        const collectorsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
        setCollectors(collectorsRes.data.slice(0, 3)); // Just get first 3 for display
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h3>Error: {error}</h3>;

  return (
    <Container>
      <div className="text-center my-5">
        <h1>Welcome to the Auction-Collector System</h1>
        <p className="lead">
          Match collector cards with auction items based on shared descriptions to earn value!
        </p>
        <Button as={Link} to="/auction" variant="primary" size="lg" className="mt-3">
          Start Auction
        </Button>
      </div>
      
      <Row className="my-4">
        <Col md={6}>
          <h2>Featured Items</h2>
          <Row>
            {items.map(item => (
              <Col key={item._id} md={12} className="mb-3">
                <Card>
                  <Row>
                    <Col md={4}>
                      <Card.Img 
                        src={item.image} 
                        alt={item.name}
                        style={{ height: '100px', objectFit: 'contain' }}
                      />
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Link to={`/items/${item.id}`}>View Details</Link>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-3">
            <Button as={Link} to="/items" variant="outline-primary">
              View All Items
            </Button>
          </div>
        </Col>
        
        <Col md={6}>
          <h2>Featured Collectors</h2>
          <Row>
            {collectors.map(collector => (
              <Col key={collector._id} md={12} className="mb-3">
                <Card>
                  <Row>
                    <Col md={4}>
                      <Card.Img 
                        src={collector.image} 
                        alt={collector.name}
                        style={{ height: '100px', objectFit: 'contain' }}
                      />
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title>{collector.name}</Card.Title>
                        <Link to={`/collectors/${collector.id}`}>View Details</Link>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-3">
            <Button as={Link} to="/collectors" variant="outline-primary">
              View All Collectors
            </Button>
          </div>
        </Col>
      </Row>
      
      <Row className="my-5">
        <Col md={12}>
          <Card bg="light">
            <Card.Body className="text-center">
              <Card.Title as="h3">How It Works</Card.Title>
              <Card.Text>
                <ol className="text-start">
                  <li>Each person creates two collector items</li>
                  <li>The auctioneer presents one item at a time</li>
                  <li>If the collector item matches descriptions with the items, each description adds to the money given</li>
                  <li>For example: If an item matches "Postmodernism products" (21w) and "Transportation" (13w), the collector gets 21+13=34w</li>
                </ol>
              </Card.Text>
              <Button as={Link} to="/auction" variant="success">
                Start Matching Now
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomeScreen;
