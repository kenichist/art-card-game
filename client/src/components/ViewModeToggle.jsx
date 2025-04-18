import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompressAlt, faExpandAlt, faExpand } from '@fortawesome/free-solid-svg-icons';
import { Flip } from 'gsap/Flip';
import gsap from 'gsap';

// Register the GSAP plugin
gsap.registerPlugin(Flip);

/**
 * ViewModeToggle Component
 * Provides buttons to toggle between small, medium, and large view modes
 * Uses GSAP Flip for smooth animations when changing grid layouts
 */
const ViewModeToggle = ({ 
  onViewModeChange, 
  initialMode = 'medium',
  containerSelector = '.fantasy-grid'
}) => {
  const [viewMode, setViewMode] = useState(initialMode);
  const containerRef = useRef(null);
  
  // Update the containerRef when component mounts
  useEffect(() => {
    containerRef.current = document.querySelector(containerSelector);
  }, [containerSelector]);

  const handleViewModeChange = (mode) => {
    // Don't do anything if it's the same mode
    if (mode === viewMode) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Get the state before the change
    const state = Flip.getState(container.children);
    
    // Set the new view mode and notify parent component
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
    
    // First remove all existing size classes
    container.classList.remove('size-small', 'size-medium', 'size-large');
    
    // Add the new size class
    container.classList.add(`size-${mode}`);
    
    // Perform the GSAP Flip animation
    Flip.from(state, {
      duration: 0.5,
      ease: "power1.out",
      stagger: 0.05,
      absolute: true,
      onComplete: () => {
        // Any cleanup or additional callbacks after animation completes
      }
    });
  };
  
  return (
    <div className="view-mode-toggle mb-4">
      <span className="me-2 toggle-label">View Size:</span>
      <ButtonGroup>
        <Button 
          variant={viewMode === 'small' ? 'primary' : 'secondary'} 
          onClick={() => handleViewModeChange('small')}
          className="fantasy-btn"
          title="Small view"
        >
          <FontAwesomeIcon icon={faCompressAlt} /> S
        </Button>
        
        <Button 
          variant={viewMode === 'medium' ? 'primary' : 'secondary'} 
          onClick={() => handleViewModeChange('medium')}
          className="fantasy-btn"
          title="Medium view"
        >
          <FontAwesomeIcon icon={faExpandAlt} /> M
        </Button>
        
        <Button 
          variant={viewMode === 'large' ? 'primary' : 'secondary'} 
          onClick={() => handleViewModeChange('large')}
          className="fantasy-btn"
          title="Large view"
        >
          <FontAwesomeIcon icon={faExpand} /> L
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default ViewModeToggle;