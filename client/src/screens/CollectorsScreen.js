// --- START OF FILE CollectorsScreen.js ---

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Pagination, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FadeInOnScroll from '../components/FadeInOnScroll';
import ViewModeToggle from '../components/ViewModeToggle';
import { getCollectors } from '../services/fileSystemService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';
import gsap from 'gsap';

// Import the GSAP Flip plugin (if not already imported in ViewModeToggle)
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

const CollectorsScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [collectorsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [arrowHover, setArrowHover] = useState({ left: false, right: false });
  const [viewMode, setViewMode] = useState('medium');
  
  // Refs for GSAP animations and touch support
  const collectorCardsRef = useRef([]);
  const lastTapTimeRef = useRef({});
  const isExpandedRef = useRef({});
  const isTouchDeviceRef = useRef(false);

  // Helper function to determine collector type from image filename
  const getCollectorType = (imageUrl) => {
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

  // Filter collectors based on search term
  const filteredCollectors = collectors.filter(collector => 
    collector.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getCollectorType(collector.image).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCollector = currentPage * collectorsPerPage;
  const indexOfFirstCollector = indexOfLastCollector - collectorsPerPage;
  const currentCollectors = filteredCollectors.slice(indexOfFirstCollector, indexOfLastCollector);

  // Detect touch device
  useEffect(() => {
    isTouchDeviceRef.current = ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      (navigator.msMaxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        setLoading(true);
        const data = await getCollectors(language);
        const sortedData = [...data].sort((a, b) => Number(a.id) - Number(b.id));
        setCollectors(sortedData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchCollectors();
  }, [language]);

  // Set up GSAP hover effects for desktop and double-tap for touch devices
  useEffect(() => {
    // Reset the refs when collectors change
    collectorCardsRef.current = [];
    
    // Set up GSAP effects after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setupCardEffects();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Clean up any lingering event listeners
      cleanupCardEffects();
    };
  }, [currentPage, collectorsPerPage, searchTerm, collectors, setupCardEffects]); // Added setupCardEffects dependency

  const setupCardEffects = () => {
    // Function to apply effects to a single card
    const applyCardEffects = (cardRef, cardId) => {
      if (!cardRef) return null;
      
      const cardKey = `collector-${cardId}`;
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
    
    // Apply effects to all current collector cards
    const cleanupFunctions = collectorCardsRef.current.map((card, index) => {
      const collector = currentCollectors[index];
      if (!collector || !card) return null;
      return applyCardEffects(card, collector.id);
    });
    
    // Store cleanup functions
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup && cleanup());
    };
  };
  
  const cleanupCardEffects = () => {
    // This function will be called on component unmount or when currentCollectors changes
    // Any cleanup that needs to happen can go here
  };

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
    if (currentPage < Math.ceil(filteredCollectors.length / collectorsPerPage)) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleArrowHover = (direction, isHovering) => {
    setArrowHover(prev => ({...prev, [direction]: isHovering}));
  };

  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;

  return (
    <Container>
      <FadeInOnScroll>
        <h1 className="page-heading my-4">{t('collectorCardsTitle')}</h1>
      </FadeInOnScroll>

      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('searchCollectors')}
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
      </Row>

      {filteredCollectors.length === 0 ? (
        <div className="text-center my-5">
          <h3>{t('noCollectorsFound')}</h3>
        </div>
      ) : (
        <>
          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <ViewModeToggle 
                initialMode={viewMode}
                onViewModeChange={(mode) => setViewMode(mode)}
                containerSelector=".fantasy-grid"
              />
            </Col>
          </Row>
          
          <div style={{ position: 'relative' }}>
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
            
            <div 
              className={`pagination-arrow ${currentPage >= Math.ceil(filteredCollectors.length / collectorsPerPage) ? 'disabled' : ''}`}
              onClick={handleNextPage}
              onMouseEnter={() => handleArrowHover('right', true)}
              onMouseLeave={() => handleArrowHover('right', false)}
              style={{
                position: 'fixed',
                right: '5px',
                top: '50%',
                transform: arrowHover.right && currentPage < Math.ceil(filteredCollectors.length / collectorsPerPage) ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%)',
                zIndex: 100,
                cursor: currentPage >= Math.ceil(filteredCollectors.length / collectorsPerPage) ? 'not-allowed' : 'pointer',
                opacity: currentPage >= Math.ceil(filteredCollectors.length / collectorsPerPage) ? 0.5 : 1,
                transition: 'all 0.3s ease',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b4513 0%, #654321 100%)',
                border: '1px solid #ffd700',
                boxShadow: arrowHover.right && currentPage < Math.ceil(filteredCollectors.length / collectorsPerPage) ? '0 0 15px rgba(255, 215, 0, 0.6)' : '0 0 5px rgba(255, 215, 0, 0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#ffd700'
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} size="lg" className="fade-in-up" />
            </div>
            
            {/* CSS Grid Layout for Collectors */}
            <div className="fantasy-grid">
              {currentCollectors.map((collector, index) => (
                <FadeInOnScroll key={collector._id || collector.id}>
                  <Card 
                    className="h-100 collector-card"
                    ref={el => collectorCardsRef.current[index] = el}
                  >
                    <Card.Img variant="top" src={collector.image} alt={collector.name} className="card-img" />
                    <Card.Body>
                      <Card.Title>{collector.name}</Card.Title>
                      <Card.Text>
                        {collector.description || getCollectorType(collector.image)}
                      </Card.Text>
                      <Button 
                        as={Link} 
                        to={`/collectors/${collector.id}`} 
                        variant="primary"
                      >
                        {t('viewDetails')}
                      </Button>
                    </Card.Body>
                  </Card>
                </FadeInOnScroll>
              ))}
            </div>
          </div>

          <Row className="mt-4">
            <Col className="d-flex justify-content-center">
              <Pagination>
                {[...Array(Math.ceil(filteredCollectors.length / collectorsPerPage)).keys()].map(number => (
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
    </Container>
  );
};

export default CollectorsScreen;
// --- END OF FILE CollectorsScreen.js ---