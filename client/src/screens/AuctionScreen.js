// --- START OF FILE AuctionScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const AuctionScreen = () => {
  const { t } = useTranslation(); // Get translation function
  const [activeItem, setActiveItem] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveAuction = async () => {
      let currentAuctionItemId = null;
      try {
        setLoading(true);
        // Try fetching active auction
        try {
          const { data: activeAuction } = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/active`);
          currentAuctionItemId = activeAuction?.itemId;
        } catch (fetchError) {
          // If 404 (no active auction), ignore, otherwise re-throw
          if (fetchError.response?.status !== 404) {
            throw fetchError;
          }
          console.log("No active auction found, selecting a new item.");
        }

        if (currentAuctionItemId) {
          // Fetch details of the active item
          const itemRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/${currentAuctionItemId}`);
          setActiveItem(itemRes.data);
        } else {
          // No active auction or error fetching it, select a random item
          const itemsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
          if (itemsRes.data.length > 0) {
            const availableItems = itemsRes.data; // Consider filtering out already auctioned items if needed
            if (availableItems.length > 0) {
                const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                setActiveItem(randomItem);
                // Create a new auction with this item
                await axios.post(`${process.env.REACT_APP_API_URL}/api/auctions`, {
                    itemId: randomItem.id,
                    status: 'active'
                });
            } else {
                 setError("No available items to auction.");
            }
          } else {
             setError("No items found in the database.");
          }
        }

        // Fetch collectors (always needed)
        const collectorsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
        setCollectors(collectorsRes.data);

      } catch (error) {
        console.error("Error during auction setup:", error);
        setError(error.response?.data?.message || error.message || "An unknown error occurred during auction setup.");
      } finally {
        setLoading(false);
      }
    };
    fetchActiveAuction();
  }, []);


  const selectCollector = (collector) => {
    setSelectedCollector(collector);
    setMatchResult(null); // Reset match result when selecting a new collector
  };

  const handleMatch = async () => {
    if (!activeItem || !selectedCollector) return;
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auctions/match/${activeItem.id}/${selectedCollector.id}`
      );
      setMatchResult(data);
    } catch (error) {
      console.error("Error matching item:", error);
      setError(error.response?.data?.message || error.message || "Failed to match item.");
    } finally {
      setLoading(false);
    }
  };

   const handleNextItem = async () => {
    try {
      setLoading(true);
      setError(null);
      setActiveItem(null);
      setSelectedCollector(null);
      setMatchResult(null);

      // Attempt to find and complete the current active auction
      let activeAuctionId = null;
      try {
          const activeAuctionRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/active`);
          activeAuctionId = activeAuctionRes.data?._id;
      } catch (findError) {
          if (findError.response?.status !== 404) {
              throw findError; // Re-throw if it's not a 'not found' error
          }
           console.log("No active auction found to complete, proceeding to next item.");
      }

      if (activeAuctionId) {
          await axios.put(`${process.env.REACT_APP_API_URL}/api/auctions/${activeAuctionId}`, {
              status: 'completed'
          });
          console.log(`Auction ${activeAuctionId} completed.`);
      }

      // Get a new random item
      const itemsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
       // Ideally, filter out items that were part of 'completed' auctions
       // For simplicity now, just pick a random one from all items
      if (itemsRes.data.length > 0) {
        const randomItem = itemsRes.data[Math.floor(Math.random() * itemsRes.data.length)];
        setActiveItem(randomItem);

        // Create a new auction with this item
        await axios.post(`${process.env.REACT_APP_API_URL}/api/auctions`, {
          itemId: randomItem.id,
          status: 'active'
        });
        console.log(`Started new auction for item ${randomItem.id}`);

      } else {
         setError("No more items available for auction.");
         console.log("No items left to start a new auction.");
      }

    } catch (error) {
      console.error("Error handling next item:", error);
      setError(error.response?.data?.message || error.message || "Failed to proceed to the next item.");
    } finally {
      setLoading(false);
    }
  };


  // Use t() for loading and error messages
  if (loading && !activeItem) return <h2>{t('loading')}</h2>; // Show loading only initially
  if (error && !activeItem) return <h3>{t('error', { message: error })}</h3>; // Show initial error only if no item loaded


  return (
    <Container>
      {/* Use t() for title */}
      <h1 className="my-4">{t('auctionRoom')}</h1>

      {/* Display error messages if they occur after initial load */}
      {error && <Alert variant="danger">{t('error', { message: error })}</Alert>}

      {/* Active Item */}
      {activeItem ? (
        <Row className="mb-4">
          <Col md={12}>
            {/* Use t() for section title */}
            <h2>{t('currentItem')}</h2>
            <Card>
              <Row>
                <Col md={4}>
                  <Card.Img
                    src={activeItem.image}
                    alt={activeItem.name} // Alt text
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Col>
                <Col md={8}>
                  <Card.Body>
                    <Card.Title>{activeItem.name}</Card.Title>
                     {/* Use t() for section title */}
                    <h4>{t('descriptions')}</h4>
                    <ul>
                      {activeItem.descriptions.map((desc, index) => (
                        <li key={index}>
                          {desc.attribute}: {desc.value}{t('valueSuffix')}
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ) : (
         !loading && !error && <p>{t('loading')} {/* Or a specific message like "Selecting next item..." */}</p>
      )}

      {/* Collectors */}
      <Row className="mb-4">
        <Col md={12}>
           {/* Use t() for section title */}
          <h2>{t('selectCollectorCard')}</h2>
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
                    alt={collector.name} // Alt text
                    style={{ height: '200px', objectFit: 'contain' }}
                  />
                  <Card.Body>
                    <Card.Title>{collector.name}</Card.Title>
                    {/* Use t() for section title */}
                    <h5>{t('descriptions')}</h5>
                    <ul>
                      {collector.descriptions.map((desc, index) => (
                        <li key={index}>
                          {desc.attribute}: {desc.value}{t('valueSuffix')}
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
            disabled={!selectedCollector || !activeItem || loading} // Disable while loading match
          >
            {/* Use t() for button text */}
            {loading && matchResult === null ? t('loading') : t('matchItemCollector')}
          </Button>
        </Col>
      </Row>

      {/* Match Results */}
      {matchResult && (
        <Row className="mb-4">
          <Col md={12}>
            <Card bg="light">
              <Card.Body>
                {/* Use t() for titles and text */}
                <Card.Title>{t('matchResults')}</Card.Title>
                <h4>{t('matchedDescriptions')}</h4>
                {matchResult.matchedDescriptions.length > 0 ? (
                  <ul>
                    {matchResult.matchedDescriptions.map((desc, index) => (
                      <li key={index}>
                        {desc.attribute}: {desc.value}{t('valueSuffix')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{t('noMatch')}</p>
                )}
                {/* Use t() for total value with interpolation */}
                <h3>{t('totalValue', { value: matchResult.totalValue })}</h3>
                <Button
                  variant="success"
                  onClick={handleNextItem}
                  className="mt-3"
                  disabled={loading} // Disable while loading next item
                >
                   {/* Use t() for button text */}
                  {loading && activeItem === null ? t('loading') : t('nextItem')}
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
// --- END OF FILE AuctionScreen.js ---