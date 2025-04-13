// --- START OF FILE CollectorsScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Pagination, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FadeInOnScroll from '../components/FadeInOnScroll';
import { getCollectors } from '../services/fileSystemService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';

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

  const filteredCollectors = collectors.filter(collector => 
    collector.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getCollectorType(collector.image).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCollector = currentPage * collectorsPerPage;
  const indexOfFirstCollector = indexOfLastCollector - collectorsPerPage;
  const currentCollectors = filteredCollectors.slice(indexOfFirstCollector, indexOfLastCollector);
  
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
            
            <Row>
              {currentCollectors.map(collector => (
                <Col key={collector._id || collector.id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                  <FadeInOnScroll>
                    <Card className="collector-card h-100">
                      <Card.Img
                        variant="top"
                        src={collector.image}
                        alt={collector.name}
                        style={{ height: '200px', objectFit: 'contain' }}
                      />
                      <Card.Body>
                        <Card.Title>{collector.name}</Card.Title>
                        <Card.Text>
                          {t('descriptionCount', { count: collector.descriptions ? collector.descriptions.length : 0 })}
                        </Card.Text>
                        <Button
                          as={Link}
                          to={`/collectors/${collector.id}`}
                          variant="primary"
                          className="w-100"
                        >
                          {t('viewDetails')}
                        </Button>
                      </Card.Body>
                    </Card>
                  </FadeInOnScroll>
                </Col>
              ))}
            </Row>
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

const getCollectorType = (imageUrl) => {
  const filename = imageUrl.split('/').pop();
  
  if (filename.startsWith('i')) {
    return 'Illustration Collector';
  } else if (filename.startsWith('p')) {
    return 'Product Collector';
  } else if (filename.startsWith('s')) {
    return 'Sculpture Collector';
  }
  
  return 'Collector';
};

export default CollectorsScreen;
// --- END OF FILE CollectorsScreen.js ---