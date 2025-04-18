import React, { useRef, useEffect, useState } from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Calculate optimal delay based on position
const calculateOptimalDelay = (index, cardsPerRow) => {
  // Calculate which row and column the card is in
  const row = Math.floor(index / cardsPerRow);
  const col = index % cardsPerRow;
  
  // Base delay for cards in the same row
  const baseDelay = 120; // slightly faster than before

  // Use a smaller delay between rows
  return (col + row * cardsPerRow) * baseDelay;
};

const DealingCardAnimation = ({ collector, onBidClick, disabled, index }) => {
  const { t } = useTranslation();
  const cardRef = useRef(null);
  const [cardsPerRow, setCardsPerRow] = useState(3); // Default to 3 cards per row (lg-4 columns)

  // Update cards per row based on screen width
  useEffect(() => {
    const updateCardsPerRow = () => {
      // Match the Bootstrap breakpoints
      if (window.innerWidth >= 992) { // lg breakpoint
        setCardsPerRow(3); // lg-4 = 3 cards per row
      } else if (window.innerWidth >= 768) { // md breakpoint
        setCardsPerRow(2); // md-6 = 2 cards per row
      } else {
        setCardsPerRow(1); // sm-12 = 1 card per row
      }
    };

    // Set initial value
    updateCardsPerRow();

    // Add resize listener
    window.addEventListener('resize', updateCardsPerRow);

    // Cleanup
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  // Calculate animation delay based on optimal timing
  const animationDelay = calculateOptimalDelay(index, cardsPerRow);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add the animation class when the card becomes visible
            entry.target.classList.add('deal-animation');
            // Once animation has been triggered, we don't need to observe anymore
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15, // Trigger when at least 10% of the card is visible
        rootMargin: '900px', // Add a small margin to trigger slightly earlier
      }
    );

    // Store current ref value in a variable
    const currentCard = cardRef.current;

    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      // Use the stored variable in cleanup
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  // Add animation CSS directly to this component
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.innerHTML = `
      .card-container {
        perspective: 1000px;
        transform-style: preserve-3d;
        opacity: 0;
        visibility: hidden;
      }
      
      .deal-animation {
        animation: dealCard 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        animation-delay: var(--animation-delay, 0ms);
        visibility: visible;
      }
      
      @keyframes dealCard {
        0% {
          opacity: 0;
          transform: translateY(80px) rotate(15deg) scale(0.7);
          transform-origin: bottom right;
        }
        50% {
          opacity: 1;
          transform: translateY(-20px) rotate(-5deg) scale(1.05);
        }
        75% {
          transform: translateY(10px) rotate(2deg) scale(0.98);
        }
        100% {
          opacity: 1;
          transform: translateY(0) rotate(0) scale(1);
        }
      }
      
      .card-hover-effect {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .card-hover-effect:hover {
        transform: translateY(-10px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div 
      ref={cardRef} 
      className="card-container"
      style={{
        '--animation-delay': `${animationDelay}ms`
      }}
    >
      <Card className="h-100 card-hover-effect">
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
            onClick={() => onBidClick(collector.id)}
            disabled={disabled}
          >
            {disabled ? t('noActiveAuction') : t('placeBid')}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DealingCardAnimation;