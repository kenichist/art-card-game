import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const UploadScreen = () => {
  const [itemFile, setItemFile] = useState(null);
  const [collectorFile, setCollectorFile] = useState(null);
  const [itemName, setItemName] = useState('');
  const [collectorName, setCollectorName] = useState('');
  const [itemDescriptions, setItemDescriptions] = useState([
    { attribute: '', value: 0 }
  ]);
  const [collectorDescriptions, setCollectorDescriptions] = useState([
    { attribute: '', value: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Handle adding a new description field
  const addItemDescription = () => {
    setItemDescriptions([...itemDescriptions, { attribute: '', value: 0 }]);
  };

  const addCollectorDescription = () => {
    setCollectorDescriptions([...collectorDescriptions, { attribute: '', value: 0 }]);
  };

  // Handle description field changes
  const handleItemDescriptionChange = (index, field, value) => {
    const newDescriptions = [...itemDescriptions];
    newDescriptions[index][field] = field === 'value' ? Number(value) : value;
    setItemDescriptions(newDescriptions);
  };

  const handleCollectorDescriptionChange = (index, field, value) => {
    const newDescriptions = [...collectorDescriptions];
    newDescriptions[index][field] = field === 'value' ? Number(value) : value;
    setCollectorDescriptions(newDescriptions);
  };

  // Handle item upload
  const handleItemUpload = async (e) => {
    e.preventDefault();
    
    if (!itemFile || !itemName || itemDescriptions.some(desc => !desc.attribute)) {
      setMessage({
        type: 'danger',
        text: 'Please fill all item fields and select an image'
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('image', itemFile);
    formData.append('name', itemName);
    
    // Get the next available ID
    try {
      setLoading(true);
      const { data: items } = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
      const nextId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
      
      formData.append('id', nextId);
      formData.append('descriptions', JSON.stringify(itemDescriptions));
      
      await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage({
        type: 'success',
        text: `Item uploaded successfully with ID: ${nextId}`
      });
      
      // Reset form
      setItemFile(null);
      setItemName('');
      setItemDescriptions([{ attribute: '', value: 0 }]);
      
      setLoading(false);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message
      });
      setLoading(false);
    }
  };

  // Handle collector upload
  const handleCollectorUpload = async (e) => {
    e.preventDefault();
    
    if (!collectorFile || !collectorName || collectorDescriptions.some(desc => !desc.attribute)) {
      setMessage({
        type: 'danger',
        text: 'Please fill all collector fields and select an image'
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('image', collectorFile);
    formData.append('name', collectorName);
    
    // Get the next available ID
    try {
      setLoading(true);
      const { data: collectors } = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
      const nextId = collectors.length > 0 ? Math.max(...collectors.map(collector => collector.id)) + 1 : 1;
      
      formData.append('id', nextId);
      formData.append('descriptions', JSON.stringify(collectorDescriptions));
      
      await axios.post('/api/collectors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage({
        type: 'success',
        text: `Collector uploaded successfully with ID: ${nextId}`
      });
      
      // Reset form
      setCollectorFile(null);
      setCollectorName('');
      setCollectorDescriptions([{ attribute: '', value: 0 }]);
      
      setLoading(false);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message
      });
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Upload New Cards</h1>
      
      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}
      
      <Row>
        {/* Item Upload Form */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h4">Upload Item</Card.Header>
            <Card.Body>
              <Form onSubmit={handleItemUpload}>
                <Form.Group controlId="itemName" className="mb-3">
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter item name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group controlId="itemImage" className="mb-3">
                  <Form.Label>Item Image</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setItemFile(e.target.files[0])}
                  />
                </Form.Group>
                
                <Form.Label>Item Descriptions</Form.Label>
                {itemDescriptions.map((desc, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={8}>
                      <Form.Control
                        placeholder="Description attribute"
                        value={desc.attribute}
                        onChange={(e) => handleItemDescriptionChange(index, 'attribute', e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder="Value"
                        value={desc.value}
                        onChange={(e) => handleItemDescriptionChange(index, 'value', e.target.value)}
                      />
                    </Col>
                  </Row>
                ))}
                
                <Button 
                  variant="secondary" 
                  onClick={addItemDescription} 
                  className="mb-3"
                >
                  Add Description
                </Button>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Uploading...' : 'Upload Item'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Collector Upload Form */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h4">Upload Collector</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCollectorUpload}>
                <Form.Group controlId="collectorName" className="mb-3">
                  <Form.Label>Collector Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter collector name"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group controlId="collectorImage" className="mb-3">
                  <Form.Label>Collector Image</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setCollectorFile(e.target.files[0])}
                  />
                </Form.Group>
                
                <Form.Label>Collector Descriptions</Form.Label>
                {collectorDescriptions.map((desc, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={8}>
                      <Form.Control
                        placeholder="Description attribute"
                        value={desc.attribute}
                        onChange={(e) => handleCollectorDescriptionChange(index, 'attribute', e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder="Value"
                        value={desc.value}
                        onChange={(e) => handleCollectorDescriptionChange(index, 'value', e.target.value)}
                      />
                    </Col>
                  </Row>
                ))}
                
                <Button 
                  variant="secondary" 
                  onClick={addCollectorDescription} 
                  className="mb-3"
                >
                  Add Description
                </Button>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Uploading...' : 'Upload Collector'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UploadScreen;
