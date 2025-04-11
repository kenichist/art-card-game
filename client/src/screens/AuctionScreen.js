// --- START OF FILE AuctionScreen.js ---

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup } from 'react-bootstrap';
// Import useLocation
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AuctionScreen = () => {
  const { t } = useTranslation();
  // Get location object to access state passed during navigation
  const location = useLocation();
  const requestedItemIdFromState = location.state?.requestedItemId; // Get the ID passed from ItemDetailScreen

  const [activeItem, setActiveItem] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clear state passed via navigation after reading it once (optional)
    // window.history.replaceState({}, document.title);

    const fetchActiveAuction = async () => {
      let currentAuctionItemId = null; // The ID of the item in the globally active auction (if any)
      let itemToActivate = null; // The item object we intend to make active

      try {
        setLoading(true);
        setError(null);

        // 1. Check if there's already an active auction globally
        try {
          const { data: activeAuction } = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/active`);
          currentAuctionItemId = activeAuction?.itemId;
          console.log(`Found active auction for item ID: ${currentAuctionItemId}`);
        } catch (fetchError) {
          if (fetchError.response?.status !== 404) {
            // If error is something other than 'Not Found', throw it
            throw fetchError;
          }
          // 404 means no active auction, proceed to potentially start one
          console.log("No active auction found.");
        }

        // 2. Determine which item to load
        if (currentAuctionItemId) {
          // Load the item from the existing active auction
          const itemRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/${currentAuctionItemId}`);
          itemToActivate = itemRes.data;
        } else {
          // No active auction exists - check if a specific item was requested via navigation state
          if (requestedItemIdFromState) {
            console.log(`Attempting to start auction with requested item ID: ${requestedItemIdFromState}`);
            try {
              // Fetch the specific requested item
              const itemRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/${requestedItemIdFromState}`);
              itemToActivate = itemRes.data;
              // Create a new auction record for this specific item
              await axios.post(`${process.env.REACT_APP_API_URL}/api/auctions`, {
                  itemId: itemToActivate.id,
                  status: 'active'
              });
               console.log(`Started new auction specifically for item ${itemToActivate.id}`);
            } catch (requestedItemError) {
                 console.error(`Failed to fetch requested item ${requestedItemIdFromState}:`, requestedItemError);
                 setError(t('errorFetchingRequestedItem', { id: requestedItemIdFromState }));
                 // Fallback to random item if requested one fails? Or just show error? For now, show error.
                 // Setting itemToActivate to null will prevent auction from starting below if error occurred
                 itemToActivate = null;
            }
          } else {
            // No active auction AND no specific item requested - pick a random one
            console.log("No requested item ID found, selecting a random item.");
            const itemsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
            if (itemsRes.data.length > 0) {
              const availableItems = itemsRes.data; // TODO: Filter completed?
              if (availableItems.length > 0) {
                  const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                  itemToActivate = randomItem;
                  // Create a new auction record for this random item
                  await axios.post(`${process.env.REACT_APP_API_URL}/api/auctions`, {
                      itemId: itemToActivate.id,
                      status: 'active'
                  });
                  console.log(`Started new auction randomly for item ${itemToActivate.id}`);
              } else {
                   setError(t('noAvailableItems'));
              }
            } else {
               setError(t('noItemsFound'));
            }
          }
        }

        // 3. Set the active item state if one was successfully determined
        if (itemToActivate) {
             setActiveItem(itemToActivate);
        } else if (!error) {
            // If no item was activated and no error was explicitly set, set a generic error.
            // This might happen if fetching the requested item failed without setting error above.
             setError(t('errorNoItemActivated'));
        }


        // 4. Fetch collectors (always needed if an item was potentially activated)
        // Only fetch collectors if we expect to display the auction screen
        if (itemToActivate || currentAuctionItemId) {
            const collectorsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
            setCollectors(collectorsRes.data);
        }

      } catch (err) { // Catch errors from getting active auction or other unexpected issues
        console.error("Error during auction setup:", err);
        setError(err.response?.data?.message || err.message || t('errorAuctionSetup'));
        setActiveItem(null); // Ensure no item is shown if setup failed
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAuction();
     // Add requestedItemIdFromState to dependency array? No, because we only want to read it ONCE on mount.
     // The effect should run based on component mount, not location state changes after mount.
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // ... (rest of the component: selectCollector, handleMatch, handleNextItem, JSX) ...
  // The handleNextItem logic should remain largely the same - it completes the *current*
  // auction and starts a new *random* one, it doesn't care how the completed one started.

  // --- NO CHANGES NEEDED BELOW THIS LINE FOR THIS SPECIFIC FIX ---

  const selectCollector = (collector) => {
    setSelectedCollector(collector);
    setMatchResult(null); // Reset match result when selecting a new collector
  };

  const handleMatch = async () => {
    if (!activeItem || !selectedCollector) return;
    try {
      setLoading(true); // Set loading state specifically for match operation
      setError(null);
      setMatchResult(null); // Clear previous results

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auctions/match/${activeItem.id}/${selectedCollector.id}`
      );
      setMatchResult(data);
    } catch (err) {
      console.error("Error matching item:", err);
      setError(err.response?.data?.message || err.message || t('errorMatching'));
    } finally {
      setLoading(false); // Clear loading state for match operation
    }
  };

   const handleNextItem = async () => {
    setLoading(true);
    setError(null);
    const currentActiveItemId = activeItem?.id; // Store ID before clearing state
    setActiveItem(null);
    setSelectedCollector(null);
    setMatchResult(null);

    try {
      // Attempt to find and complete the current active auction (using the ID we just had)
      let activeAuctionId = null;
      if(currentActiveItemId) { // Only search if we had an active item
          try {
              // Find the auction based on the itemId being active
              const activeAuctionRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/active`);
              // Double check if the found active auction matches the item we just completed
              if (activeAuctionRes.data?.itemId === currentActiveItemId) {
                 activeAuctionId = activeAuctionRes.data?._id; // Use MongoDB _id
              } else {
                  console.warn("Found active auction, but its item ID doesn't match the one just displayed.");
              }
          } catch (findError) {
              if (findError.response?.status !== 404) {
                  throw findError; // Re-throw if it's not a 'not found' error
              }
               console.log("No active auction found to complete, proceeding to next item.");
          }
      }


      if (activeAuctionId) {
          // Mark auction as completed using its MongoDB _id
          await axios.put(`${process.env.REACT_APP_API_URL}/api/auctions/${activeAuctionId}`, {
              status: 'completed',
              winnerCollectorId: matchResult?.matchedDescriptions.length > 0 ? selectedCollector?.id : null, // Optional: record winner if match was successful
              finalValue: matchResult?.totalValue // Optional: record final value
          });
          console.log(`Auction ${activeAuctionId} completed.`);
      } else {
          console.log("Could not find a matching active auction to complete.");
      }

      // Get items and filter out completed ones (more robust approach)
      const [itemsRes, auctionsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/items`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/auctions?status=completed`) // Fetch completed auctions
      ]);

      const allItems = itemsRes.data;
      const completedItemIds = new Set(auctionsRes.data.map(auc => auc.itemId));

      const availableItems = allItems.filter(item => !completedItemIds.has(item.id));

      if (availableItems.length > 0) {
        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        setActiveItem(randomItem);

        // Create a new auction with this item
        await axios.post(`${process.env.REACT_APP_API_URL}/api/auctions`, {
          itemId: randomItem.id,
          status: 'active'
        });
        console.log(`Started new auction for item ${randomItem.id}`);

      } else {
         setError(t('noMoreItems'));
         console.log("No items left to start a new auction.");
      }

    } catch (err) {
      console.error("Error handling next item:", err);
      setError(err.response?.data?.message || err.message || t('errorNextItem'));
    } finally {
      setLoading(false);
    }
  };


  if (loading && !activeItem) return <h2>{t('loading')}</h2>;
  if (error && !activeItem && !loading) return <h3>{t('error', { message: error })}</h3>;

  // --- JSX REMAINS THE SAME ---
   return (
    <Container>
      <h1 className="my-4">{t('auctionRoom')}</h1>

      {error && activeItem && <Alert variant="danger">{t('error', { message: error })}</Alert>}

      {activeItem ? (
        <Row className="mb-4">
          <Col md={12}>
            <h2>{t('currentItem')}</h2>
            <Card>
            <Row className="g-0"> {/* Use g-0 class for no gutters (Bootstrap 5) */}
                <Col md={4} className="d-flex align-items-center justify-content-center p-2">
                  <img
                    src={activeItem.image}
                    alt={activeItem.name}
                    className="img-fluid"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Col>
                <Col md={8}>
                  <Card.Body>
                    <Card.Title>{activeItem.name}</Card.Title>
                    <h4>{t('descriptions')}</h4>
                    {activeItem.descriptions.length > 0 ? (
                         <ListGroup variant="flush">
                         {activeItem.descriptions.map((desc, index) => (
                           <ListGroup.Item key={index} className="px-0 py-1">
                             {desc.attribute}
                           </ListGroup.Item>
                         ))}
                       </ListGroup>
                    ) : (
                        <p>{t('noDescriptions')}</p>
                    )}
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ) : (
         loading ? <p>{t('loadingNextItem') || 'Loading next item...'}</p> :
         !error && <p>{t('noMoreItems') || 'No more items available.'}</p>
      )}

      {activeItem && (
        <Row className="mb-4">
          <Col md={12}>
            <h2>{t('selectCollectorCard')}</h2>
            <Row>
              {collectors.map(collector => (
                <Col key={collector._id || collector.id} md={4} lg={3} className="mb-3 d-flex">
                  <Card
                    onClick={() => selectCollector(collector)}
                    className={`h-100 ${selectedCollector?.id === collector.id ? 'border-primary border-2' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Img
                      variant="top"
                      src={collector.image}
                      alt={collector.name}
                      className="p-2"
                      style={{ height: '180px', objectFit: 'contain' }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{collector.name}</Card.Title>
                      <h5 className="mt-2">{t('descriptions')}</h5>
                      {collector.descriptions.length > 0 ? (
                        <ListGroup variant="flush" className="flex-grow-1">
                          {collector.descriptions.map((desc, index) => (
                             <ListGroup.Item key={index} className="px-0 py-1">
                                {desc.attribute}: <span className="desc-value">{desc.value}{t('valueSuffix') || ''}</span>
                             </ListGroup.Item>
                          ))}
                       </ListGroup>
                      ) : (
                           <p className="flex-grow-1">{t('noDescriptions')}</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}


      {activeItem && (
        <Row className="mb-4">
          <Col className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleMatch}
              disabled={!selectedCollector || !activeItem || loading}
            >
              {loading && matchResult === null ? t('loading') : t('matchItemCollector')}
            </Button>
          </Col>
        </Row>
      )}


      {matchResult && (
        <Row className="mb-4">
          <Col md={12}>
            <Card bg="light">
              <Card.Body>
                <Card.Title>{t('matchResults')}</Card.Title>
                <h4>{t('matchedDescriptions')}</h4>
                {matchResult.matchedDescriptions.length > 0 ? (
                  <ListGroup variant="flush">
                    {matchResult.matchedDescriptions.map((desc, index) => (
                       <ListGroup.Item key={index} className="bg-light">
                        {desc.attribute}: <span className="desc-value">{desc.value}{t('valueSuffix') || ''}</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>{t('noMatch')}</p>
                )}
                <h3 className="mt-3">{t('totalValue', { value: matchResult.totalValue })}</h3>
                <Button
                  variant="success"
                  onClick={handleNextItem}
                  className="mt-3"
                  disabled={loading}
                >
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