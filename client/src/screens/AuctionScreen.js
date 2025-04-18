// --- START OF FILE AuctionScreen.js ---

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import FadeInOnScroll from '../components/FadeInOnScroll';
import DealingCardAnimation from '../components/DealingCardAnimation';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  getActiveAuction, 
  getItemById, 
  getCollectors, 
  matchItemWithCollector,
  updateAuction
} from '../services/fileSystemService';

const AuctionScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const matchSoundRef = useRef(null);
  const successSoundRef = useRef(null);
  const particleContainerRef = useRef(null);
  const cardRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const isExpandedRef = useRef(false);
  const isTouchDeviceRef = useRef(false);

  const [activeAuction, setActiveAuction] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [userCollections, setUserCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Check if this is a touch device
    const detectTouchDevice = () => {
      isTouchDeviceRef.current = ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0) || 
        (navigator.msMaxTouchPoints > 0);
    };
    
    detectTouchDevice();
  }, []);

  useEffect(() => {
    // Create audio elements with error handling
    try {
      matchSoundRef.current = new Audio('/sounds/success.mp3'); // Using success.mp3 as fallback for both
      successSoundRef.current = new Audio('/sounds/success.mp3');
      
      // Set volume if audio loaded successfully
      if (matchSoundRef.current) matchSoundRef.current.volume = 0.5;
      if (successSoundRef.current) successSoundRef.current.volume = 0.5;
      
      // Preload the audio files
      matchSoundRef.current.load();
      successSoundRef.current.load();
    } catch (error) {
      console.warn("Failed to initialize audio:", error);
    }

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

  // Set up hover and touch effects
  useEffect(() => {
    if (!cardRef.current) return;
    
    // GSAP hover effects for desktop
    const hoverEffect = (e) => {
      if (isTouchDeviceRef.current) return; // Skip on touch devices
      
      gsap.to(e.currentTarget, {
        scale: 1.05,
        boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)',
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    const leaveEffect = (e) => {
      if (isTouchDeviceRef.current) return; // Skip on touch devices
      
      gsap.to(e.currentTarget, {
        scale: 1,
        boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    // Double-tap functionality for touch devices
    const handleTap = (e) => {
      if (!isTouchDeviceRef.current) return; // Only for touch devices
      
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTimeRef.current;
      
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        e.preventDefault();
        
        if (isExpandedRef.current) {
          // Collapse
          gsap.to(e.currentTarget, {
            scale: 1,
            boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
            duration: 0.3,
            ease: 'power2.out'
          });
          isExpandedRef.current = false;
        } else {
          // Expand
          gsap.to(e.currentTarget, {
            scale: 1.1,
            boxShadow: '0 15px 30px rgba(255, 215, 0, 0.4)',
            duration: 0.3,
            ease: 'power2.out'
          });
          isExpandedRef.current = true;
        }
      }
      
      lastTapTimeRef.current = currentTime;
    };
    
    // Add event listeners to the card
    const card = cardRef.current;
    
    card.addEventListener('mouseenter', hoverEffect);
    card.addEventListener('mouseleave', leaveEffect);
    card.addEventListener('touchstart', handleTap);
    
    return () => {
      // Clean up event listeners
      card.removeEventListener('mouseenter', hoverEffect);
      card.removeEventListener('mouseleave', leaveEffect);
      card.removeEventListener('touchstart', handleTap);
    };
  }, [currentItem]); // Re-run when currentItem changes

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active auction with current language
        const auctionData = await getActiveAuction(language);
        setActiveAuction(auctionData);
        
        // If there's an active auction, fetch its item details with language
        if (auctionData) {
          const itemData = await getItemById(auctionData.itemId, language);
          setCurrentItem(itemData);
        }
        
        // Fetch user's collections with language
        const collectionsData = await getCollectors(language);
        setUserCollections(collectionsData);
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [language]); // Re-fetch when language changes

  const createParticles = () => {
    const container = particleContainerRef.current;
    if (!container) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'success-particle';
      
      // Random position and animation
      const angle = Math.random() * Math.PI * 2;
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

  // Manual translation map for critical matching attributes
  const manualTranslations = {
    "Like oil paintings": {
      en: "Like oil paintings",
      zh: "喜欢油画"
    },
    "Similar color palette": {
      en: "Similar color palette",
      zh: "相似的色彩搭配"
    },
    // Add more as needed
  };
  
  // Helper function to manually translate attributes if server translation fails
  const translateMatchedDescriptions = (descriptions, lang) => {
    if (!descriptions || !Array.isArray(descriptions)) return [];
    
    return descriptions.map(desc => {
      const translation = manualTranslations[desc.attribute]?.[lang];
      return {
        ...desc,
        attribute: translation || desc.attribute
      };
    });
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
  
  // Helper function to determine collector type from image filename
  const getCollectorType = (imageUrl) => {
    if (!imageUrl) return t('unknownCollector');
    const filename = imageUrl.split('/').pop();
    
    if (filename.startsWith('i')) {
      return t('illustrationCollector');
    } else if (filename.startsWith('p')) {
      return t('productCollector');
    } else if (filename.startsWith('s')) {
      return t('sculptureCollector');
    }
    
    return t('unknownCollector');
  };
  
  // Helper function to get collector number from filename
  const getCollectorNumber = (imageUrl) => {
    if (!imageUrl) return '';
    const filename = imageUrl.split('/').pop();
    
    // Example: Extract '1' from 'i1.jpg'
    if (filename.match(/^[ips]\d+\.jpg$/i)) {
      return filename.match(/^[ips](\d+)\.jpg$/i)[1];
    }
    
    return '';
  };
  
  // Helper function to create a properly translated collector name
  const getTranslatedCollectorName = (collector) => {
    if (!collector || !collector.image) return '';
    
    const type = getCollectorType(collector.image);
    const number = getCollectorNumber(collector.image);
    
    // Return a formatted string with the translated type and original collector number
    return `${type} ${number}`;
  };

  const handleBid = async (collectorId) => {
    try {
      if (!activeAuction || !currentItem) {
        setError('No active auction found');
        return;
      }

      console.log(`[CLIENT] Placing bid with language: ${language}`);
      
      // Pass the language parameter to the match function
      const matchData = await matchItemWithCollector(currentItem.id, collectorId, language);
      console.log('[CLIENT] Match data received:', matchData);
      
      // Apply manual translation if server didn't translate properly
      if (language === 'zh') {
        matchData.matchedDescriptions = translateMatchedDescriptions(
          matchData.matchedDescriptions, 
          language
        );
      }
      
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

      // Update the auction with the match results - pass language parameter
      await updateAuction(activeAuction._id, {
        collectorId: matchResults.auction.collectorId,
        matchedDescriptions: matchResults.matchedDescriptions,
        totalValue: matchResults.totalValue,
        status: 'completed'
      }, language);

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
      // Use language when refreshing auction data
      const auctionData = await getActiveAuction(language);
      setActiveAuction(auctionData);
      
      if (auctionData) {
        const itemData = await getItemById(auctionData.itemId, language);
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
        <Row className="mb-5 justify-content-center">
          <Col md={8} className="text-center">
            <FadeInOnScroll>
              <Card className="mx-auto" style={{ maxWidth: "550px" }} ref={cardRef}>
                <Card.Img
                  variant="top"
                  src={currentItem?.image}
                  alt={currentItem?.name}
                  className="item-image"
                  style={{ 
                    width: "100%", 
                    maxWidth: "1000px", 
                    height: "auto", 
                    maxHeight: "404px", 
                    objectFit: "contain",
                    margin: "0 auto",
                    display: "block",
                    padding: "15px"
                  }}
                />
                <Card.Body>
                  <Card.Title>{currentItem?.name}</Card.Title>
                  {currentItem?.descriptions && (
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
        {userCollections.map((collector, index) => (
          <Col key={collector._id} sm={12} md={6} lg={4} className="mb-4">
            <DealingCardAnimation 
              collector={collector}
              onBidClick={handleBid}
              disabled={!currentItem}
              index={index}
            />
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