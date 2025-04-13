// --- START OF FILE AuctionScreen.js ---

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ListGroup, Modal } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FadeInOnScroll from '../components/FadeInOnScroll';
import { 
  getActiveAuction, 
  getItemById, 
  getCollectors, 
  matchItemWithCollector,
  updateAuction
} from '../services/fileSystemService';

const AuctionScreen = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const matchSoundRef = useRef(null);
  const successSoundRef = useRef(null);
  const particleContainerRef = useRef(null);

  const [activeAuction, setActiveAuction] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [userCollections, setUserCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Create audio elements
    matchSoundRef.current = new Audio('/sounds/match.mp3');
    successSoundRef.current = new Audio('/sounds/success.mp3');
    matchSoundRef.current.volume = 0.5;
    successSoundRef.current.volume = 0.5;

    return () => {
      // Cleanup audio elements
      if (matchSoundRef.current) {
        matchSoundRef.current = null;
      }
      if (successSoundRef.current) {
        successSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active auction
        const auctionData = await getActiveAuction();
        setActiveAuction(auctionData);
        
        // If there's an active auction, fetch its item details
        if (auctionData) {
          const itemData = await getItemById(auctionData.itemId);
          setCurrentItem(itemData);
        }
        
        // Fetch user's collections
        const collectionsData = await getCollectors();
        setUserCollections(collectionsData);
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const createParticles = () => {
    const container = particleContainerRef.current;
    if (!container) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'success-particle';
      
      // Random position and animation
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 2;
      const size = 5 + Math.random() * 5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Set initial position to center
      particle.style.left = '50%';
      particle.style.top = '50%';
      
      // Animate using CSS transforms
      const distance = 50 + Math.random() * 50;
      const duration = 0.5 + Math.random() * 0.5;
      
      particle.style.transform = `translate(-50%, -50%)`;
      particle.style.animation = `particle ${duration}s ease-out forwards`;
      
      // Calculate end position
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      particle.style.setProperty('--end-x', `${endX}px`);
      particle.style.setProperty('--end-y', `${endY}px`);
      
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        container.removeChild(particle);
      }, duration * 1000);
    }
  };

  const handleBid = async (collectorId) => {
    try {
      if (!activeAuction || !currentItem) {
        setError('No active auction found');
        return;
      }

      // Get the match calculation
      const matchData = await matchItemWithCollector(currentItem.id, collectorId);
      console.log('Match data received:', matchData); // Debugging the response
      setMatchResults(matchData);
      setShowMatchModal(true);
      matchSoundRef.current?.play().catch(console.error);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleConfirmBid = async () => {
    try {
      if (!activeAuction || !activeAuction._id) {
        setError('No active auction found');
        return;
      }

      // Update the auction with the match results
      await updateAuction(activeAuction._id, {
        collectorId: matchResults.auction.collectorId,
        matchedDescriptions: matchResults.matchedDescriptions,
        totalValue: matchResults.totalValue,
        status: 'completed'
      });

      setShowMatchModal(false);
      setShowSuccessModal(true);
      successSoundRef.current?.play().catch(console.error);
      createParticles();

      // Auto-hide success modal after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        // Then refresh the auction data
        refreshAuctionData();
      }, 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  const refreshAuctionData = async () => {
    try {
      const auctionData = await getActiveAuction();
      setActiveAuction(auctionData);
      
      if (auctionData) {
        const itemData = await getItemById(auctionData.itemId);
        setCurrentItem(itemData);
      } else {
        setCurrentItem(null);
      }
      
      setMatchResults(null);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;

  return (
    <Container>
      <FadeInOnScroll>
        <h1 className="page-heading my-4">{t('auctionTitle')}</h1>
      </FadeInOnScroll>

      {currentItem ? (
        <Row className="mb-5">
          <Col md={6}>
            <FadeInOnScroll>
              <Card className="current-item">
                <Card.Header as="h5">{t('currentAuctionItem')}</Card.Header>
                <Card.Img
                  variant="top"
                  src={currentItem.image}
                  alt={currentItem.name}
                  style={{ height: '300px', objectFit: 'contain' }}
                />
                <Card.Body>
                  <Card.Title>{currentItem.name}</Card.Title>
                  {currentItem.descriptions && (
                    <ListGroup variant="flush">
                      {currentItem.descriptions.map((desc, index) => (
                        <ListGroup.Item key={index}>
                          <strong>{desc.attribute}:</strong> {desc.value}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </FadeInOnScroll>
          </Col>
        </Row>
      ) : (
        <Alert variant="info">{t('noActiveAuction')}</Alert>
      )}

      <FadeInOnScroll>
        <h2 className="mb-4">{t('yourCollections')}</h2>
      </FadeInOnScroll>

      <Row>
        {userCollections.map(collector => (
          <Col key={collector._id} sm={12} md={6} lg={4} className="mb-4">
            <FadeInOnScroll>
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src={collector.image}
                  alt={collector.name}
                  style={{ height: '200px', objectFit: 'contain' }}
                />
                <Card.Body>
                  <Card.Title>{collector.name}</Card.Title>
                  {collector.descriptions && (
                    <ListGroup variant="flush">
                      {collector.descriptions.map((desc, index) => (
                        <ListGroup.Item key={index}>
                          <strong>{desc.attribute}:</strong> {desc.value}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  <Button
                    variant="primary"
                    className="mt-3"
                    onClick={() => handleBid(collector.id)}
                    disabled={!currentItem}
                  >
                    {t('placeBid')}
                  </Button>
                </Card.Body>
              </Card>
            </FadeInOnScroll>
          </Col>
        ))}
      </Row>

      <Modal show={showMatchModal} onHide={() => setShowMatchModal(false)} className="match-modal" aria-labelledby="match-modal-title">
        <Modal.Header closeButton>
          <Modal.Title id="match-modal-title" style={{ color: '#ffd700' }}>{t('matchResults')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {matchResults && (
            <>
              <h5 className="matched-title">{t('matchedDescriptions')}:</h5>
              <ListGroup className="mb-3 matched-list">
                {matchResults.matchedDescriptions && matchResults.matchedDescriptions.length > 0 ? (
                  matchResults.matchedDescriptions.map((desc, index) => (
                    <ListGroup.Item key={index} className="matched-item">
                      <strong>• {desc.attribute}</strong>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item className="matched-item">
                    <strong>{t('noMatch')}</strong>
                  </ListGroup.Item>
                )}
              </ListGroup>
              <h5 className="total-value">{t('totalValue', { value: matchResults.totalValue })}</h5>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMatchModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleConfirmBid} className="confirm-bid-btn">
            {t('confirmBid')}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showSuccessModal} 
        centered
        className="success-modal"
        aria-labelledby="success-modal-title"
      >
        <Modal.Body className="text-center py-5">
          <div ref={particleContainerRef} className="particle-container" />
          <div className="success-animation">
            <i className="fas fa-check-circle" aria-hidden="true"></i>
          </div>
          <h4 id="success-modal-title">{t('bidSuccessful')}</h4>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default AuctionScreen;
// --- END OF FILE AuctionScreen.js ---