// --- START OF FILE ItemsScreen.js ---

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Card, Button, Pagination, Form, InputGroup, Toast, ToastContainer, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FadeInOnScroll from '../components/FadeInOnScroll';
import ViewModeToggle from '../components/ViewModeToggle';
import { getItems, setItemForAuction } from '../services/fileSystemService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight, faGavel } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { Flip } from 'gsap/Flip';
import gsap from 'gsap';

// Register GSAP Flip plugin
gsap.registerPlugin(Flip);

const ItemsScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [arrowHover, setArrowHover] = useState({ left: false, right: false });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [viewMode, setViewMode] = useState('medium');
  
  // Refs for GSAP animations and touch support
  const itemCardsRef = useRef([]);
  const lastTapTimeRef = useRef({});
  const isExpandedRef = useRef({});
  const isTouchDeviceRef = useRef(false);

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

  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getItemType(item.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  
  // Detect touch device
  useEffect(() => {
    isTouchDeviceRef.current = ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      (navigator.msMaxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Pass the current language to get language-specific images
        const data = await getItems(language);
        // Sort items by ID
        const sortedData = [...data].sort((a, b) => Number(a.id) - Number(b.id));
        setItems(sortedData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchItems();
  }, [language]); // Re-fetch when language changes
  
  // Set up GSAP hover effects for desktop and double-tap for touch devices
  useEffect(() => {
    // Reset the refs when items change
    itemCardsRef.current = [];
    
    // Set up GSAP effects after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setupCardEffects();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Clean up any lingering event listeners
      cleanupCardEffects();
    };
  }, [currentPage, itemsPerPage, searchTerm, items, setupCardEffects]); // Added setupCardEffects dependency

  const setupCardEffects = useCallback(() => {
    // Function to apply effects to a single card
    const applyCardEffects = (cardRef, cardId) => {
      if (!cardRef) return null;
      
      const cardKey = `item-${cardId}`;
      if (isExpandedRef.current[cardKey] === undefined) {
        isExpandedRef.current[cardKey] = false;
      }
      
      // GSAP hover effects for desktop
      const hoverEffect = (e) => {
        if (isTouchDeviceRef.current) return; // Skip on touch devices
        
        gsap.to(e.currentTarget, {
          scale: 1.05,
          boxShadow: '0 15px 30px rgba(255, 215, 0, 0.3)',
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
        const tapLength = currentTime - (lastTapTimeRef.current[cardKey] || 0);
        
        if (tapLength < 300 && tapLength > 0) {
          // Double tap detected
          e.preventDefault();
          
          if (isExpandedRef.current[cardKey]) {
            // Collapse
            gsap.to(e.currentTarget, {
              scale: 1,
              boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
              duration: 0.3,
              ease: 'power2.out'
            });
            isExpandedRef.current[cardKey] = false;
          } else {
            // Expand
            gsap.to(e.currentTarget, {
              scale: 1.1,
              boxShadow: '0 15px 30px rgba(255, 215, 0, 0.4)',
              duration: 0.3,
              ease: 'power2.out'
            });
            isExpandedRef.current[cardKey] = true;
          }
        }
        
        lastTapTimeRef.current[cardKey] = currentTime;
      };
      
      // Add event listeners
      cardRef.addEventListener('mouseenter', hoverEffect);
      cardRef.addEventListener('mouseleave', leaveEffect);
      cardRef.addEventListener('touchstart', handleTap);
      
      // Return cleanup function
      return () => {
        cardRef.removeEventListener('mouseenter', hoverEffect);
        cardRef.removeEventListener('mouseleave', leaveEffect);
        cardRef.removeEventListener('touchstart', handleTap);
      };
    };
    
    // Apply effects to all current item cards
    const cleanupFunctions = itemCardsRef.current.map((card, index) => {
      const item = currentItems[index];
      if (!item || !card) return null;
      return applyCardEffects(card, item.id);
    });
    
    // Store cleanup functions
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup && cleanup());
    };
  }, [currentItems]); // Added dependencies for useCallback
  
  const cleanupCardEffects = useCallback(() => {
    // This function will be called on component unmount or when currentItems changes
    // Any cleanup that needs to happen can go here
  }, []);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredItems.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Arrow hover effect handlers
  const handleArrowHover = (direction, isHovering) => {
    setArrowHover(prev => ({...prev, [direction]: isHovering}));
  };

  // Handler function for setting an item for auction
  const handleUseForAuction = async (itemId) => {
    try {
      setSelectedItemId(itemId);
      await setItemForAuction(itemId, language);
      setToastMessage(t('itemSetForAuction', { itemId }));
      setShowToast(true);
      
      // Navigate to auction screen after a short delay
      setTimeout(() => {
        navigate('/auction');
      }, 1500);
    } catch (error) {
      setToastMessage(t('error', { message: error.message }));
      setShowToast(true);
    } finally {
      setSelectedItemId(null);
    }
  };

  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;

  return (
    <Container>
      <FadeInOnScroll>
        <h1 className="page-heading my-4">{t('itemCardsTitle')}</h1>
      </FadeInOnScroll>
      
      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('searchItems')}
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
      </Row>

      {filteredItems.length === 0 ? (
        <div className="text-center my-5">
          <h3>{t('noItemsFound')}</h3>
        </div>
      ) : (
        <>
          {/* View Mode Toggle */}
          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <ViewModeToggle 
                initialMode={viewMode}
                onViewModeChange={(mode) => setViewMode(mode)}
                containerSelector=".fantasy-grid"
              />
            </Col>
          </Row>
          
          {/* Side Navigation Arrows */}
          <div style={{ position: 'relative' }}>
            {/* Left Arrow */}
            <div 
              className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={handlePrevPage}
              onMouseEnter={() => handleArrowHover('left', true)}
              onMouseLeave={() => handleArrowHover('left', false)}
              style={{
                position: 'fixed',
                left: '5px',
                top: '50%',
                transform: arrowHover.left && currentPage !== 1 ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%)',
                zIndex: 100,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
                transition: 'all 0.3s ease',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b4513 0%, #654321 100%)',
                border: '1px solid #ffd700',
                boxShadow: arrowHover.left && currentPage !== 1 ? '0 0 15px rgba(255, 215, 0, 0.6)' : '0 0 5px rgba(255, 215, 0, 0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#ffd700'
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} size="lg" className="fade-in-up" />
            </div>
            
            {/* Right Arrow */}
            <div 
              className={`pagination-arrow ${currentPage >= Math.ceil(filteredItems.length / itemsPerPage) ? 'disabled' : ''}`}
              onClick={handleNextPage}
              onMouseEnter={() => handleArrowHover('right', true)}
              onMouseLeave={() => handleArrowHover('right', false)}
              style={{
                position: 'fixed',
                right: '5px',
                top: '50%',
                transform: arrowHover.right && currentPage < Math.ceil(filteredItems.length / itemsPerPage) ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%)',
                zIndex: 100,
                cursor: currentPage >= Math.ceil(filteredItems.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                opacity: currentPage >= Math.ceil(filteredItems.length / itemsPerPage) ? 0.5 : 1,
                transition: 'all 0.3s ease',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b4513 0%, #654321 100%)',
                border: '1px solid #ffd700',
                boxShadow: arrowHover.right && currentPage < Math.ceil(filteredItems.length / itemsPerPage) ? '0 0 15px rgba(255, 215, 0, 0.6)' : '0 0 5px rgba(255, 215, 0, 0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#ffd700'
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} size="lg" className="fade-in-up" />
            </div>
            
            {/* CSS Grid Layout for Items */}
            <div className="fantasy-grid">
              {currentItems.map((item, index) => (
                <FadeInOnScroll key={item.id}>
                  <Card 
                    className="h-100 item-card"
                    ref={el => itemCardsRef.current[index] = el}
                  >
                    <Card.Img 
                      variant="top" 
                      src={item.image} 
                      alt={item.name} 
                      className="card-img" 
                      style={{ width: '100%', height: 'auto', maxWidth: '606px', maxHeight: '405px', objectFit: 'contain' }}
                    />
                    <Card.Body>
                      <Card.Title>{item.name}</Card.Title>
                      <div className="d-flex flex-column gap-2">
                        <Button 
                          as={Link} 
                          to={`/items/${item.id}`} 
                          variant="primary"
                        >
                          {t('viewDetails')}
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => handleUseForAuction(item.id)}
                          disabled={selectedItemId === item.id}
                        >
                          <FontAwesomeIcon icon={faGavel} className="me-2" />
                          {selectedItemId === item.id ? t('setting') : t('useForAuction')}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </FadeInOnScroll>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <Row className="mt-4">
            <Col className="d-flex justify-content-center align-items-center">
              <Pagination>
                {[...Array(Math.ceil(filteredItems.length / itemsPerPage)).keys()].map(number => (
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
        </>
      )}
      
      {/* Toast notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">{t('notification')}</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default ItemsScreen;
// --- END OF FILE ItemsScreen.js ---