// --- START OF FILE src/screens/UploadScreen.js ---

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UploadScreen = () => {
  const { t } = useTranslation();
  const [itemFile, setItemFile] = useState(null);
  const [collectorFile, setCollectorFile] = useState(null);
  const [itemName, setItemName] = useState('');
  const [collectorName, setCollectorName] = useState('');
  // --- UPDATED: Item descriptions state holds only attributes (strings) ---
  const [itemDescriptions, setItemDescriptions] = useState(['']);
  const [collectorDescriptions, setCollectorDescriptions] = useState([
    { attribute: '', value: 0 } // Collector descriptions remain unchanged
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- UPDATED: Handler for adding an item description ---
  const addItemDescription = () => {
    setItemDescriptions([...itemDescriptions, '']); // Add an empty string for a new attribute
  };

  // --- Collector description handler remains the same ---
  const addCollectorDescription = () => {
    setCollectorDescriptions([...collectorDescriptions, { attribute: '', value: 0 }]);
  };

  // --- UPDATED: Handler for changing an item description (attribute) ---
  const handleItemDescriptionChange = (index, value) => {
    const newDescriptions = [...itemDescriptions];
    newDescriptions[index] = value; // Update the string at the given index
    setItemDescriptions(newDescriptions);
  };

  // --- Collector description handler remains the same ---
  const handleCollectorDescriptionChange = (index, field, value) => {
    const newDescriptions = [...collectorDescriptions];
    newDescriptions[index][field] = field === 'value' ? Number(value) : value;
    setCollectorDescriptions(newDescriptions);
  };

  // --- Item Upload Handler ---
  const handleItemUpload = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // --- UPDATED: Validation for item descriptions (check for empty strings) ---
    if (!itemFile || !itemName || itemDescriptions.some(desc => !desc.trim())) { // Check if any description is empty or just whitespace
      setMessage({ type: 'danger', text: t('uploadError', { type: t('item') }) });
      return;
    }

    const formData = new FormData();
    formData.append('image', itemFile);
    formData.append('name', itemName);

    let nextId; // Define nextId outside try block to use in message
    try {
        setLoading(true);
        const { data: items } = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
        nextId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;
        formData.append('id', nextId);
    } catch(error) {
        console.error("Failed to fetch items for ID generation:", error);
        setMessage({ type: 'danger', text: "Error determining next ID. Cannot upload."});
        setLoading(false);
        return;
    }

    // --- UPDATED: Stringify the descriptions (array of strings) ---
    // Backend controller needs to parse this correctly and map to [{attribute: 'desc1'}, {attribute: 'desc2'}] format for saving
    const descriptionsToSave = itemDescriptions.map(desc => ({ attribute: desc }));
    formData.append('descriptions', JSON.stringify(descriptionsToSave));

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({
        type: 'success',
        text: t('uploadSuccess', { type: t('Item'), id: nextId }) // Use nextId defined earlier
      });

      // --- Reset form ---
      setItemFile(null);
      setItemName('');
      setItemDescriptions(['']); // Reset to initial state (one empty string)

      // Clear file input element visually
      const itemFileInput = document.getElementById('itemImage');
      if (itemFileInput) itemFileInput.value = null;

    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message || t('error', { message: 'Upload failed' })
      });
    } finally {
       setLoading(false);
    }
  };

  // --- Collector Upload Handler (remains the same) ---
  const handleCollectorUpload = async (e) => {
     e.preventDefault();
     setMessage({ type: '', text: '' });

     if (!collectorFile || !collectorName || collectorDescriptions.some(desc => !desc.attribute || desc.value === undefined)) {
      setMessage({
        type: 'danger',
        text: t('uploadError', { type: t('collector') })
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', collectorFile);
    formData.append('name', collectorName);

    let nextId; // Define nextId outside try block to use in message
    try {
      setLoading(true);
      const { data: collectors } = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
      nextId = collectors.length > 0 ? Math.max(...collectors.map(c => c.id || 0)) + 1 : 1;

      formData.append('id', nextId);
      formData.append('descriptions', JSON.stringify(collectorDescriptions));

      await axios.post(`${process.env.REACT_APP_API_URL}/api/collectors`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({
        type: 'success',
        text: t('uploadSuccess', { type: t('Collector'), id: nextId })
      });

      // Reset form
      setCollectorFile(null);
      setCollectorName('');
      setCollectorDescriptions([{ attribute: '', value: 0 }]);
      const collectorFileInput = document.getElementById('collectorImage');
      if (collectorFileInput) collectorFileInput.value = null;

    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message || t('error', { message: 'Upload failed' })
      });
    } finally {
       setLoading(false);
    }
  };

  // --- Updated JSX Return ---
  return (
    <Container>
      <h1 className="my-4">{t('uploadTitle')}</h1>

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Row>
        {/* Item Upload Form */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h4">{t('uploadItem')}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleItemUpload}>
                {/* Item Name Input */}
                <Form.Group controlId="itemName" className="mb-3">
                  <Form.Label>{t('itemNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('itemNamePlaceholder')}
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* Item Image Input */}
                <Form.Group controlId="itemImage" className="mb-3">
                  <Form.Label>{t('itemImageLabel')} (Required)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setItemFile(e.target.files[0])}
                    required
                  />
                </Form.Group>

                {/* --- UPDATED: Item Descriptions Input (Attributes Only) --- */}
                <Form.Label>{t('descriptionsLabel')}</Form.Label>
                {itemDescriptions.map((descAttribute, index) => (
                  <Form.Group key={index} className="mb-3">
                    <Form.Control
                      placeholder={t('descAttributePlaceholder')}
                      value={descAttribute} // Bind directly to the string
                      onChange={(e) => handleItemDescriptionChange(index, e.target.value)}
                      required // Make attribute required
                    />
                  </Form.Group>
                 ))}
                 {/* --- End of Updated Item Descriptions --- */}

                <Button variant="secondary" onClick={addItemDescription} className="mb-3 me-2">
                  {t('addDescription')}
                </Button>
                 {/* Button to remove last item description */}
                 {itemDescriptions.length > 1 && (
                    <Button variant="outline-danger" onClick={() => setItemDescriptions(itemDescriptions.slice(0, -1))} className="mb-3">
                         Remove Last
                    </Button>
                 )}


                {/* Submit Button */}
                <div className="d-grid mt-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? t('uploading') : t('submitUploadItem')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Collector Upload Form (Structure remains the same) */}
        <Col md={6}>
          {/* ... (Collector form JSX remains unchanged) ... */}
           <Card className="mb-4">
            <Card.Header as="h4">{t('uploadCollector')}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCollectorUpload}>
                {/* Collector Name Input */}
                <Form.Group controlId="collectorName" className="mb-3">
                  <Form.Label>{t('collectorNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('collectorNamePlaceholder')}
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                     required
                  />
                </Form.Group>

                {/* Collector Image Input */}
                <Form.Group controlId="collectorImage" className="mb-3">
                  <Form.Label>{t('collectorImageLabel')} (Required)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCollectorFile(e.target.files[0])}
                    required
                  />
                </Form.Group>

                {/* Collector Descriptions Input */}
                <Form.Label>{t('descriptionsLabel')}</Form.Label>
                {collectorDescriptions.map((desc, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={8}>
                      <Form.Control
                        placeholder={t('descAttributePlaceholder')}
                        value={desc.attribute}
                        onChange={(e) => handleCollectorDescriptionChange(index, 'attribute', e.target.value)}
                        required
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder={t('descValuePlaceholder')}
                        value={desc.value}
                        onChange={(e) => handleCollectorDescriptionChange(index, 'value', e.target.value)}
                        required
                        step="any"
                      />
                    </Col>
                  </Row>
                ))}
                 <Button variant="secondary" onClick={addCollectorDescription} className="mb-3 me-2">
                  {t('addDescription')}
                </Button>
                 {collectorDescriptions.length > 1 && (
                    <Button variant="outline-danger" onClick={() => setCollectorDescriptions(collectorDescriptions.slice(0, -1))} className="mb-3">
                         Remove Last
                    </Button>
                 )}

                {/* Submit Button */}
                <div className="d-grid mt-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? t('uploading') : t('submitUploadCollector')}
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
// --- END OF FILE src/screens/UploadScreen.js ---