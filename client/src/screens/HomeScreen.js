// --- START OF FILE HomeScreen.js ---

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import FadeInOnScroll from '../components/FadeInOnScroll';
import { getItems, getCollectors } from '../services/fileSystemService';
import gsap from 'gsap';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for GSAP animations and double-tap functionality
  const itemCardsRef = useRef([]);
  const collectorCardsRef = useRef([]);
  const lastTapTimeRef = useRef({});
  const isExpandedRef = useRef({});
  const isTouchDeviceRef = useRef(false);

  // Detect touch device
  useEffect(() => {
    isTouchDeviceRef.current = ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      (navigator.msMaxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use our language-aware service functions instead of axios directly
        const itemsData = await getItems(language);
        setItems(itemsData.slice(0, 3));
        
        const collectorsData = await getCollectors(language);
        setCollectors(collectorsData.slice(0, 3));
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [language]); // Re-fetch when language changes

  // Set up GSAP hover effects for desktop and double-tap for touch devices
  useEffect(() => {
    // Clear refs when items change
    itemCardsRef.current = [];
    collectorCardsRef.current = [];
    
    // Setup event handlers for all card elements
    const setupCardEffects = (cardRef, cardId, cardType) => {
      if (!cardRef) return;

      // Store unique identifier for this card
      const cardKey = `${cardType}-${cardId}`;
      if (!isExpandedRef.current[cardKey]) {
        isExpandedRef.current[cardKey] = false;
      }
      
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
      
      // Add event listeners to the card
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
    
    // Set up effects for item cards
    const itemCleanupFns = itemCardsRef.current.map((card, index) => {
      if (!card) return null;
      const itemId = items[index]?._id || items[index]?.id || index;
      return setupCardEffects(card, itemId, 'item');
    });
    
    // Set up effects for collector cards
    const collectorCleanupFns = collectorCardsRef.current.map((card, index) => {
      if (!card) return null;
      const collectorId = collectors[index]?._id || collectors[index]?.id || index;
      return setupCardEffects(card, collectorId, 'collector');
    });
    
    // Clean up all event listeners
    return () => {
      itemCleanupFns.forEach(cleanup => cleanup && cleanup());
      collectorCleanupFns.forEach(cleanup => cleanup && cleanup());
    };
  }, [items, collectors]);

  // Use t() for loading and error messages
  if (loading) return <h2>{t('loading')}</h2>;
  if (error) return <h3>{t('error', { message: error })}</h3>;

  return (
    <Container>
      <FadeInOnScroll>
        <div className="hero-content">
          <h1>{t('appName')}</h1>
          <p className="lead">{t('tagline')}</p>
          <Button as={Link} to="/auction" variant="primary" size="lg" className="mt-4">
            {t('startAuction')}
          </Button>
        </div>
      </FadeInOnScroll>

      <Row className="my-5">
        <Col md={6}>
          <FadeInOnScroll>
            <h2 className="page-heading">{t('featuredItems')}</h2>
            <Row>
              {items.map((item, index) => (
                <Col key={item._id || item.id} md={12} className="mb-3">
                  <FadeInOnScroll>
                    <Card 
                      className="h-100 item-card"
                      ref={el => itemCardsRef.current[index] = el}
                    >
                      <Row>
                        <Col md={4} className="d-flex align-items-center">
                          <Card.Img
                            src={item.image}
                            alt={item.name}
                            style={{ height: '120px', objectFit: 'contain', padding: '0.5rem' }}
                          />
                        </Col>
                        <Col md={8}>
                          <Card.Body>
                            <Card.Title>{item.name}</Card.Title>
                            <Link to={`/items/${item.id}`} className="btn btn-secondary btn-sm">
                              {t('viewDetails')}
                            </Link>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  </FadeInOnScroll>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-4">
              <Button as={Link} to="/items" variant="secondary">
                {t('viewAllItems')}
              </Button>
            </div>
          </FadeInOnScroll>
        </Col>

        <Col md={6}>
          <FadeInOnScroll>
            <h2 className="page-heading">{t('featuredCollectors')}</h2>
            <Row>
              {collectors.map((collector, index) => (
                <Col key={collector._id || collector.id} md={12} className="mb-3">
                  <FadeInOnScroll>
                    <Card 
                      className="h-100 collector-card"
                      ref={el => collectorCardsRef.current[index] = el}
                    >
                      <Row>
                        <Col md={4} className="d-flex align-items-center">
                          <Card.Img
                            src={collector.image}
                            alt={collector.name}
                            style={{ height: '120px', objectFit: 'contain', padding: '0.5rem' }}
                          />
                        </Col>
                        <Col md={8}>
                          <Card.Body>
                            <Card.Title>{collector.name}</Card.Title>
                            <Link to={`/collectors/${collector.id}`} className="btn btn-secondary btn-sm">
                              {t('viewDetails')}
                            </Link>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  </FadeInOnScroll>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-4">
              <Button as={Link} to="/collectors" variant="secondary">
                {t('viewAllCollectors')}
              </Button>
            </div>
          </FadeInOnScroll>
        </Col>
      </Row>

      <FadeInOnScroll>
        <Row className="my-5">
          <Col md={12}>
            <Card bg="dark" className="how-it-works">
              <Card.Body className="text-center">
                <Card.Title as="h3" className="page-heading mb-4">{t('howItWorks')}</Card.Title>
                <ol className="text-start instruction-list">
                  <li>{t('step1')}</li>
                  <li>{t('step2')}</li>
                  <li>{t('step3')}</li>
                  <li>{t('step4')}</li>
                  <li>{t('step5')}</li>
                </ol>
                <Button as={Link} to="/auction" variant="primary" size="lg" className="mt-4">
                  {t('startMatchingNow')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </FadeInOnScroll>
    </Container>
  );
};

export default HomeScreen;
// --- END OF FILE HomeScreen.js ---