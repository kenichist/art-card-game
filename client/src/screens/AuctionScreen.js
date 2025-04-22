// --- START OF FILE AuctionScreen.js ---

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import FadeInOnScroll from '../components/FadeInOnScroll';
import DealingCardAnimation from '../components/DealingCardAnimation';
import { useLanguage } from '../contexts/LanguageContext';
import LocalApiService, { API_EVENTS } from '../services/LocalApiService';
import { 
  getActiveAuction, 
  getItemById, 
  getCollectors, 
  matchItemWithCollector,
  updateAuction,
  setItemForAuction
} from '../services/fileSystemService';

const AuctionScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Debug logging for location state
  useEffect(() => {
    if (location.state?.itemId) {
      console.debug('ItemID received from navigation:', location.state.itemId);
    }
  }, [location.state]);

  // Handle item from navigation state
  useEffect(() => {
    const setupItemFromNavigation = async () => {
      try {
        if (location.state?.itemId && !currentItem) {
          console.debug('Setting up item from navigation state, itemId:', location.state.itemId);
          
          // Create auction with the selected item
          const itemId = location.state.itemId;
          
          // First check if there's already an active auction
          const currentAuction = await getActiveAuction(language);
          
          if (currentAuction) {
            console.debug('Active auction already exists:', currentAuction);
            // If current auction has different item than the one from navigation, show toast
            if (currentAuction.itemId !== Number(itemId)) {
              setToastMessage(t('differentItemActive', { 
                activeId: currentAuction.itemId, 
                requestedId: itemId 
              }) || `Item #${currentAuction.itemId} is already active (you requested #${itemId})`);
              setShowToast(true);
            }
          } else {
            // Set up new auction with the item from navigation
            const itemData = await getItemById(itemId, language);
            if (itemData) {
              // Now create the auction with this item
              const auctionData = await setItemForAuction(itemId, language);
              
              // Update state with new data
              setActiveAuction(auctionData);
              setCurrentItem(itemData);
              
              // Show notification
              setToastMessage(t('itemSetForAuction', { itemId }) || `Item #${itemId} ready for auction!`);
              setShowToast(true);
              
              console.debug('Successfully set up item for auction:', {
                item: itemData,
                auction: auctionData
              });
            }
          }
        }
      } catch (error) {
        console.error('Error setting up item from navigation:', error);
        setError(error.message);
      }
    };
    
    if (!loading) {
      setupItemFromNavigation();
    }
  }, [loading, location.state, language, currentItem, t]);

  useEffect(() => {
    // Check if this is a touch device
    const detectTouchDevice = () => {
      isTouchDeviceRef.current = ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0) || 
        (navigator.msMaxTouchPoints > 0);
    };
    
    detectTouchDevice();
  }, []);

  // Clear existing auctions and set up a new one when coming from ItemsScreen
  useEffect(() => {
    const clearAndSetupAuction = async () => {
      if (location.state?.itemId) {
        try {
          console.debug('Clearing existing auctions and setting up new one with itemId:', location.state.itemId);
          
          // Get the selected item ID
          const itemId = Number(location.state.itemId);
          
          // Force fetch the item data to ensure we have the correct image path
          const itemData = await getItemById(itemId, language);
          console.debug('Fetched item data:', itemData);
          
          // Create a new auction with this item
          const auctionData = await setItemForAuction(itemId, language);
          
          // Update the state
          setActiveAuction(auctionData);
          setCurrentItem(itemData);
          
          // Show notification
          setToastMessage(t('itemSetForAuction', { itemId }) || `Item #${itemId} ready for auction!`);
          setShowToast(true);
          
        } catch (error) {
          console.error('Error in clearAndSetupAuction:', error);
          setError(error.message);
          setToastMessage(t('error', { message: error.message }));
          setShowToast(true);
        }
      }
    };
    
    // Only run this once when coming from item selection
    if (!loading && location.state?.itemId) {
      clearAndSetupAuction();
      // Clear the location state to prevent re-runs
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [loading, location.state?.itemId, language, t, navigate, location.pathname]);

  // Use LocalApiService to get item data as a more reliable communication method between screens
  useEffect(() => {
    // Set up an event listener for when items are selected
    const cleanup = LocalApiService.addEventListener(API_EVENTS.ITEM_SELECTED, async (event) => {
      const { itemId, language: itemLanguage } = event.detail;
      
      console.debug('[AuctionScreen] Received item selection event:', event.detail);
      
      try {
        // Force fetch the item data to ensure we have the correct image path
        const itemData = await getItemById(itemId, itemLanguage || language);
        console.debug('[AuctionScreen] Fetched item data from event:', itemData);
        
        // Create or update the auction
        const auctionData = await setItemForAuction(itemId, itemLanguage || language);
        
        // Update state with the latest data
        setActiveAuction(auctionData);
        setCurrentItem(itemData);
        
        // Show notification
        setToastMessage(t('itemSetForAuction', { itemId }) || `Item #${itemId} ready for auction!`);
        setShowToast(true);
      } catch (error) {
        console.error('[AuctionScreen] Error processing item selection event:', error);
        setError(error.message);
      }
    });
    
    // Try to get the current auction item from LocalApiService
    const tryLoadCurrentAuctionItem = async () => {
      const currentAuctionItem = LocalApiService.getCurrentAuctionItem();
      console.debug('[AuctionScreen] Retrieved current auction item from LocalApiService:', currentAuctionItem);
      
      if (currentAuctionItem && !currentItem) {
        try {
          // Force fetch the item data to ensure we have the correct image path
          const itemData = await getItemById(currentAuctionItem.id, currentAuctionItem.language || language);
          console.debug('[AuctionScreen] Fetched stored item data:', itemData);
          
          // If we already have an active auction, ensure it's for this item
          // or create a new one if needed
          let auctionData = activeAuction;
          if (!auctionData || auctionData.itemId !== currentAuctionItem.id) {
            auctionData = await setItemForAuction(currentAuctionItem.id, currentAuctionItem.language || language);
          }
          
          // Update state with the latest data
          setActiveAuction(auctionData);
          setCurrentItem(itemData);
          
        } catch (error) {
          console.error('[AuctionScreen] Error loading stored auction item:', error);
        }
      }
    };
    
    // Try to load the current auction item when component mounts
    if (!loading) {
      tryLoadCurrentAuctionItem();
    }
    
    // Clean up the event listener when the component unmounts
    return cleanup;
  }, [loading, language, t, currentItem, activeAuction]);

  // Debug logging for data flow
  useEffect(() => {
    if (currentItem) {
      console.debug('[AuctionScreen] Current item data:', {
        id: currentItem.id,
        name: currentItem.name,
        image: currentItem.image
      });
    }
    
    if (activeAuction) {
      console.debug('[AuctionScreen] Active auction data:', {
        id: activeAuction.id || activeAuction._id,
        itemId: activeAuction.itemId,
        status: activeAuction.status
      });
    }
  }, [currentItem, activeAuction]);

  // Ensure image path is always correct
  useEffect(() => {
    const ensureCorrectImagePath = async () => {
      if (activeAuction && currentItem) {
        // Check if the currentItem's ID matches the auction's itemId
        if (Number(currentItem.id) !== Number(activeAuction.itemId)) {
          console.debug('[AuctionScreen] Item ID mismatch, fetching correct item:', {
            currentItemId: currentItem.id,
            auctionItemId: activeAuction.itemId
          });
          
          // Re-fetch the correct item data
          try {
            const correctItemData = await getItemById(activeAuction.itemId, language);
            console.debug('[AuctionScreen] Fetched correct item data:', correctItemData);
            setCurrentItem(correctItemData);
          } catch (error) {
            console.error('[AuctionScreen] Error fetching correct item:', error);
          }
        }
      }
    };
    
    ensureCorrectImagePath();
  }, [activeAuction, currentItem, language]);

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

  // Debug logging for what happens when component mounts
  useEffect(() => {
    console.group('🔍 AuctionScreen Debug - Component Mount');
    console.debug('Current path:', location.pathname);
    console.debug('Location state:', location.state);
    
    // Check what's in the LocalApiService
    const currentAuctionItem = LocalApiService.getCurrentAuctionItem();
    console.debug('Current auction item in LocalApiService:', currentAuctionItem);
    
    console.groupEnd();
    
    // Return cleanup function
    return () => {
      console.debug('AuctionScreen unmounting');
    };
  }, [location]);

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
  
  // Helper function to determine collector type from image ID instead of prefix
  const getCollectorType = (imageUrl) => {
    if (!imageUrl) return t('unknownCollector');
    
    // Extract filename and ID from the path
    const filename = imageUrl.split('/').pop();
    const id = parseInt(filename.split('.')[0]);
    
    // Determine collector type based on ID range
    if (id >= 1 && id <= 10) {
      return t('illustrationCollector');
    } else if (id >= 11 && id <= 20) {
      return t('productCollector');
    } else if (id >= 21 && id <= 30) {
      return t('sculptureCollector');
    }
    
    return t('unknownCollector');
  };
  
  // Helper function to get collector number from filename
  const getCollectorNumber = (imageUrl) => {
    if (!imageUrl) return '';
    
    // Extract filename from image URL
    const filename = imageUrl.split('/').pop();
    
    // Extract the number from the filename (e.g., "15.jpg" -> "15")
    const match = filename.match(/(\d+)\.jpg$/i);
    if (match) {
      return match[1];
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
      // Check both activeAuction and LocalApiService for an active auction
      const localApiAuction = LocalApiService.getActiveAuction();
      
      if ((!activeAuction || !currentItem) && (!localApiAuction || localApiAuction.status !== 'active')) {
        // Try loading from LocalApiService one more time
        const storedItem = LocalApiService.getCurrentAuctionItem();
        if (storedItem) {
          try {
            const itemData = await getItemById(storedItem.id, language);
            setCurrentItem(itemData);
            // Create an auction if none exists
            const auctionData = await setItemForAuction(storedItem.id, language);
            setActiveAuction(auctionData);
          } catch (itemError) {
            console.error('Error fetching stored item:', itemError);
            setError('No active auction found - please select an item for auction first');
            return;
          }
        } else {
          setError('No active auction found - please select an item for auction first');
          return;
        }
      }
      
      // If we still don't have an item, use the one from localApiAuction
      const itemId = currentItem ? currentItem.id : (localApiAuction ? localApiAuction.itemId : null);
      if (!itemId) {
        setError('No item found for auction');
        return;
      }

      console.log(`[CLIENT] Placing bid with language: ${language}`);
      
      // Pass the language parameter to the match function
      const matchData = await matchItemWithCollector(itemId, collectorId, language);
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
      // Handle the case when active auction might be null but matchResults has the auction data
      if (!activeAuction && (!matchResults || !matchResults.auction)) {
        setError('No active auction found');
        return;
      }
      
      const auctionId = activeAuction ? (activeAuction._id || activeAuction.id) : matchResults.auction.id;
      
      if (!auctionId) {
        setError('Cannot find auction ID');
        return;
      }

      // Update the auction with the match results - pass language parameter
      await updateAuction(auctionId, {
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
    <>
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
            <Col key={collector.id || collector._id || `collector-${index}`} sm={12} md={6} lg={4} className="mb-4">
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

      {/* Custom toast notification - completely independent of page scroll */}
      {showToast && (
        <div 
          style={{ 
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#198754', /* Bootstrap success color */
            color: 'white',
            padding: '15px',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            minWidth: '250px',
            fontFamily: 'inherit'
          }}
        >
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.3)',
            paddingBottom: '8px'
          }}>
            <strong>{t('notification')}</strong>
            <button 
              onClick={() => setShowToast(false)} 
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          <div>{toastMessage}</div>
        </div>
      )}
    </>
  );
};

export default AuctionScreen;
// --- END OF FILE AuctionScreen.js ---