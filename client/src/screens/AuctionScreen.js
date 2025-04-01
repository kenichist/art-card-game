import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';

const AuctionScreen = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch active auction or create a new one
  useEffect(() => {
    const fetchActiveAuction = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/active`);
        
        if (data) {
          // Get the item details
          const itemRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/${data.itemId}`);
          setActiveItem(itemRes.data);
        } else {
          // No active auction, select a random item
          const itemsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
          if (itemsRes.data.length > 0) {
            const randomItem = itemsRes.data[Math.floor(Math.random() * itemsRes.data.length)];
            setActiveItem(randomItem);
            
            // Create a new auction with this item
            await axios.post(`${process.env.REACT_APP_API_URL}/api/auctions`, { 
              itemId: randomItem.id,
              status: 'active'
            });
          }
        }
        
        // Fetch collectors
        const collectorsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
        setCollectors(collectorsRes.data);
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    
    fetchActiveAuction();
  }, []);

  // Handle collector selection
  const selectCollector = (collector) => {
    setSelectedCollector(collector);
    setMatchResult(null);
  };

  // Handle matching
  const handleMatch = async () => {
    if (!activeItem || !selectedCollector) return;
    
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auctions/match/${activeItem.id}/${selectedCollector.id}`
      );
      setMatchResult(data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  // Handle next item
  const handleNextItem = async () => {
    try {
      setLoading(true);
      setActiveItem(null);
      setSelectedCollector(null);
      setMatchResult(null);
      
      // Complete current auction
      const activeAuctionRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/active`);
      if (activeAuctionRes.data) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/auctions/${activeAuctionRes.data._id}`, {
          status: 'completed'
        });
      }
      
      // Get a new random item
      const itemsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
      if (itemsRes.data.length > 0) {
        const randomItem = itemsRes.data[Math.floor(Math.random() * itemsRes.data.length)];
        setActiveItem(randomItem);
        
        // Create a new auction with this item
        await axios.post(`${process.env.REACT_APP_API_URL}/api/auctions`, { 
          itemId: randomItem.id,
          status: 'active'
        });
      }
      
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h3>Error: {error}</h3>;

  return (
    <Container>
      <h1 className="my-4">Auction Room</h1>
      
      {/* Active Item */}
      {activeItem && (
        <Row className="mb-4">
          <Col md={12}>
            <h2>Current Item</h2>
            <Card>
              <Row>
                <Col md={4}>
                  <Card.Img 
                    src={activeItem.image} 
                    alt={activeItem.name}
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Col>
                <Col md={8}>
                  <Card.Body>
                    <Card.Title>{activeItem.name}</Card.Title>
                    <h4>Descriptions:</h4>
                    <ul>
                      {activeItem.descriptions.map((desc, index) => (
                        <li key={index}>
                          {desc.attribute}: {desc.value}w
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Collectors */}
      <Row className="mb-4">
        <Col md={12}>
          <h2>Select Your Collector Card</h2>
          <Row>
            {collectors.map(collector => (
              <Col key={collector._id} md={4} className="mb-3">
                <Card 
                  onClick={() => selectCollector(collector)}
                  className={selectedCollector?.id === collector.id ? 'border-primary' : ''}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Img 
                    variant="top" 
                    src={collector.image} 
                    alt={collector.name}
                    style={{ height: '200px', objectFit: 'contain' }}
                  />
                  <Card.Body>
                    <Card.Title>{collector.name}</Card.Title>
                    <h5>Descriptions:</h5>
                    <ul>
                      {collector.descriptions.map((desc, index) => (
                        <li key={index}>
                          {desc.attribute}: {desc.value}w
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      
      {/* Match Button */}
      <Row className="mb-4">
        <Col className="text-center">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleMatch}
            disabled={!selectedCollector || !activeItem}
          >
            Match Item with Collector
          </Button>
        </Col>
      </Row>
      
      {/* Match Results */}
      {matchResult && (
        <Row className="mb-4">
          <Col md={12}>
            <Card bg="light">
              <Card.Body>
                <Card.Title>Match Results</Card.Title>
                <h4>Matched Descriptions:</h4>
                {matchResult.matchedDescriptions.length > 0 ? (
                  <ul>
                    {matchResult.matchedDescriptions.map((desc, index) => (
                      <li key={index}>
                        {desc.attribute}: {desc.value}w
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No matching descriptions found.</p>
                )}
                <h3>Total Value: {matchResult.totalValue}w</h3>
                <Button 
                  variant="success" 
                  onClick={handleNextItem}
                  className="mt-3"
                >
                  Next Item
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AuctionScreen;
