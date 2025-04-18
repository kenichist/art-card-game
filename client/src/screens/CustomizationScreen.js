import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Nav, Alert, Tabs, Tab } from 'react-bootstrap';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  getItems, 
  getCollectors, 
  updateItemCustomization,
  updateCollectorCustomization
} from '../services/fileSystemService';
import FadeInOnScroll from '../components/FadeInOnScroll';

const CustomizationScreen = () => {
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form data for customization
  const [formData, setFormData] = useState({
    titleEn: '',
    titleZh: '',
    descriptionEn: '',
    descriptionZh: ''
  });

  // Load items and collectors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // We need both languages for the form
        const enItems = await getItems('en');
        const zhItems = await getItems('zh');
        const enCollectors = await getCollectors('en');
        const zhCollectors = await getCollectors('zh');

        // Merge the items and add language-specific data
        const mergedItems = enItems.map(item => {
          const zhItem = zhItems.find(i => i.id === item.id) || {};
          return {
            ...item,
            titleZh: zhItem.name || '',
            descriptionZh: zhItem.description || '',
            titleEn: item.name || '',
            descriptionEn: item.description || ''
          };
        });

        const mergedCollectors = enCollectors.map(collector => {
          const zhCollector = zhCollectors.find(c => c.id === collector.id) || {};
          return {
            ...collector,
            titleZh: zhCollector.name || '',
            descriptionZh: zhCollector.description || '',
            titleEn: collector.name || '',
            descriptionEn: collector.description || ''
          };
        });

        setItems(mergedItems);
        setCollectors(mergedCollectors);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  // Handle item selection
  const handleSelectItem = (id) => {
    setSelectedItemId(id);
    setSelectedCollectorId(null);
    setActiveTab('items');
    
    const selectedItem = items.find(item => item.id === id);
    if (selectedItem) {
      setFormData({
        titleEn: selectedItem.titleEn || '',
        titleZh: selectedItem.titleZh || '',
        descriptionEn: selectedItem.descriptionEn || '',
        descriptionZh: selectedItem.descriptionZh || ''
      });
    }
    
    // Clear any previous messages
    setError(null);
    setSuccess(null);
  };

  // Handle collector selection
  const handleSelectCollector = (id) => {
    setSelectedCollectorId(id);
    setSelectedItemId(null);
    setActiveTab('collectors');
    
    const selectedCollector = collectors.find(collector => collector.id === id);
    if (selectedCollector) {
      setFormData({
        titleEn: selectedCollector.titleEn || '',
        titleZh: selectedCollector.titleZh || '',
        descriptionEn: selectedCollector.descriptionEn || '',
        descriptionZh: selectedCollector.descriptionZh || ''
      });
    }
    
    // Clear any previous messages
    setError(null);
    setSuccess(null);
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const customData = {
        title_en: formData.titleEn,
        title_zh: formData.titleZh,
        description_en: formData.descriptionEn,
        description_zh: formData.descriptionZh
      };
      
      if (selectedItemId) {
        // Update item customization
        await updateItemCustomization(selectedItemId, customData);
        
        // Update the local items list
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === selectedItemId
              ? {
                  ...item,
                  titleEn: formData.titleEn,
                  titleZh: formData.titleZh,
                  descriptionEn: formData.descriptionEn,
                  descriptionZh: formData.descriptionZh,
                  customized: true
                }
              : item
          )
        );
        
        setSuccess(`Item ${selectedItemId} customization saved successfully!`);
      } else if (selectedCollectorId) {
        // Update collector customization
        await updateCollectorCustomization(selectedCollectorId, customData);
        
        // Update the local collectors list
        setCollectors(prevCollectors => 
          prevCollectors.map(collector => 
            collector.id === selectedCollectorId
              ? {
                  ...collector,
                  titleEn: formData.titleEn,
                  titleZh: formData.titleZh,
                  descriptionEn: formData.descriptionEn,
                  descriptionZh: formData.descriptionZh,
                  customized: true
                }
              : collector
          )
        );
        
        setSuccess(`Collector ${selectedCollectorId} customization saved successfully!`);
      }
      
      setSaving(false);
    } catch (error) {
      setError(error.message);
      setSaving(false);
    }
  };

  return (
    <Container>
      <FadeInOnScroll>
        <h1 className="page-heading my-4">Card Customization</h1>
        <p className="lead mb-4">Customize the titles and descriptions for your cards.</p>
      </FadeInOnScroll>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Tabs 
        activeKey={activeTab} 
        onSelect={(key) => setActiveTab(key)}
        className="mb-4"
      >
        <Tab eventKey="items" title="Item Cards">
          <Row className="mt-3">
            <Col md={4} className="mb-4">
              <Card>
                <Card.Header>Select an Item Card</Card.Header>
                <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <Nav className="flex-column">
                    {items.map(item => (
                      <Nav.Link 
                        key={item.id}
                        onClick={() => handleSelectItem(item.id)}
                        active={selectedItemId === item.id}
                        className={item.customized ? "text-primary" : ""}
                      >
                        {item.customized ? '✓ ' : ''}{item.name} (ID: {item.id})
                      </Nav.Link>
                    ))}
                  </Nav>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={8}>
              {selectedItemId ? (
                <Card>
                  <Card.Header>
                    <Row>
                      <Col>Customize Item #{selectedItemId}</Col>
                      <Col className="text-end">
                        <img 
                          src={items.find(i => i.id === selectedItemId)?.image} 
                          alt={`Item ${selectedItemId}`}
                          style={{ height: '50px', objectFit: 'contain' }}
                        />
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <h5>English</h5>
                          <Form.Group className="mb-3">
                            <Form.Label>Title (English)</Form.Label>
                            <Form.Control
                              type="text"
                              name="titleEn"
                              value={formData.titleEn}
                              onChange={handleInputChange}
                              placeholder="Enter title in English"
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Description (English)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              name="descriptionEn"
                              value={formData.descriptionEn}
                              onChange={handleInputChange}
                              placeholder="Enter description in English"
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <h5>中文 (Chinese)</h5>
                          <Form.Group className="mb-3">
                            <Form.Label>标题 (Chinese Title)</Form.Label>
                            <Form.Control
                              type="text"
                              name="titleZh"
                              value={formData.titleZh}
                              onChange={handleInputChange}
                              placeholder="输入中文标题"
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>描述 (Chinese Description)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              name="descriptionZh"
                              value={formData.descriptionZh}
                              onChange={handleInputChange}
                              placeholder="输入中文描述"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2">
                        <Button 
                          type="submit" 
                          variant="primary" 
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Customization'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="info">
                  Please select an item card from the list to customize its title and description.
                </Alert>
              )}
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="collectors" title="Collector Cards">
          <Row className="mt-3">
            <Col md={4} className="mb-4">
              <Card>
                <Card.Header>Select a Collector Card</Card.Header>
                <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <Nav className="flex-column">
                    {collectors.map(collector => (
                      <Nav.Link 
                        key={collector.id}
                        onClick={() => handleSelectCollector(collector.id)}
                        active={selectedCollectorId === collector.id}
                        className={collector.customized ? "text-primary" : ""}
                      >
                        {collector.customized ? '✓ ' : ''}{collector.name} (ID: {collector.id})
                      </Nav.Link>
                    ))}
                  </Nav>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={8}>
              {selectedCollectorId ? (
                <Card>
                  <Card.Header>
                    <Row>
                      <Col>Customize Collector #{selectedCollectorId}</Col>
                      <Col className="text-end">
                        <img 
                          src={collectors.find(c => c.id === selectedCollectorId)?.image} 
                          alt={`Collector ${selectedCollectorId}`}
                          style={{ height: '50px', objectFit: 'contain' }}
                        />
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <h5>English</h5>
                          <Form.Group className="mb-3">
                            <Form.Label>Title (English)</Form.Label>
                            <Form.Control
                              type="text"
                              name="titleEn"
                              value={formData.titleEn}
                              onChange={handleInputChange}
                              placeholder="Enter title in English"
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Description (English)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              name="descriptionEn"
                              value={formData.descriptionEn}
                              onChange={handleInputChange}
                              placeholder="Enter description in English"
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <h5>中文 (Chinese)</h5>
                          <Form.Group className="mb-3">
                            <Form.Label>标题 (Chinese Title)</Form.Label>
                            <Form.Control
                              type="text"
                              name="titleZh"
                              value={formData.titleZh}
                              onChange={handleInputChange}
                              placeholder="输入中文标题"
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>描述 (Chinese Description)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              name="descriptionZh"
                              value={formData.descriptionZh}
                              onChange={handleInputChange}
                              placeholder="输入中文描述"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2">
                        <Button 
                          type="submit" 
                          variant="primary" 
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Customization'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="info">
                  Please select a collector card from the list to customize its title and description.
                </Alert>
              )}
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default CustomizationScreen;